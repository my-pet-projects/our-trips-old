import { LoadingPage, LoadingSpinner } from "@/components/common/loading";
import { DropdownMenu } from "@/components/layout/drop-down-menu";
import { ModalDialog } from "@/components/layout/modal-dialog";
import { DynamicMap } from "@/components/leaflet/dynamic-map";
import { ItineraryPlaceIcon } from "@/components/leaflet/icon";
import { PointOfInterestDetails } from "@/components/poi/poi-details";
import { BasicAttractionInfo } from "@/server/api/routers/attraction";
import {
  Directions,
  Itinerary,
  ItineraryPlace,
  ItineraryPlaceAttraction,
} from "@/server/api/routers/itinerary";
import { api } from "@/utils/api";
import { PlusIcon } from "@heroicons/react/20/solid";
import { Attraction } from "@prisma/client";
import classNames from "classnames";
import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";
import { GiPathDistance } from "react-icons/gi";

const TripItineraryPage: NextPage<{ tripId: string }> = ({ tripId }) => {
  const [selectedPoi, setSelectedPoi] = useState<BasicAttractionInfo>();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [directions, setDirections] = useState<Directions[]>([]);
  const ctx = api.useContext();

  const { data: trip, isLoading: isTripLoading } = api.trip.findTrip.useQuery(
    {
      id: tripId,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: attractions, isLoading: isAttractionsLoading } =
    api.attraction.getAllAttractions.useQuery(
      { countryCodes: trip?.destinations.map((dest) => dest.country.cca2) },
      { refetchOnWindowFocus: false }
    );

  const { isLoading: isItinerariesLoading } =
    api.itinerary.fetchItineraries.useQuery(
      { tripId: tripId },
      {
        enabled: !!attractions,
        refetchOnWindowFocus: false,
        onSuccess(data) {
          setItineraries(data);
        },
      }
    );

  const { mutate: createItinerary, isLoading: isCreating } =
    api.itinerary.createItinerary.useMutation();

  const { mutate: deleteItinerary, isLoading: isDeleting } =
    api.itinerary.deleteItinerary.useMutation();

  const { mutate: addPlace, isLoading: isAdding } =
    api.itinerary.addPlace.useMutation({
      onSuccess: () => toast.success("Place added to the itinerary!"),
      onError: () =>
        toast.error("Failed to add place! Please try again later."),
    });

  const { mutate: removePlace, isLoading: isRemoving } =
    api.itinerary.removePlace.useMutation({
      onSuccess: () => toast.success("Place removed from the itinerary!"),
      onError: () =>
        toast.error("Failed to remove place! Please try again later."),
    });

  if (isTripLoading) {
    return <LoadingPage />;
  }

  function onPoiClick(item: BasicAttractionInfo): void {
    setSelectedPoi(item);
  }

  function onClose(): void {
    setSelectedPoi(undefined);
  }

  const addItinerary = () => {
    createItinerary(
      {
        name: `Day ${itineraries.length + 1}`,
        tripId: tripId,
        order: 1,
        colorId: itineraries.length + 1, // TODO: make smth smarter
      },
      {
        onSuccess: (data) => {
          ctx.itinerary.fetchItineraries.invalidate();
          toast.success("Itinerary created successfully!");
        },
        onError: (e) => {
          const errorMessages = e.data?.zodError?.fieldErrors;
          if (errorMessages) {
            for (let key in errorMessages) {
              let messages = errorMessages[key];
              if (messages && messages[0]) {
                toast.error(`${key}: ${messages[0]}`);
              }
            }
          } else {
            toast.error("Failed to create itinerary! Please try again later.");
          }
        },
      }
    );
  };

  const onAddToItinerary = (place: Attraction, itinerary: Itinerary): void => {
    addPlace(
      {
        itineraryId: itinerary.id,
        placeId: place.id,
        order: itinerary.places.length + 1,
      },
      {
        onSuccess(data) {
          const modifiedItineraries = itineraries.map((itin) => {
            if (itin.id === itinerary.id) {
              itin.places.push(data);
            }
            return itin;
          });
          setItineraries(modifiedItineraries);
        },
      }
    );
  };

  const onRemoveFromItinerary = (
    place: Attraction,
    itinerary: Itinerary
  ): void => {
    removePlace(
      {
        placeId: place.id,
        itineraryId: itinerary.id,
      },
      {
        onSuccess() {
          const modifyItineraries = itineraries.map((itin) => {
            if (itin.id === itinerary.id) {
              const places = itin.places.filter(
                (p) => p.attractionId !== place.id
              );
              return { ...itin, places: places };
            } else {
              return itin;
            }
          });
          setItineraries(modifyItineraries);
        },
      }
    );
  };

  const onDeleteItinerary = (itinerary: Itinerary) => {
    deleteItinerary(
      {
        id: itinerary.id,
      },
      {
        onSuccess: () => {
          const modifiedItineraries = itineraries.filter(
            (itin) => itin.id !== itinerary.id
          );
          setItineraries(modifiedItineraries);
          toast.success("Itinerary deleted!");
        },
        onError: () =>
          toast.error("Failed to delete itinerary! Please try again later."),
      }
    );
  };

  const onDirectionsCalculated = (data: Directions) => {
    const filtered = directions.filter(
      (dir) =>
        dir.placeIdOne !== data.placeIdOne && dir.placeIdTwo !== data.placeIdTwo
    );
    filtered.push(data);
    setDirections(filtered);
  };

  return (
    <>
      <Head>
        <title>Itinerary: {trip?.name}</title>
      </Head>
      <div>
        <div className="bg-white p-0">
          <div className="mx-auto grid grid-cols-12">
            <main className="col-span-5 p-6">
              {/* Page title & actions */}
              <div className="flex items-center justify-between border-b border-gray-200 py-4 px-8">
                <div>
                  <h2 className="text-lg font-medium leading-6 text-gray-900">
                    Itinerary constructor
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Build your itinerary for the trip.
                  </p>
                </div>
              </div>
              {/* Itinerary list */}
              <div className="mt-5 flex flex-col space-y-5">
                {itineraries.map((itinerary, index) => (
                  <ItineraryElement
                    key={itinerary.id}
                    itinerary={itinerary}
                    selectedPoi={selectedPoi}
                    onPoiClick={onPoiClick}
                    onDeleteItinerary={onDeleteItinerary}
                    onRemoveFromItinerary={onRemoveFromItinerary}
                    onDirectionsCalculated={onDirectionsCalculated}
                  />
                ))}

                <button
                  type="button"
                  className="inline-flex items-center self-start rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={addItinerary}
                >
                  <PlusIcon
                    className="-ml-0.5 mr-2 h-4 w-4"
                    aria-hidden="true"
                  />
                  Add itinerary
                </button>
              </div>
            </main>
            <aside className="col-span-7">
              <div className="sticky top-0">
                <div className="flex h-screen flex-col items-center">
                  <div className="z-0 h-full w-full">
                    <DynamicMap
                      places={attractions || []}
                      itineraries={itineraries}
                      selectedPoi={selectedPoi}
                      onPoiClick={onPoiClick}
                      directions={directions}
                    />
                  </div>
                  {selectedPoi && (
                    <div className="absolute bottom-0 z-10 mb-5 h-2/5 w-11/12">
                      <PointOfInterestDetails
                        id={selectedPoi.id}
                        onClose={onClose}
                        availableItineraries={itineraries || []}
                        onAddToItinerary={onAddToItinerary}
                        onRemoveFromItinerary={onRemoveFromItinerary}
                      />
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const tripId = context.params?.tripId;

  if (typeof tripId !== "string") {
    throw new Error("no tripId parameter");
  }

  return {
    props: {
      tripId,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default TripItineraryPage;

type ItineraryPlaceProps = {
  place: ItineraryPlace;
  selected: boolean;
  itinerary: Itinerary;
  onClick: (attraction: ItineraryPlaceAttraction) => void;
  onDelete: (
    attraction: ItineraryPlaceAttraction,
    itinerary: Itinerary
  ) => void;
};

const ItineraryPlaceElement = ({
  place,
  selected,
  itinerary,
  onClick,
  onDelete,
}: ItineraryPlaceProps) => {
  return (
    <div
      onClick={() => onClick(place.attraction)}
      className={classNames(
        "group flex flex-row items-center gap-5 rounded-lg border border-gray-200 bg-white p-4 shadow transition duration-300 ease-in-out hover:cursor-pointer hover:shadow-lg",
        selected ? "shadow-xl" : ""
      )}
    >
      <div
        className={classNames("flex items-center", selected ? "scale-150" : "")}
      >
        <ItineraryPlaceIcon color={itinerary.color.name} digit={place.order} />
      </div>
      <div>
        <h5 className="text-xl font-medium leading-tight text-neutral-800">
          {place.attraction?.name}
          <br />
          <small className="text-neutral-500">
            {place.attraction.nameLocal}
          </small>
        </h5>
      </div>
      <div className="invisible ml-auto group-hover:visible">
        <button
          type="button"
          className="bg-white text-gray-400 hover:text-gray-500"
          onClick={() => onDelete(place.attraction, itinerary)}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

type ItineraryElementProps = {
  itinerary: Itinerary;
  selectedPoi?: BasicAttractionInfo;
  onPoiClick(item: BasicAttractionInfo): void;
  onDeleteItinerary(itinerary: Itinerary): void;
  onRemoveFromItinerary(place: Attraction, itinerary: Itinerary): void;
  onDirectionsCalculated(data: Directions): void;
};

const ItineraryElement = ({
  itinerary,
  selectedPoi,
  onPoiClick,
  onRemoveFromItinerary,
  onDeleteItinerary,
  onDirectionsCalculated,
}: ItineraryElementProps) => {
  const [showEditModel, setShowEditModal] = useState(false);
  const ctx = api.useContext();

  const [nameInput, setNameInput] = useState(itinerary.name);

  const { mutate: updateItinerary, isLoading: isUpdating } =
    api.itinerary.updateItinerary.useMutation({
      onSuccess: () => {
        ctx.itinerary.fetchItineraries.invalidate();
        toast.success("Itinerary details updated!");
        setShowEditModal(false);
      },
      onError: (e) => {
        const errorMessages = e.data?.zodError?.fieldErrors;
        if (errorMessages) {
          for (let key in errorMessages) {
            let messages = errorMessages[key];
            if (messages && messages[0]) {
              toast.error(`${key}: ${messages[0]}`);
            }
          }
        } else {
          ("Failed to update itinerary details! Please try again later.");
        }
      },
    });

  const handleClose = () => setShowEditModal(false);
  const handleShow = () => {
    setNameInput(itinerary.name);
    setShowEditModal(true);
  };
  const handleConfirm = () => {
    updateItinerary({
      id: itinerary.id,
      name: nameInput,
    });
  };

  const sortedPlaces = itinerary.places.sort(
    (placeOne, placeTwo) => placeOne.order - placeTwo.order
  );

  return (
    <div>
      <div className="flex w-full items-center">
        <div className="flex-grow">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            {itinerary.name}
          </h3>
        </div>

        <DropdownMenu>
          <button
            className="group flex w-full items-center"
            type="button"
            onClick={handleShow}
          >
            <FaEdit className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Edit
          </button>
          <button
            className="group flex w-full items-center"
            type="button"
            onClick={() => onDeleteItinerary(itinerary)}
          >
            <FaTrash className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Delete
          </button>
        </DropdownMenu>
      </div>

      <div className="space-y-5 pt-5">
        {sortedPlaces.map((place, index) => (
          <>
            <ItineraryPlaceElement
              key={place.id}
              place={place}
              selected={selectedPoi?.id === place.attractionId}
              itinerary={itinerary}
              onClick={onPoiClick}
              onDelete={onRemoveFromItinerary}
            />
            {index !== itinerary.places.length - 1 && (
              <PlacesDistance
                start={place}
                end={sortedPlaces[index + 1]}
                onDirectionsCalculated={onDirectionsCalculated}
              />
            )}
          </>
        ))}
      </div>

      <ModalDialog
        isOpen={showEditModel}
        isBusy={isUpdating}
        title="Edit itinerary"
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      >
        <div className="flex items-center">
          <div className="flex-grow border-b border-gray-300 focus-within:border-indigo-600">
            <input
              type="text"
              name="name"
              id="name"
              className="block w-full border-0 border-b border-transparent bg-gray-50 text-sm focus:border-indigo-600 focus:ring-0"
              placeholder="Enter itinerary name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              disabled={isUpdating}
            />
          </div>
        </div>
      </ModalDialog>
    </div>
  );
};

type PlacesDistanceProps = {
  start: ItineraryPlace;
  end?: ItineraryPlace;
  onDirectionsCalculated: (data: Directions) => void;
};

const PlacesDistance = ({
  start,
  end,
  onDirectionsCalculated,
}: PlacesDistanceProps) => {
  if (!end) {
    return null;
  }

  const {
    data: trip,
    isLoading,
    refetch: recalculate,
    isRefetching,
  } = api.itinerary.getPlaceDistance.useQuery(
    {
      placeOne: {
        id: start.id,
        latitude: start.attraction.latitude,
        longitude: start.attraction.longitude,
      },
      placeTwo: {
        id: start.id,
        latitude: end.attraction.latitude,
        longitude: end.attraction.longitude,
      },
    },
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        onDirectionsCalculated(data);
      },
    }
  );

  const reCalculateDistances = () => {
    recalculate();
  };

  const isBusy = isLoading || isRefetching;

  return (
    <div className="flex h-5 flex-row justify-center gap-4">
      {isBusy && <LoadingSpinner />}
      {!isBusy && (
        <>
          {trip?.features[0] && (
            <span className="flex flex-row gap-2">
              <span className="text-sm">
                {(trip.features[0].properties.summary.distance / 1000).toFixed(
                  2
                )}{" "}
                km
              </span>
              <span className="text-sm">
                {(trip.features[0]?.properties.summary.duration / 60).toFixed(
                  2
                )}{" "}
                min
              </span>
            </span>
          )}
          <button
            className="group flex items-center"
            type="button"
            onClick={reCalculateDistances}
          >
            <GiPathDistance className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
          </button>
        </>
      )}
    </div>
  );
};

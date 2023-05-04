import { LoadingPage } from "@/components/common/loading";
import { DynamicMap } from "@/components/leaflet/dynamic-map";
import { ItineraryPlaceIcon } from "@/components/leaflet/icon";
import { PointOfInterestDetails } from "@/components/poi/poi-details";
import { BasicAttractionInfo } from "@/server/api/routers/attraction";
import {
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
import { FaTrash } from "react-icons/fa";
import { RiDeleteBack2Line } from "react-icons/ri";

const TripItineraryPage: NextPage<{ tripId: string }> = ({ tripId }) => {
  const [selectedPoi, setSelectedPoi] = useState<BasicAttractionInfo>();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);

  const { data: trip, isLoading: isTripLoading } = api.trip.findTrip.useQuery({
    id: tripId,
  });

  const { data: attractions, isLoading: isAttractionsLoading } =
    api.attraction.getAllAttractions.useQuery({ countryCode: "IN" });

  const { isLoading: isItinerariesLoading } =
    api.itinerary.fetchItineraries.useQuery(
      { tripId: tripId },
      {
        enabled: !!attractions,
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

  const addFields = () => {
    createItinerary(
      {
        name: "day",
        tripId: tripId,
        order: 1,
        colorId: itineraries.length + 1, // TODO: make smth smarter
      },
      {
        onSuccess: (data) => {
          setItineraries([...itineraries, data as Itinerary]);
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
    placeId: string,
    itinerary: Itinerary
  ): void => {
    removePlace(
      {
        placeId: placeId,
        itineraryId: itinerary.id,
      },
      {
        onSuccess() {
          const modifyItineraries = itineraries.map((itin) => {
            if (itin.id === itinerary.id) {
              const places = itin.places.filter(
                (p) => p.attractionId !== placeId
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

  return (
    <>
      <Head>
        <title>Itinerary: {trip?.name}</title>
      </Head>
      <div>
        <div className="bg-white p-0">
          <div className="mx-auto grid grid-cols-12">
            <main className="col-span-6 p-6">
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
                  <div key={index}>
                    <div className="flex w-full items-center">
                      <div className="flex-grow border-b border-gray-300 focus-within:border-indigo-600">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          className="block w-full border-0 border-b border-transparent bg-gray-50 focus:border-indigo-600 focus:ring-0 sm:text-sm"
                          placeholder={itinerary.name}
                        />
                      </div>

                      <button
                        type="button"
                        className="mr-2 inline-flex items-center rounded-full bg-blue-700 p-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        onClick={() => onDeleteItinerary(itinerary)}
                      >
                        <RiDeleteBack2Line />
                      </button>
                    </div>

                    <div className="space-y-5 pt-5">
                      {itinerary.places.map((place) => (
                        <ItineraryPlaceElement
                          key={place.id}
                          place={place}
                          selected={selectedPoi?.id === place.attractionId}
                          itineraryColor={itinerary.color.name}
                          onClick={onPoiClick}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="inline-flex items-center self-start rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={addFields}
                >
                  <PlusIcon
                    className="-ml-0.5 mr-2 h-4 w-4"
                    aria-hidden="true"
                  />
                  Add itinerary
                </button>
              </div>
            </main>
            <aside className="col-span-6">
              <div className="sticky top-0">
                <div className="flex h-screen flex-col items-center ">
                  <div className="z-0 h-full w-full">
                    <DynamicMap
                      places={attractions || []}
                      itineraries={itineraries}
                      selectedPoi={selectedPoi}
                      onPoiClick={onPoiClick}
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
  itineraryColor: string;
  onClick: (attraction: ItineraryPlaceAttraction) => void;
};

const ItineraryPlaceElement = ({
  place,
  selected,
  itineraryColor,
  onClick,
}: ItineraryPlaceProps) => {
  const onDelete = () => {};

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
        <ItineraryPlaceIcon color={itineraryColor} digit={place.order} />
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
          onClick={onDelete}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

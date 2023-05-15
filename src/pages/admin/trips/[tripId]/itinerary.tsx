import { LoadingPage } from "@/components/common/loading";
import { ItineraryPlan } from "@/components/itinerary/itinerary-plan";
import { DynamicMap } from "@/components/leaflet/dynamic-map";
import { PointOfInterestDetails } from "@/components/poi/poi-details";
import { BasicAttractionInfo } from "@/server/api/routers/attraction";
import {
  Directions,
  Itinerary,
  ItineraryPlace,
} from "@/server/api/routers/itinerary";
import { api } from "@/utils/api";
import { PlusIcon } from "@heroicons/react/20/solid";
import { Attraction } from "@prisma/client";
import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import toast from "react-hot-toast";

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
        attractionId: place.id,
        itineraryId: itinerary.id,
      },
      {
        onSuccess() {
          let placesToRemove = [] as ItineraryPlace[];
          const modifyItineraries = itineraries.map((itin) => {
            if (itin.id === itinerary.id) {
              placesToRemove =
                itin.places.filter((p) => p.attractionId === place.id) || [];
              const places = itin.places.filter(
                (p) => p.attractionId !== place.id
              );
              console.log(place, itin.places, places);
              return { ...itin, places: places };
            } else {
              return itin;
            }
          });
          console.log(modifyItineraries);
          setItineraries(modifyItineraries);
          console.log("placesToRemove", placesToRemove);

          placesToRemove.forEach((p) => {
            const newDir = directions.filter(
              (dir) => dir.placeIdOne !== p.id && dir.placeIdTwo !== p.id
            );
            console.log(newDir);
            setDirections(() => newDir);
          });
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
    // if (exists) {
    //   console.log("exists");
    //   return;
    // }

    setDirections((directions) => {
      console.log(
        "dir data " + data.placeIdOne + "->" + data.placeIdTwo,
        directions.map((d) => d.placeIdOne + "->" + d.placeIdTwo)
      );

      // const newDir = directions.map((dir) => {
      //   console.log("dir cur", dir.placeIdOne, dir.placeIdTwo);
      //   if (
      //     dir.placeIdOne === data.placeIdOne &&
      //     dir.placeIdTwo !== data.placeIdTwo
      //   ) {
      //     console.log("dir replace");
      //     return data;
      //   }
      //   console.log("dir use exissting");

      //   return dir;
      // });
      // let newDirs = [] as Directions[];

      // console.log(
      //   "dir before",
      //   directions.map((d) => d.placeIdOne + "->" + d.placeIdTwo)
      // );

      // // changes either start of end
      // const currentDirs = directions.filter(
      //   (dir) =>
      //     dir.placeIdOne !== data.placeIdOne ||
      //     dir.placeIdTwo !== data.placeIdTwo
      // );

      // newDirs = currentDirs;

      // console.log(
      //   "current dirs",
      //   currentDirs.map((d) => d.placeIdOne + "->" + d.placeIdTwo)
      // );

      // const exists = directions.find(
      //   (dir) =>
      //     dir.placeIdOne === data.placeIdOne &&
      //     dir.placeIdTwo === data.placeIdTwo
      // );
      // if (!exists) {
      //   console.log("dir not exists, adding");
      //   newDirs = [...directions, data];
      // }

      // console.log("dir final", newDirs);

      let newDirs = [...directions];

      console.log(
        "current dirs",
        newDirs.map((d) => d.placeIdOne + "->" + d.placeIdTwo)
      );

      newDirs = newDirs.filter((existingDir) => {
        if (
          (data.placeIdOne === existingDir.placeIdOne &&
            data.placeIdTwo !== existingDir.placeIdTwo) ||
          (data.placeIdTwo === existingDir.placeIdTwo &&
            data.placeIdOne !== existingDir.placeIdOne)
        ) {
          return false;
        }
        return true;
      });

      console.log(
        "newDirs",
        newDirs.map((d) => d.placeIdOne + "->" + d.placeIdTwo)
      );

      const exists = directions.find(
        (dir) =>
          dir.placeIdOne === data.placeIdOne &&
          dir.placeIdTwo === data.placeIdTwo
      );
      if (!exists) {
        console.log("dir not exists, adding");
        newDirs = [...newDirs, data];
      }

      // newDirs = newDirs.filter((dir) => data.placeIdOne !== dir.placeIdTwo);
      // newDirs = newDirs.filter((dir) => {
      //   if (data.placeIdOne !== dir.placeIdTwo) {
      //     return false;
      //   }
      //   return true;
      // });

      // console.log(
      //   "current dirs after removal",
      //   newDirs.map((d) => d.placeIdOne + "->" + d.placeIdTwo)
      // );

      return newDirs;
    });
  };

  const onChangeInItinerary = (
    itinerary: Itinerary,
    places: ItineraryPlace[]
  ) => {
    const modifyItineraries = itineraries.map((itin) => {
      if (itin.id === itinerary.id) {
        return { ...itin, places: places };
      }
      return itin;
    });
    setItineraries(modifyItineraries);
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
                  <ItineraryPlan
                    key={itinerary.id}
                    itinerary={itinerary}
                    selectedPoi={selectedPoi}
                    onPoiClick={onPoiClick}
                    onDeleteItinerary={onDeleteItinerary}
                    onRemoveFromItinerary={onRemoveFromItinerary}
                    onChangeInItinerary={onChangeInItinerary}
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

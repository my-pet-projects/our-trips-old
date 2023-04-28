import { LoadingPage } from "@/components/common/loading";
import { DynamicMap } from "@/components/leaflet/dynamic-map";
import { BasicAttractionInfo } from "@/components/leaflet/map";
import { PointOfInterestDetails } from "@/components/poi/poi-details";
import { api } from "@/utils/api";
import { PlusIcon } from "@heroicons/react/20/solid";
import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useState } from "react";

const TripItineraryPage: NextPage<{ tripId: string }> = ({ tripId }) => {
  const [selectedPoi, setSelectedPoi] = useState<BasicAttractionInfo>();
  const [itineraries, setItineraries] = useState([
    {
      name: "day 1",
    },
  ]);

  const { data: trip, isLoading: isTripLoading } = api.trip.findTrip.useQuery({
    id: tripId,
  });

  const { data: attractions, isLoading: isAttractionsLoading } =
    api.attraction.getAllAttractions.useQuery({ countryCode: "IN" });

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
    let newfield = { name: "", age: "" };

    setItineraries([...itineraries, newfield]);
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
                    Itineraty constructor
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Build your itinerary for the trip.
                  </p>
                </div>
              </div>
              {/* Itinerary list */}
              <div className="flex flex-col gap-3">
                {itineraries.map((itinerary, index) => (
                  <div
                    key={index}
                    className="mt-1 border-b border-gray-300 focus-within:border-indigo-600"
                  >
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="block w-full border-0 border-b border-transparent bg-gray-50 focus:border-indigo-600 focus:ring-0 sm:text-sm"
                      placeholder={itinerary.name}
                    />
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
                      items={attractions || []}
                      selectedPoi={selectedPoi}
                      onPoiClick={onPoiClick}
                    />
                  </div>
                  {selectedPoi && (
                    <div className="absolute bottom-0 z-10 mb-5 h-1/4 w-11/12">
                      <PointOfInterestDetails
                        id={selectedPoi.id}
                        onClose={onClose}
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

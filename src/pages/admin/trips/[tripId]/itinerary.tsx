import { LoadingPage } from "@/components/common/loading";
import { DynamicMap } from "@/components/leaflet/dynamic-map";
import { BasicAttractionInfo } from "@/components/leaflet/map";
import { PointOfInterestDetails } from "@/components/poi/poi-details";
import { api } from "@/utils/api";
import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useState } from "react";

const TripItineraryPage: NextPage<{ tripId: string }> = ({ tripId }) => {
  const [selectedPoi, setSelectedPoi] = useState<BasicAttractionInfo>();

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

  return (
    <>
      <Head>
        <title>Itinerary: {trip?.name}</title>
      </Head>
      <div>
        <div className="bg-white p-0">
          <div className="mx-auto grid grid-cols-12">
            <main className="col-span-6">
              {JSON.stringify(trip)}
              {JSON.stringify(trip)}
              {JSON.stringify(trip)}
              {JSON.stringify(trip)}
              {JSON.stringify(trip)}
              {JSON.stringify(trip)}
              {JSON.stringify(trip)}
              {JSON.stringify(trip)}
              {JSON.stringify(trip)}
              {JSON.stringify(trip)}
              {JSON.stringify(trip)}
              {JSON.stringify(trip)}
              {JSON.stringify(trip)}
              {JSON.stringify(trip)}
              {JSON.stringify(trip)}
              {JSON.stringify(trip)}
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

import { LoadingPage } from "@/components/common/loading";
import { DynamicMap } from "@/components/leaflet/dynamic-map";
import { PointOfInterestDetails } from "@/components/poi/poi-details";
import { BasicAttractionInfo } from "@/server/api/routers/attraction";
import { api } from "@/utils/api";
import type { City, Country } from "@prisma/client";
import Head from "next/head";
import { useState } from "react";

function Plans() {
  const [city, setCity] = useState<City | undefined>(undefined);
  const [country, setCountry] = useState<Country | undefined>(undefined);

  const [selectedPoi, setSelectedPoi] = useState<BasicAttractionInfo>();

  const { data: attractions, isLoading } =
    api.attraction.getAllAttractions.useQuery({
      cityId: city?.oldIdForDelete,
      countryCodes: country ? [country.cca2] : undefined,
    });

  function onPoiClick(item: BasicAttractionInfo): void {
    setSelectedPoi(item);
  }

  function onClose(): void {
    setSelectedPoi(undefined);
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      <Head>
        <title>Available attractions</title>
      </Head>
      {/* Page title & actions */}
      <div className="flex items-center justify-between border-b border-gray-200 px-8 py-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-medium leading-6 text-gray-900">
            Available attractions
          </h1>
        </div>
      </div>
      {/* Map */}
      <div className="relative flex h-[calc(100vh-57px)] flex-col items-center">
        <div className="z-0 h-full w-full">
          <DynamicMap
            places={attractions || []}
            itineraries={[]}
            selectedPoi={selectedPoi}
            onPoiClick={onPoiClick}
            directions={[]}
          />
        </div>
        {selectedPoi && (
          <div className="fixed bottom-0 z-10 mb-5 h-3/5 w-11/12 shadow-lg shadow-slate-500 sm:absolute">
            <PointOfInterestDetails
              id={selectedPoi.id}
              onClose={onClose}
              availableItineraries={[]}
              onAddToItinerary={() => {}}
              onRemoveFromItinerary={() => {}}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default Plans;

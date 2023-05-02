import { DynamicMap } from "@/components/leaflet/dynamic-map";
import { BasicAttractionInfo } from "@/server/api/routers/attraction";
import { api } from "@/utils/api";
import type { City, Country } from "@prisma/client";
import Head from "next/head";
import { useState } from "react";

function Plans() {
  const [city, setCity] = useState<City | undefined>(undefined);
  const [country, setCountry] = useState<Country | undefined>(undefined);

  const { data: result, isLoading } = api.attraction.getAllAttractions.useQuery(
    {
      cityId: city?.id,
      countryCode: country?.cca2,
    }
  );

  function onPoiClick(item: BasicAttractionInfo): void {
    console.log(item);
  }

  return (
    <>
      <Head>
        <title>Plans</title>
      </Head>
      {/* Page title & actions */}
      <div className="flex items-center justify-between border-b border-gray-200 py-4 px-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-medium leading-6 text-gray-900">Plans</h1>
        </div>
      </div>
      {/* Map */}
      {isLoading && (
        <div className="mt-8">
          <div>Loading attractions ...</div>
        </div>
      )}
      {!isLoading && result && (
        <div className="mt-8">
          <div className="inline-block min-w-full border-b border-gray-200 align-middle"></div>
          <DynamicMap
            places={result}
            onPoiClick={onPoiClick}
            itineraries={[]}
          />
        </div>
      )}
    </>
  );
}

export default Plans;

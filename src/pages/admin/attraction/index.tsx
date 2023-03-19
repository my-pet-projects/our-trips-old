import Pagination from "@/components/common/pagination";
import GeographyPicker from "@/components/geography/geography-picker";
import { api } from "@/utils/api";
import type { City, Country } from "@prisma/client";
import Head from "next/head";
import { useState } from "react";

function Attractions() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [city, setCity] = useState<City | undefined>(undefined);
  const [country, setCountry] = useState<Country | undefined>(undefined);
  const itemsPerPage = 10;

  const { data: result, isLoading } = api.attraction.getAttractions.useQuery({
    cityId: city?.id,
    countryCode: country?.cca2,
    take: itemsPerPage,
    skip: (currentPage - 1) * itemsPerPage,
  });

  return (
    <>
      <Head>
        <title>Attraction catalog</title>
      </Head>
      {/* Page title & actions */}
      <div className="flex items-center justify-between border-b border-gray-200 py-4 px-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-medium leading-6 text-gray-900">
            Attractions
          </h1>
        </div>
        <div className="mt-0 ml-4 flex">
          <button
            type="button"
            className="order-0 inline-flex items-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:order-1 sm:ml-3"
          >
            Create
          </button>
        </div>
      </div>
      {/* Attractions filter */}
      <div className="mt-6 px-8">
        <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Filter
        </h2>
        <div>
          <GeographyPicker
            onCityChange={(city) => setCity(city)}
            onCountryChange={(country) => setCountry(country)}
          />
        </div>
      </div>
      {/* Attraction list */}
      {isLoading && (
        <div className="mt-8">
          <div>Loading attractions ...</div>
        </div>
      )}
      {!isLoading && result && result.data && (
        <div className="mt-8">
          <div className="inline-block min-w-full border-b border-gray-200 align-middle">
            <table className="min-w-full">
              <thead>
                <tr className="border-t border-gray-200">
                  <th className="border-b border-gray-200 bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <span className="pl-2">Name</span>
                  </th>
                  <th className="border-b border-gray-200 bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Location
                  </th>
                  <th className="border-b border-gray-200 bg-gray-50 py-3 pr-6 text-right text-xs font-medium uppercase tracking-wider text-gray-500" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {result &&
                  result.data &&
                  result.data.map((attraction) => (
                    <tr key={attraction.id}>
                      <td className="w-full max-w-0 whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-900">
                        <div className="flex items-center space-x-3 pl-2">
                          <a href="#" className="truncate hover:text-gray-600">
                            <span>{attraction.name} </span>
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span>{attraction.city.countryCode}</span>
                          <span>{attraction.city.name}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-right text-sm font-medium">
                        <a
                          href="#"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </a>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div>
            {result && (
              <Pagination
                currentPage={currentPage}
                totalItems={result.total}
                pageSize={itemsPerPage}
                onPageChange={(pageNum) => setCurrentPage(pageNum)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Attractions;

import { api } from "@/utils/api";
import Head from "next/head";
import Link from "next/link";

function Trips() {
  const { data: result, isLoading } = api.trip.getTrips.useQuery();

  return (
    <>
      <Head>
        <title>Trips catalog</title>
      </Head>
      {/* Page title & actions */}
      <div className="flex items-center justify-between border-b border-gray-200 py-4 px-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-medium leading-6 text-gray-900">Trips</h1>
        </div>
        <div className="mt-0 ml-4 flex">
          <Link
            type="button"
            href="/admin/trips/create"
            className="order-0 inline-flex items-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:order-1 sm:ml-3"
          >
            Create
          </Link>
        </div>
      </div>
      {/* Attraction list */}
      {isLoading && (
        <div className="mt-8">
          <div>Loading trips ...</div>
        </div>
      )}
      {!isLoading && result && (
        <div className="mt-8">
          <div className="inline-block min-w-full border-b border-gray-200 align-middle">
            <table className="min-w-full">
              <thead>
                <tr className="border-t border-gray-200">
                  <th className="border-b border-gray-200 bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <span className="pl-2">Name</span>
                  </th>
                  <th className="border-b border-gray-200 bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Destinations
                  </th>
                  <th className="border-b border-gray-200 bg-gray-50 py-3 pr-6 text-right text-xs font-medium uppercase tracking-wider text-gray-500" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {result &&
                  result.map((trip) => (
                    <tr key={trip.id}>
                      <td className="w-full max-w-0 whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-900">
                        <div className="flex items-center space-x-3 pl-2">
                          <a href="#" className="truncate hover:text-gray-600">
                            <span>{trip.name} </span>
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-500">
                        <div className="flex items-center space-x-2">
                          {trip.destinations &&
                            trip.destinations.map((destination) => (
                              <span key={destination.countryId}>
                                {destination.country.nameCommon}
                              </span>
                            ))}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-right text-sm font-medium">
                        <Link
                          href={`/admin/trip/edit/${trip.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default Trips;

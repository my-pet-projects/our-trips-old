import Head from "next/head";

function Attractions() {
  const attractions = [
    { id: 1, name: "attraction 1" },
    { id: 2, name: "attraction 2" },
  ];

  return (
    <>
      <Head>
        <title>Attraction catalog</title>
      </Head>
      {/* Page title & actions */}
      <div className="border-b border-gray-200 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-medium leading-6 text-gray-900 sm:truncate">
            Attractions
          </h1>
        </div>
        <div className="mt-4 flex sm:mt-0 sm:ml-4">
          <button
            type="button"
            className="order-0 inline-flex items-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:order-1 sm:ml-3"
          >
            Create
          </button>
        </div>
      </div>
      {/* Attractions filter */}
      <div className="mt-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Filter
        </h2>
      </div>
      {/* Attraction list */}
      <div className="mt-8 hidden sm:block">
        <div className="inline-block min-w-full border-b border-gray-200 align-middle">
          <table className="min-w-full">
            <thead>
              <tr className="border-t border-gray-200">
                <th className="border-b border-gray-200 bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <span className="lg:pl-2">Name</span>
                </th>
                <th className="border-b border-gray-200 bg-gray-50 py-3 pr-6 text-right text-xs font-medium uppercase tracking-wider text-gray-500" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {attractions.map((attraction) => (
                <tr key={attraction.id}>
                  <td className="w-full max-w-0 whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center space-x-3 lg:pl-2">
                      <div aria-hidden="true" />
                      <a href="#" className="truncate hover:text-gray-600">
                        <span>{attraction.name} </span>
                      </a>
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
      </div>
    </>
  );
}

export default Attractions;

import { api } from "@/utils/api";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import type { City, Country } from "@prisma/client";
import classNames from "classnames";
import { useMemo, useState } from "react";

interface CityPickerProps {
  countryCode: string;
  selectedCity: Country | undefined;
  setSelectedCity: (value: Country) => void;
}

export const CityPicker = ({
  countryCode,
  selectedCity,
  setSelectedCity,
}: CityPickerProps) => {
  const { data: cities, isLoading } = api.geography.getCities.useQuery(
    {
      countryCode: countryCode,
    },
    {
      enabled: !!countryCode,
    }
  );

  const [query, setQuery] = useState("");

  const filteredCities = useMemo(() => {
    if (!cities) {
      return [];
    }
    return query === ""
      ? cities
      : cities.filter((city) => {
          return city.name.toLowerCase().includes(query.toLowerCase());
        });
  }, [query, cities]);

  if (!countryCode) {
    return (
      <div className="relative mt-1">
        <input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:shadow-none sm:text-sm"
          disabled
          value="Select a country first"
        />
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    <Combobox value={selectedCity} onChange={setSelectedCity}>
      <div className="relative mt-1">
        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(city: City) => city.name}
          autoComplete="off"
          placeholder={"Select a city"}
        />

        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredCities && filteredCities.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredCities.map((city) => (
              <Combobox.Option
                key={city.id}
                value={city}
                className={({ active }) =>
                  classNames(
                    "relative cursor-default select-none py-1 pl-3 pr-9",
                    active ? "bg-indigo-600 text-white" : "text-gray-900"
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <div className="flex items-center">
                      <span className="ml-2 flex flex-col">
                        <span
                          className={classNames(
                            "truncate leading-tight",
                            selected && "font-semibold"
                          )}
                        >
                          {city.name}
                        </span>
                        <span
                          className={classNames(
                            "truncate text-xs leading-tight text-gray-500",
                            active ? "text-indigo-200" : "text-gray-500"
                          )}
                        >
                          {city.alternateNames}
                        </span>
                      </span>
                    </div>

                    {selected && (
                      <span
                        className={classNames(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-indigo-600"
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
};

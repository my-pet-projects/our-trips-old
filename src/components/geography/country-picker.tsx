import { api } from "@/utils/api";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import type { Country } from "@prisma/client";
import classNames from "classnames";
import Image from "next/image";
import { useMemo, useState } from "react";

interface CountryPickerProps {
  selectedCountry: Country | undefined;
  setSelectedCountry: (value: Country) => void;
}

export const CountryPicker = ({
  selectedCountry,
  setSelectedCountry,
}: CountryPickerProps) => {
  const { data: countries, isLoading } = api.geography.getCountries.useQuery();
  const [query, setQuery] = useState("");

  const filteredCountries = useMemo(() => {
    if (!countries) {
      return [];
    }
    return query === ""
      ? countries
      : countries.filter((country) => {
          return country.nameCommon.toLowerCase().includes(query.toLowerCase());
        });
  }, [query, countries]);

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    <Combobox as="div" value={selectedCountry} onChange={setSelectedCountry}>
      <div className="relative mt-1">
        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(country: Country) => country.nameCommon}
          autoComplete="off"
          placeholder={"Select a country"}
        />

        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredCountries && filteredCountries.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredCountries.map((country) => (
              <Combobox.Option
                key={country.cca2}
                value={country}
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
                      <Image
                        src={country.flagPng}
                        alt={country.nameCommon}
                        className="h-6 w-6 flex-shrink-0"
                        width={24}
                        height={24}
                      />
                      <span className="ml-2 flex flex-col">
                        <span
                          className={classNames(
                            "truncate leading-tight",
                            selected && "font-semibold"
                          )}
                        >
                          {country.nameCommon}
                        </span>
                        <span
                          className={classNames(
                            "truncate text-xs leading-tight text-gray-500",
                            active ? "text-indigo-200" : "text-gray-500"
                          )}
                        >
                          {country.nameOfficial}
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

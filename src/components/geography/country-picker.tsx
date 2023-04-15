import { LoadingSpinner } from "@/components/common/loading";
import { api } from "@/utils/api";
import type { Country } from "@prisma/client";
import classNames from "classnames";
import { useCombobox } from "downshift";
import Image from "next/image";
import { useEffect, useState } from "react";

type CountryPickerProps = {
  selectedCountry?: Country | null;
  onChange: (event?: string) => void;
  onSelectedCountryChange: (country?: Country | null) => void;
};

export const CountryPicker = ({
  selectedCountry,
  onChange,
  onSelectedCountryChange,
}: CountryPickerProps) => {
  const { data: countries, isLoading } = api.geography.getCountries.useQuery();

  const [currentCountry, setCurrentCountry] = useState<
    Country | undefined | null
  >({
    nameCommon: "",
  } as Country);
  const [allItems, setAllItems] = useState<Country[]>([]);
  const [filteredItems, setItems] = useState<Country[]>([]);

  useEffect(() => {
    if (countries) {
      setItems(countries);
      setAllItems(countries);
    }
  }, [countries]);

  useEffect(() => {
    if (selectedCountry) {
      setCurrentCountry(selectedCountry);
    }
  }, [selectedCountry]);

  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectItem,
  } = useCombobox({
    id: "country-picker",
    onSelectedItemChange: ({ inputValue, selectedItem }) => {
      onChange(inputValue);
      onSelectedCountryChange(selectedItem);
      setCurrentCountry(selectedItem);
    },
    onInputValueChange: ({ inputValue }) => {
      setItems(
        allItems.filter(
          (country) =>
            !inputValue ||
            country.nameCommon.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
    },
    items: filteredItems,
    selectedItem: currentCountry,
    itemToString(country) {
      return country ? country.nameCommon : "";
    },
  });

  return (
    <div>
      <div className="relative mt-1">
        <input
          placeholder="Select a country"
          autoComplete="off"
          className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          {...getInputProps({ disabled: isLoading })}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center px-2">
            <LoadingSpinner />
          </div>
        )}
        {!isLoading && (
          <>
            <button
              aria-label="clear selection"
              className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-12 focus:outline-none"
              type="button"
              onClick={() => {
                selectItem(null);
              }}
              tabIndex={-1}
            >
              &#215;
            </button>
            <button
              aria-label="toggle menu"
              className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
              type="button"
              {...getToggleButtonProps()}
            >
              {isOpen ? (
                <span className="h-5 w-5 text-gray-400">&#8593;</span>
              ) : (
                <span className="h-5 w-5 text-gray-400">&#8595;</span>
              )}
            </button>
          </>
        )}
      </div>
      <ul
        className={classNames(
          "absolute z-10 mt-1 max-h-60 w-2/5 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
          !(isOpen && filteredItems.length) ? "hidden" : ""
        )}
        {...getMenuProps()}
      >
        {isOpen &&
          filteredItems.map((item, index) => (
            <li
              className={classNames(
                highlightedIndex === index && "bg-blue-300",
                selectedCountry === item && "font-bold",
                "flex flex-col py-2 px-3 shadow-sm"
              )}
              key={item.cca2}
              {...getItemProps({ item, index })}
            >
              <div className="flex items-center">
                <Image
                  src={item.flagPng}
                  alt={item.nameCommon}
                  className="h-6 w-6 flex-shrink-0"
                  width={24}
                  height={24}
                />

                <span className="ml-2 flex flex-col">
                  <span
                    className={classNames(
                      "truncate leading-tight",
                      selectedCountry === item && "font-semibold"
                    )}
                  >
                    {item.nameCommon}
                  </span>
                  <span
                    className={classNames(
                      "truncate text-xs leading-tight text-gray-500",
                      selectedCountry === item
                        ? "text-indigo-200"
                        : "text-gray-500"
                    )}
                  >
                    {item.nameOfficial}
                  </span>
                </span>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

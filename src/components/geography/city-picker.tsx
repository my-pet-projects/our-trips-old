import { api } from "@/utils/api";
import { City } from "@prisma/client";
import classNames from "classnames";
import { useCombobox } from "downshift";
import { ChangeEvent, useEffect, useState } from "react";
import { LoadingSpinner } from "../common/loading";

type CityPickerProps = {
  countryCode?: string;
  selectedCity?: City | null;
  onChange: (event: string | ChangeEvent<Element>) => void;
  onSelectedCityChange: (city?: City | null) => void;
};

export const CityPicker = ({
  countryCode,
  selectedCity,
  onChange,
  onSelectedCityChange,
}: CityPickerProps) => {
  const { data: cities, isLoading } = api.geography.getCities.useQuery(
    {
      countryCode: countryCode!,
    },
    {
      enabled: !!countryCode,
    },
  );

  const [currentCountryCode, setCurrentCountryCode] = useState<
    string | undefined
  >();
  const [currentCity, setCurrentCity] = useState<City | undefined | null>({
    name: "",
  } as City);
  const [allItems, setAllItems] = useState<City[]>([]);
  const [filteredItems, setItems] = useState<City[]>([]);

  useEffect(() => {
    if (cities) {
      setItems(cities);
      setAllItems(cities);
    }
  }, [cities]);

  useEffect(() => {
    if (!countryCode || countryCode !== currentCountryCode) {
      setCurrentCity(null);
    }
    if (selectedCity && countryCode === currentCountryCode) {
      setCurrentCity(selectedCity);
    }
    setCurrentCountryCode(countryCode);
  }, [currentCountryCode, countryCode, selectedCity]);

  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectItem,
  } = useCombobox({
    id: "city-picker",
    onSelectedItemChange: ({ inputValue, selectedItem }) => {
      onChange(inputValue || "");
      onSelectedCityChange(selectedItem);
      setCurrentCity(selectedItem);
    },
    onInputValueChange: ({ inputValue }) => {
      setItems(
        allItems.filter(
          (city) =>
            !inputValue ||
            city.name.toLowerCase().includes(inputValue.toLowerCase()),
        ),
      );
    },
    items: filteredItems,
    selectedItem: currentCity,
    itemToString(city) {
      return city ? city.name : "";
    },
  });

  return (
    <div>
      <div>
        <div className="relative mt-1">
          <input
            placeholder={
              countryCode ? "Select a city" : "Select a country first"
            }
            className="w-full rounded-md border border-gray-300  py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            {...getInputProps({ disabled: isLoading })}
          />
          {isLoading && countryCode && (
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
      </div>
      <ul
        className={classNames(
          "absolute z-10 mt-1 max-h-60 w-2/5 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm",
          !(isOpen && filteredItems.length) ? "hidden" : "",
        )}
        {...getMenuProps()}
      >
        {isOpen &&
          filteredItems.map((item, index) => (
            <li
              className={classNames(
                highlightedIndex === index && "bg-blue-300",
                selectedCity === item && "font-bold",
                "flex flex-col px-3 py-2 shadow-sm",
              )}
              key={item.oldIdForDelete}
              {...getItemProps({ item, index })}
            >
              <div className="flex items-center">
                <span className="ml-2 flex flex-col">
                  <span
                    className={classNames(
                      "truncate leading-tight",
                      selectedCity === item && "font-semibold",
                    )}
                  >
                    {item.name}
                  </span>
                  <span
                    className={classNames(
                      "truncate text-xs leading-tight text-gray-500",
                      selectedCity === item
                        ? "text-indigo-200"
                        : "text-gray-500",
                    )}
                  >
                    {item.countryCode}
                  </span>
                </span>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

import type { City, Country } from "@prisma/client";
import { ChangeEvent, useEffect, useState } from "react";
import { CityPicker } from "./city-picker";
import { CountryPicker } from "./country-picker";

const GeographyPicker: React.FC<{
  country?: Country | null;
  city?: City | null;
  onCountryChange: (value?: Country | null) => void;
  onCityChange: (value?: City | null) => void;
}> = (props) => {
  const [selectedCountry, setSelectedCountry] = useState<
    Country | null | undefined
  >(props.country);
  const [selectedCity, setSelectedCity] = useState<City | null | undefined>(
    props.city
  );

  useEffect(() => {
    if (selectedCountry?.cca2 !== selectedCity?.countryCode) {
      setSelectedCity(null);
    }
    props.onCountryChange(selectedCountry);
    props.onCityChange(selectedCity);
  }, [props, selectedCountry, selectedCity]);

  function onChange(event: string | ChangeEvent<Element>): void {
    console.log(event);
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-5 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <CountryPicker
            selectedCountry={selectedCountry}
            onSelectedCountryChange={setSelectedCountry}
            onChange={onChange}
          />
        </div>

        {selectedCountry && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <CityPicker
              countryCode={selectedCountry?.cca2}
              selectedCity={selectedCity}
              onSelectedCityChange={setSelectedCity}
              onChange={onChange}
            />
          </div>
        )}

        <div className="flex flex-col justify-end">
          <div>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              Filter
            </button>
          </div>
        </div>

        <div className="col-span-2 text-xs">
          selectedCountry: {JSON.stringify(selectedCountry)}
          <br />
          selectedCity: {JSON.stringify(selectedCity)}
        </div>
      </div>
    </>
  );
};

export default GeographyPicker;

import type { City, Country } from "@prisma/client";
import { useEffect, useState } from "react";
import { CityPicker } from "./city-picker";
import { CountryPicker } from "./country-picker";

const GeographyPicker: React.FC<{
  country?: Country;
  city?: City;
  onCountryChange: (value?: Country | undefined) => void;
  onCityChange: (value?: City | undefined) => void;
}> = (props) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    props.country
  );
  const [selectedCity, setSelectedCity] = useState<City | undefined>(
    props.city
  );

  useEffect(() => {
    if (selectedCountry?.cca2 !== selectedCity?.countryCode) {
      setSelectedCity(undefined);
    }
    props.onCountryChange(selectedCountry);
    props.onCityChange(selectedCity);
  }, [props, selectedCountry, selectedCity]);

  function onChange(event: string | undefined): void {}

  return (
    <>
      <div className="mt-6 grid grid-cols-5 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <CountryPicker
            selectedItem={selectedCountry}
            onSelectedItemChange={setSelectedCountry}
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
              selectedItem={selectedCity}
              onSelectedItemChange={setSelectedCity}
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

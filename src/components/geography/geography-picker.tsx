import type { City, Country } from "@prisma/client";
import { useEffect, useState } from "react";
import { CityPicker } from "./city-picker";
import { CountryPicker } from "./country-picker";

const GeographyPicker: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    undefined
  );
  const [selectedCity, setSelectedCity] = useState<City | undefined>(undefined);

  useEffect(() => {
    if (selectedCountry?.cca2 !== selectedCity?.countryCode) {
      setSelectedCity(undefined);
    }
  }, [selectedCountry, selectedCity]);

  return (
    <>
      <div className="mt-6 grid grid-cols-5 gap-6">
        <div className="col-span-4 sm:col-span-2">
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700"
          >
            Country
          </label>
          <CountryPicker
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
          />
        </div>

        {selectedCountry && (
          <div className="col-span-4 sm:col-span-2">
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700"
            >
              City
              <CityPicker
                countryCode={selectedCountry?.cca2}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
              />
            </label>
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

        <div className="col-span-4 text-xs sm:col-span-2">
          selectedCountry: {JSON.stringify(selectedCountry)}
          <br />
          selectedCity: {JSON.stringify(selectedCity)}
        </div>
      </div>
    </>
  );
};

export default GeographyPicker;

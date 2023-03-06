import { type Country } from "@prisma/client";
import { useState } from "react";
import { CountryPicker } from "./country-picker";

const GeographyPicker: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    undefined
  );

  return (
    <>
      <CountryPicker
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
      />
    </>
  );
};

export default GeographyPicker;

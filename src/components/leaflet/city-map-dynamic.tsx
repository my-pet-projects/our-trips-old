import dynamic from "next/dynamic";

export const CityMapDynamic = dynamic(
  () => import("@/components/leaflet/city-map"),
  {
    ssr: false,
  }
);

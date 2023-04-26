import dynamic from "next/dynamic";

export const DynamicMap = dynamic(() => import("@/components/leaflet/map"), {
  ssr: false,
});

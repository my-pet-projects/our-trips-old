import { BasicAttractionInfo } from "@/server/api/routers/attraction";
import { latLngBounds } from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function FitMap({ items }: { items: BasicAttractionInfo[] }) {
  const map = useMap();

  useEffect(() => {
    if (!items) {
      return;
    }

    const markerBounds = latLngBounds([]);
    items.forEach((item) => {
      const latLng = [item.latitude, item.longitude] as L.LatLngExpression;
      markerBounds.extend(latLng);
    });
    markerBounds.isValid() && map.fitBounds(markerBounds);

    // TODO:remove
    // map.setView([28.5944, 77.227], 13);
  }, [items, map]);

  return null;
}

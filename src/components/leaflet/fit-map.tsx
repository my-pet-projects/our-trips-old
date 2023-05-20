import { BasicAttractionInfo } from "@/server/api/routers/attraction";
import { latLngBounds } from "leaflet";
import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";

export function FitMap({ items }: { items: BasicAttractionInfo[] }) {
  const map = useMap();
  const [isFit, setIsFit] = useState(false);

  useEffect(() => {
    if (!items || isFit) {
      return;
    }
    const markerBounds = latLngBounds([]);
    items.forEach((item) => {
      if (item.latitude === 0 && item.longitude === 0) {
        return;
      }
      const latLng = [item.latitude, item.longitude] as L.LatLngExpression;
      markerBounds.extend(latLng);
    });
    markerBounds.isValid() && map.fitBounds(markerBounds);
    setIsFit(true);
  }, [items, map, isFit]);

  return null;
}

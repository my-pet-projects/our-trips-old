import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { AttractionMarkerData } from "./attraction-marker";

export const LocatePlace = ({ item }: { item: AttractionMarkerData }) => {
  const map = useMap();

  useEffect(() => {
    let zoom = map.getZoom();
    if (zoom < 14) {
      zoom = 14;
    }

    const latLng = [item.latitude, item.longitude] as L.LatLngExpression;
    const offsetX = 0;
    const offsetY = 150;
    let center = map.project(latLng);
    center = L.point(center.x + offsetX, center.y + offsetY);
    const target = map.unproject(center);

    map.flyTo(target, zoom);
  }, [item, map]);

  return null;
};

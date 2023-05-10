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
    const offsetY = -200;
    const offsetPoint = L.point(offsetX, offsetY);
    const targetPoint = map.project(latLng, zoom).subtract(offsetPoint);
    const targetLatLng = map.unproject(targetPoint, zoom);

    map.flyTo(targetLatLng, zoom);
  }, [item, map]);

  return null;
};

import { latLng } from "leaflet";
import { useEffect, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";

export const CurrentCoordinates = () => {
  const map = useMap();
  const [location, setLocation] = useState(latLng(0, 0));

  useEffect(() => {
    setLocation(map.getCenter());
  }, [map]);

  useMapEvents({
    move(event) {
      setLocation((event.target as L.Map).getCenter());
    },
    zoom(event) {
      setLocation((event.target as L.Map).getCenter());
    },
  });

  return (
    <span
      className="button absolute top-2 right-2 rounded border-2 border-neutral-400 bg-white px-2 py-1 text-black"
      style={{ zIndex: 400 }}
      onClick={() => map.setZoom(13)}
    >
      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
    </span>
  );
};

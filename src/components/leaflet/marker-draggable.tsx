import { Coordinates } from "@/types/coordinates";
import { divIcon } from "leaflet";
import { useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker } from "react-leaflet";
import { SelectedPlaceIcon } from "./icon";

type MarkerDraggableProps = {
  coordinates: Coordinates;
  onChange: (value: Coordinates) => void;
};

const centerIcon = divIcon({
  className: "",
  html: renderToStaticMarkup(<SelectedPlaceIcon />),
  iconSize: [56, 56],
  iconAnchor: [28, 56],
});

export const MarkerDraggable = ({
  coordinates,
  onChange,
}: MarkerDraggableProps) => {
  const [position, setPosition] = useState(coordinates);
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newCoordinates = {
            latitude: marker.getLatLng().lat,
            longitude: marker.getLatLng().lng,
          };
          setPosition(newCoordinates);
          onChange(newCoordinates);
        }
      },
    }),
    [onChange]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={{ lat: position.latitude, lng: position.longitude }}
      icon={centerIcon}
      ref={markerRef}
    ></Marker>
  );
};

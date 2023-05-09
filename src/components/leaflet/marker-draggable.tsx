import { Coordinates } from "@/types/coordinates";
import { divIcon } from "leaflet";
import { useMemo, useRef } from "react";
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
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export const MarkerDraggable = ({
  coordinates,
  onChange,
}: MarkerDraggableProps) => {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          onChange({
            latitude: marker.getLatLng().lat,
            longitude: marker.getLatLng().lng,
          });
        }
      },
    }),
    [onChange]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={{ lat: coordinates.latitude, lng: coordinates.longitude }}
      icon={centerIcon}
      ref={markerRef}
    ></Marker>
  );
};

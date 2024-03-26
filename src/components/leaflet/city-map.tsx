import { Coordinates } from "@/types/coordinates";
import { City } from "@prisma/client";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet";
import { PlaceIcon, SelectedPlaceIcon } from "./icon";
import { MarkerDraggable } from "./marker-draggable";

type CityMapProps = {
  cities?: City[];
  coordinates: Coordinates;
  selectedCity?: City;
  onChange: (value: Coordinates) => void;
};

const icon = divIcon({
  className: "",
  html: renderToStaticMarkup(<PlaceIcon />),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const centerIcon = divIcon({
  className: "",
  html: renderToStaticMarkup(<SelectedPlaceIcon />),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export default function Map({
  cities,
  coordinates,
  selectedCity,
  onChange,
}: CityMapProps) {
  return (
    <MapContainer
      center={[coordinates.latitude, coordinates.longitude]}
      zoom={17}
      className="h-full"
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {cities?.map((city) => (
        <Marker
          key={city.oldIdForDelete}
          position={[city.latitude, city.longitude]}
          icon={icon}
        >
          <Tooltip>
            <span className="text-sm font-medium text-gray-900">
              {city.name}
            </span>
          </Tooltip>
          <Popup>
            <span className="text-sm font-medium text-gray-900">
              {city.name}
            </span>
          </Popup>
        </Marker>
      ))}

      <MarkerDraggable coordinates={coordinates} onChange={onChange} />
      {selectedCity && (
        <Marker
          position={[selectedCity.latitude, selectedCity.longitude]}
          icon={centerIcon}
        />
      )}
    </MapContainer>
  );
}

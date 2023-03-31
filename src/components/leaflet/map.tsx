import { Attraction } from "@prisma/client";
import L, {
  divIcon,
  icon as i,
  latLngBounds,
  Marker as M,
  point,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "./marker-cluster-group";

type ChangeViewProps = {
  items: Attraction[];
};
export function ChangeView({ items }: ChangeViewProps) {
  const map = useMap();
  if (!items || !items[0]) {
    return null;
  }

  const coords = [items[0].latitude, items[0].longitude] as L.LatLngExpression;
  map.setView(coords, 12);

  const markerBounds = latLngBounds([]);
  items.forEach((item) => {
    const coords = [item.latitude, item.longitude] as L.LatLngExpression;
    markerBounds.extend(coords);
  });
  markerBounds.isValid() && map.fitBounds(markerBounds);

  return null;
}

type MapProps = {
  items: Attraction[];
};

M.prototype.options.icon = i({
  iconUrl: "/leaflet/map-marker.svg",
  iconRetinaUrl: "/leaflet/map-marker.svg",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  shadowUrl: "/leaflet/marker-shadow.png",
  shadowRetinaUrl: "/leaflet/marker-shadow.png",
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const createClusterCustomIcon = (cluster: L.MarkerCluster) => {
  return divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className:
      "bg-[#e74c3c] bg-opacity-100 text-white font-bold !flex items-center justify-center rounded-3xl border-white border-4 border-opacity-50",
    iconSize: point(40, 40, true),
  });
};

export const MapCenter = () => {
  const map = useMap();
  const [location, setLocation] = useState(map.getCenter());
  const { lat, lng } = location;
  const text = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
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
      {text}
    </span>
  );
};

export default function Map({ items }: MapProps) {
  return (
    <MapContainer
      zoom={12}
      style={{ height: "100vh" }}
      attributionControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
        showCoverageOnHover={false}
      >
        {items?.map((item) => {
          if (item.latitude && item.longitude) {
            return (
              <Marker
                key={item.oldId}
                position={[item.latitude, item.longitude]}
              />
            );
          }
        })}
      </MarkerClusterGroup>
      <ChangeView items={items} />
      <MapCenter />
    </MapContainer>
  );
}

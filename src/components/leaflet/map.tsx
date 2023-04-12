import { RouterOutputs } from "@/utils/api";
import L, { divIcon, latLngBounds, point } from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "./marker-cluster-group";

type ChangeViewProps = {
  items: BasicAttractionInfo[];
};
function ChangeView({ items }: ChangeViewProps) {
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

type BasicAttractionInfo =
  RouterOutputs["attraction"]["getAllAttractions"][number];
type MapProps = {
  items: BasicAttractionInfo[];
};

const markerIcon = divIcon({
  html: `<svg class="w-5 h-5 fill-current text-red-500" viewBox="0 0 24 24">
    <path d="M12 0a8 8 0 0 0-7 12l7 12 7-12a8 8 0 0 0-7-12zm0 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/>
    <path d="M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
  </svg>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const markerCurPositionIcon = divIcon({
  html: `<svg class="w-5 h-5 fill-current text-blue-500" viewBox="0 0 24 24">
    <path d="M12 0a8 8 0 0 0-7 12l7 12 7-12a8 8 0 0 0-7-12zm0 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/>
    <path d="M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
  </svg>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const createClusterCustomIcon = (cluster: L.MarkerCluster) => {
  return divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className:
      "bg-[#e74c3c] bg-opacity-100 text-white font-bold !flex items-center justify-center rounded-3xl border-white border-4 border-opacity-50",
    iconSize: point(40, 40, true),
  });
};

const MapCenter = () => {
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

const LocationMarker = () => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [layerGroup, setLayerGroup] = useState<L.LayerGroup>(L.layerGroup());
  const [bbox, setBbox] = useState<string[]>([]);
  const map = useMap();

  useEffect(() => {
    map
      .locate({
        // setView: true,
        maxZoom: 20,
        watch: true,
        enableHighAccuracy: true,
        maximumAge: 150,
        timeout: 3000000,
      })
      .on("locationfound", function (e) {
        console.log("locationfound");
        layerGroup.clearLayers();
        setPosition(e.latlng);
        // map.flyTo(e.latlng, map.getZoom());
        const radius = e.accuracy;
        const circle = L.circle(e.latlng, radius);
        circle.addTo(layerGroup);

        const popupContent = L.DomUtil.create("span");
        popupContent.innerHTML = ` You are here. <br />
               ${e.latlng.toString()}`;
        const popup = L.popup({
          content: popupContent,
        });
        const marker = L.marker(e.latlng, { icon: markerCurPositionIcon })
          .bindPopup(popup)
          .openPopup()
          .addTo(layerGroup);

        map.addLayer(layerGroup);
        setBbox(e.bounds.toBBoxString().split(","));
      });
  }, [map, layerGroup]);

  return null;
};

// const CurrentPosition = () => {
//   const map = useMap();

//   useEffect(() => {
//     const legend = new L.Control({ position: "topleft" });

//     legend.onAdd = () => {
//       const container = L.DomUtil.create(
//         "div",
//         "extentControl leaflet-bar leaflet-control leaflet-touch"
//       );
//       const btn = L.DomUtil.create("a");
//       btn.setAttribute(
//         "style",
//         'background: #fff; background-image: url("../../assets/globo.jpg"); background-repeat: no-repeat; background-position: center center;'
//       );
//       btn.setAttribute("id", "zoomMax");
//       btn.setAttribute("title", "zoomMax");
//       container.appendChild(btn);
//       return container;
//     };

//     legend.addTo(map);

//     return () => legend.remove();
//   }, [map]);
//   return null;
// };

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
                key={item.id}
                position={[item.latitude, item.longitude]}
                icon={markerIcon}
              >
                <Popup>
                  <span>{item.name}</span>
                  <br />
                  <Link href={`/admin/attraction/edit/${item.id}`}>Edit</Link>
                </Popup>
              </Marker>
            );
          }
        })}
      </MarkerClusterGroup>
      <ChangeView items={items} />
      <MapCenter />
      <LocationMarker />
      {/* <CurrentPosition /> */}
    </MapContainer>
  );
}

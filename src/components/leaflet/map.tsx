import { RouterOutputs } from "@/utils/api";
import L, { divIcon, LatLng, point } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { AttractionMarker } from "./attraction-marker";
import { CurrentCoordinates } from "./current-coordinates";
import { LocationMarker } from "./current-location";
import { FitMap } from "./fit-map";
import MarkerClusterGroup from "./marker-cluster-group";

export type BasicAttractionInfo =
  RouterOutputs["attraction"]["getAllAttractions"][number];

type MapProps = {
  items: BasicAttractionInfo[];
  selectedPoi?: BasicAttractionInfo;
  onPoiClick: (item: BasicAttractionInfo) => void;
};

const createClusterCustomIcon = (cluster: L.MarkerCluster) => {
  return divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className:
      "bg-[#e74c3c] bg-opacity-100 text-white font-bold !flex items-center justify-center rounded-3xl border-white border-4 border-opacity-50",
    iconSize: point(40, 40, true),
  });
};

export default function Map({ items, selectedPoi, onPoiClick }: MapProps) {
  const [userLocation, setUserLocation] = useState<LatLng>();
  const [selectedMarker, setSelecterMarker] = useState();

  const [pois, setPois] = useState(items as AttractionMarker[]);

  useEffect(() => {
    const newItems = items.map((item) => {
      if (item.id === selectedPoi?.id) {
        return { ...item, selected: true };
      } else {
        return { ...item, selected: false };
      }
    });
    setPois(newItems);
  }, [selectedPoi, items]);

  function onMarkerClick(marker: AttractionMarker): void {
    const newItems = items.map((item) => {
      if (item.id === marker.id) {
        return { ...item, selected: true };
      } else {
        return { ...item, selected: false };
      }
    });
    setPois(newItems);
    onPoiClick(marker);
  }

  return (
    <>
      <MapContainer
        center={[0, 0]}
        zoom={2}
        className="h-screen"
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
          showCoverageOnHover={false}
        >
          {pois?.map((item) => (
            <AttractionMarker
              key={item.id}
              item={item}
              onClick={onMarkerClick}
            />
          ))}
        </MarkerClusterGroup>
        <FitMap items={items} />
        <CurrentCoordinates />
        <LocationMarker />
        {/* <LeafletMyPosition /> */}

        {/* <LocateControl position="topleft" /> */}
        {/* <CenterCurrentLocation location={userLocation} /> */}
        {/* <CurrentPosition /> */}
      </MapContainer>
    </>
  );
}

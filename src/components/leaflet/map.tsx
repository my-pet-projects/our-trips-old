import { BasicAttractionInfo } from "@/server/api/routers/attraction";
import { Itinerary } from "@/server/api/routers/itinerary";
import L, { divIcon, point } from "leaflet";
import "leaflet/dist/leaflet.css";
import { LayersControl, MapContainer, TileLayer } from "react-leaflet";
import { AttractionMarker, AttractionMarkerData } from "./attraction-marker";
import { CurrentCoordinates } from "./current-coordinates";
import { LocationMarker } from "./current-location";
import { FitMap } from "./fit-map";
import MarkerClusterGroup from "./marker-cluster-group";

type MapProps = {
  places: BasicAttractionInfo[];
  itineraries: Itinerary[];
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

export default function Map({
  places,
  itineraries,
  selectedPoi,
  onPoiClick,
}: MapProps) {
  function onMarkerClick(marker: AttractionMarkerData): void {
    const item = places.find((p) => p.id === marker.id);
    onPoiClick(item!);
  }

  return (
    <MapContainer
      center={[0, 0]}
      zoom={2}
      className="h-screen"
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LayersControl position="topleft">
        <LayersControl.Overlay name="All available places" checked>
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
            showCoverageOnHover={false}
          >
            {places?.map((place) => (
              <AttractionMarker
                key={place.id}
                item={place}
                selected={place.id === selectedPoi?.id}
                onClick={onMarkerClick}
              />
            ))}
          </MarkerClusterGroup>
        </LayersControl.Overlay>
        {itineraries?.map((itinerary) => (
          <LayersControl.Overlay
            key={itinerary.id}
            name={itinerary.name}
            checked
          >
            {itinerary.places?.map((place) => (
              <AttractionMarker
                key={place.id}
                item={place.attraction}
                color={itinerary.color.name}
                selected={false}
                onClick={onMarkerClick}
              />
            ))}
          </LayersControl.Overlay>
        ))}
      </LayersControl>

      <FitMap items={places} />
      <CurrentCoordinates />
      <LocationMarker />
      {/* <LeafletMyPosition /> */}

      {/* <LocateControl position="topleft" /> */}
      {/* <CenterCurrentLocation location={userLocation} /> */}
      {/* <CurrentPosition /> */}
    </MapContainer>
  );
}

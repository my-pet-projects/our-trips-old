import { BasicAttractionInfo } from "@/server/api/routers/attraction";
import { Itinerary } from "@/server/api/routers/itinerary";
import { Attraction } from "@prisma/client";
import "leaflet/dist/leaflet.css";
import { LayersControl, MapContainer, TileLayer } from "react-leaflet";
import { AttractionMarker, AttractionMarkerData } from "./attraction-marker";
import { CurrentCoordinates } from "./current-coordinates";
import { LocationMarker } from "./current-location";
import { FitMap } from "./fit-map";
import { LocatePlace } from "./locate-place";
import MarkerClusterGroup, { clusterIcon } from "./marker-cluster-group";

type MapProps = {
  places: BasicAttractionInfo[];
  itineraries: Itinerary[];
  selectedPoi?: BasicAttractionInfo | Attraction;
  onPoiClick: (item: BasicAttractionInfo) => void;
};

const getAvailablePlaces = (
  places: BasicAttractionInfo[],
  itineraries: Itinerary[]
) => {
  const availablePlaces = places.map((place) => {
    let visible = true;
    itineraries.forEach((itin) => {
      itin.places.forEach((itinPlace) => {
        if (itinPlace.attractionId === place.id) {
          visible = false;
          return;
        }
      });
    });
    return { ...place, hidden: visible };
  });
  return availablePlaces;
};

export default function Map({
  places,
  itineraries,
  selectedPoi,
  onPoiClick,
}: MapProps) {
  const availablePlaces = getAvailablePlaces(places, itineraries);

  const onMarkerClick = (marker: AttractionMarkerData) => {
    const place = places.find((place) => place.id === marker.id);
    if (place) {
      onPoiClick(place);
    }
  };

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
            iconCreateFunction={clusterIcon}
            showCoverageOnHover={false}
          >
            {availablePlaces?.map(
              (place) =>
                place.hidden && (
                  <AttractionMarker
                    key={place.id}
                    item={place}
                    selected={false}
                    onClick={onMarkerClick}
                  />
                )
            )}
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
                digit={place.order}
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
      {selectedPoi && (
        <>
          <AttractionMarker
            item={selectedPoi}
            selected={true}
            onClick={onMarkerClick}
          />
          <LocatePlace item={selectedPoi} />
        </>
      )}
      {/* <LeafletMyPosition /> */}

      {/* <LocateControl position="topleft" /> */}
      {/* <CenterCurrentLocation location={userLocation} /> */}
      {/* <CurrentPosition /> */}
    </MapContainer>
  );
}

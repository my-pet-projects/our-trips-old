import { BasicAttractionInfo } from "@/server/api/routers/attraction";
import { Directions, Itinerary } from "@/server/api/routers/itinerary";
import { Feature } from "geojson";
import { Layer, LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import { GeoJSON, LayersControl, MapContainer, TileLayer } from "react-leaflet";
import { AttractionMarker, AttractionMarkerData } from "./attraction-marker";
import { CurrentCoordinates } from "./current-coordinates";
import { LocationMarker } from "./current-location";
import { FitMap } from "./fit-map";
import { LocatePlace } from "./locate-place";
import MarkerClusterGroup, { clusterIcon } from "./marker-cluster-group";

type MapProps = {
  places: BasicAttractionInfo[];
  itineraries: Itinerary[];
  directions: Directions[];
  selectedPoi?: BasicAttractionInfo;
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
  directions,
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
      {directions &&
        directions.map((dir, idx) => (
          <GeoJSON
            key={idx}
            data={dir}
            onEachFeature={(feature: Feature, layer: Layer): void => {
              layer.on({
                mouseover: (e: LeafletMouseEvent): void => {
                  const distance = (e.target.feature.properties.summary
                    .distance / 1000,
                  2).toFixed(2);
                  const duration = (
                    e.target.feature.properties.summary.duration / 60
                  ).toFixed(2);
                  layer.bindTooltip(
                    `Distance: ${distance} km<br/> Duration: ${duration} min`,
                    {
                      direction: "center",
                      permanent: true,
                    }
                  );
                  layer.openTooltip();
                },
                mouseout: (): void => {
                  layer.unbindTooltip();
                  layer.closeTooltip();
                },
              });
            }}
          />
        ))}
      {/* <LeafletMyPosition /> */}

      {/* <LocateControl position="topleft" /> */}
      {/* <CenterCurrentLocation location={userLocation} /> */}
      {/* <CurrentPosition /> */}
    </MapContainer>
  );
}

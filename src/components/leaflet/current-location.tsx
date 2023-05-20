import { default as L, default as Leaflet, divIcon, DomUtil } from "leaflet";
import { useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FaCrosshairs, FaMapPin } from "react-icons/fa";
import { useMap, useMapEvents } from "react-leaflet";

const markerCurPositionIcon = divIcon({
  html: renderToStaticMarkup(<FaMapPin className="h-6 w-6 text-blue-500" />),
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

export const LocationMarker = () => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [layerGroup, setLayerGroup] = useState<L.LayerGroup>(L.layerGroup());
  const [bbox, setBbox] = useState<string[]>([]);
  const map = useMap();

  useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      console.log("location found 2");
      layerGroup.clearLayers();
      const radius = e.accuracy;
      const circle = L.circle(e.latlng, radius);
      circle.addTo(layerGroup);

      const popupContent = L.DomUtil.create("span");
      popupContent.innerHTML = `latitude: ${e.latlng.lat.toFixed(
        4
      )}, longitude: ${e.latlng.lng.toFixed(4)}`;
      const popup = L.popup({
        content: popupContent,
      });

      L.marker(e.latlng, { icon: markerCurPositionIcon })
        .bindPopup(popup)
        .openPopup()
        .addTo(layerGroup);

      map.addLayer(layerGroup);
      setBbox(e.bounds.toBBoxString().split(","));
    },
    locationerror(e) {
      console.error("location error", e);
    },
  });

  useEffect(() => {
    const locateControl = new L.Control({ position: "topleft" });

    locateControl.onAdd = () => {
      const container = Leaflet.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control leaflet-control-custom"
      );
      const link = DomUtil.create("a", "", container);
      link.setAttribute(
        "style",
        "display: flex; justify-content: center; align-items: center;"
      );
      link.setAttribute("role", "button");
      link.title = "Locate my position";
      link.innerHTML = renderToStaticMarkup(
        <FaCrosshairs className="h-5 w-5" />
      );
      link.onclick = function () {
        map
          .locate({
            maxZoom: 20,
            watch: true,
            enableHighAccuracy: false,
            maximumAge: 150,
            timeout: 3000000,
          })
          .on("locationfound", function (e) {
            console.log("location found");
          });
        if (position) {
          map.flyTo(position, 18);
        }
      };
      return container;
    };

    locateControl.addTo(map);

    return () => {
      locateControl.remove();
    };
  }, [map, layerGroup, position]);

  return null;
};

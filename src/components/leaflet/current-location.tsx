import { MapPinIcon } from "@heroicons/react/20/solid";
import { createControlComponent } from "@react-leaflet/core";
import Leaflet, { divIcon, DomEvent, DomUtil, LatLng, Map } from "leaflet";
import { useEffect, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import LeafletControl from "./leaflet-control";

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

type CenterCurrentLocation = {
  location?: LatLng;
};

// export const CenterCurrentLocation = ({ location }: CenterCurrentLocation) => {
//   const [position, setPosition] = useState<L.LatLng | null>(null);
//   const [layerGroup, setLayerGroup] = useState<L.LayerGroup>(L.layerGroup());
//   const [bbox, setBbox] = useState<string[]>([]);
//   const map = useMap();

// //   const [c, setC] = useState(new control());

//   //   const c = useMemo(() => new control(), [control]);

//   useEffect(() => {
//     console.log("useeffect");
//   }, [map, c]);

//   return null;
// };

export const LocationMarker = () => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [layerGroup, setLayerGroup] = useState<L.LayerGroup>(L.layerGroup());
  const [bbox, setBbox] = useState<string[]>([]);
  const map = useMap();

  const mapEv = useMapEvents({
    // click() {
    //   map.locate();
    // },
    locationfound(e) {
      console.log("useMapEvent", e.latlng);
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      //   map.flyTo(e.latlng, map.getZoom());
    },
    locationerror(e) {
      console.log("useMapEvent", e);
    },
  });

  useEffect(() => {
    map
      .locate({
        maxZoom: 20,
        watch: true,
        enableHighAccuracy: true,
        maximumAge: 150,
        timeout: 3000000,
      })
      .on("locationfound", function (e) {
        console.log("locationfound");
        layerGroup.clearLayers();
        // setCurrentPosition(e.latlng);
        // map.flyTo(e.latlng, map.getZoom());
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
        const marker = L.marker(e.latlng, { icon: markerCurPositionIcon })
          .bindPopup(popup)
          .openPopup()
          .addTo(layerGroup);

        map.addLayer(layerGroup);
        setBbox(e.bounds.toBBoxString().split(","));
      });
  }, [map, layerGroup]);

  return (
    <div className="leaflet-top leaflet-right pt-10">
      <div className="leaflet-control leaflet-bar w-10">
        <MapPinIcon
          onClick={() => {
            console.log("oasdasdasd");
            if (position) {
              map.flyTo(position, 18);
            }
          }}
        ></MapPinIcon>
      </div>
    </div>
  );
};

const control = L.Control.extend({
  options: {
    position: "topleft",
  },
  onAdd: function (map: Map) {
    console.log("onadd");

    console.log("onAdd");
    const container = L.DomUtil.create(
      "div",
      "extentControl leaflet-bar leaflet-control leaflet-touch"
    );
    var btn = L.DomUtil.create("a");
    btn.setAttribute(
      "style",
      'background: #fff; background-image: url("/map-pin.svg"); background-repeat: no-repeat; background-position: 50% 50%;'
    );

    L.DomEvent.on(btn, "click", function (ev) {
      //   L.DomEvent.stopPropagation(ev);
      //   L.DomEvent.preventDefault(ev);

      console.log("click");
    });

    // btn.addEventListener("click", function (event: MouseEvent) {
    //   console.log("click");

    //   map.on("locationfound", function (e) {
    //     console.log("location found");
    //   });
    //   //   if (position) {
    //   //     map.setZoom(18);
    //   //     map.flyTo(position);
    //   //   }
    // });

    container.appendChild(btn);

    return container;
  },

  onRemove: function () {
    console.log("onremove");
    // Nothing to do here
  },
});

/*
https://javascript.plainenglish.io/creating-an-ellipse-in-react-leaflet-72e2c5beff03
https://github.com/yuiseki/crisis-news-map-next/blob/9ce1ab08a9521f0c78f7fe020fa5f67de3583982/src/components/leaflet/CrisisMap.tsx
https://erichowey.dev/writing/advanced-mapping-with-gatsby-and-react-leaflet/
*/

const CurrentLocationControlFactory = Leaflet.Control.extend({
  onAdd: function (map: Map) {
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

    link.title = "À proximité de chez moi";
    link.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" xml:space="preserve" viewBox="0 0 1000 1000">
      <path d="M494.24 10.71c-1.16.46-5.1 1.39-8.57 2.08-9.03 2.08-22.7 14.83-27.57 25.71-3.71 7.88-4.4 15.75-4.4 56.76v47.49l-22.47 4.17c-31.27 5.79-59.54 15.52-92.2 31.74-95.91 47.95-164.48 134.36-190.19 239.76-3.01 12.74-5.56 25.95-5.56 29.42v6.49H97.64c-25.25 0-49.81 1.16-54.67 2.55-10.19 2.78-23.63 13.9-28.73 23.86-9.73 18.76-2.08 45.87 16.22 58.61l9.27 6.49L90.69 547l50.96 1.16 5.1 25.48c22.47 108.65 93.36 200.62 192.97 250.19 29.19 14.36 59.54 25.02 87.8 30.35 11.12 2.09 21.78 4.17 23.4 4.63 2.09.7 2.78 12.05 2.78 47.26 0 50.5 1.39 57.45 13.44 70.19 9.5 9.96 18.76 13.9 32.9 13.9 14.13 0 23.4-3.94 32.89-13.9 12.05-12.74 13.44-19.69 13.44-70.19 0-35.21.69-46.79 3.01-47.26 1.39-.46 11.82-2.55 22.94-4.63 41.47-7.64 89.19-27.57 127.41-53.05C779.87 747.61 835 665.14 854 570.16l4.4-22.01 49.57-1.16c29.42-.7 51.89-2.32 55.37-3.71 7.18-3.24 18.07-13.9 22.01-21.78 11.81-23.4.23-53.05-24.79-63.47-6.95-3.01-18.53-3.71-56.29-3.71h-47.49v-6.49c0-3.47-2.55-16.68-5.56-29.42-16.22-66.25-48.88-124.86-96.6-172.35-50.27-50.5-118.38-86.64-185.56-99.15l-22.7-4.17V95.25c0-53.51-1.62-60-16.91-73.44-10.42-9.01-26.41-14.11-35.21-11.1zm58.61 226.79c95.44 20.39 171.2 87.57 202 179.3 41.7 124.63-15.52 263.16-133.2 322.93-36.83 18.76-68.8 27.1-111.42 28.96-74.59 3.48-145.71-24.55-199.69-78.53-103.32-103.09-105.4-267.79-5.1-373.43 40.08-42.16 93.59-71.12 147.1-79.92 9.03-1.39 18.76-3.01 22.01-3.47 11.58-2.09 61.85.69 78.3 4.16z"/>
      <path d="M466.44 349.16c-8.8 2.08-25.02 7.88-35.91 12.97-15.75 7.64-23.4 13.2-39.61 29.42-16.22 16.22-21.78 23.86-29.65 40.08-21.78 45.17-22.01 93.82-.46 137.37 57.45 115.83 220.77 115.83 278.45 0 21.55-43.55 21.31-92.2-.46-137.37-13.44-28.03-41.23-55.6-69.27-69.27-32.9-15.98-67.88-20.61-103.09-13.2z"/>
    </svg>`;

    DomEvent
      // .on(link, "mousedown dblclick", DomEvent.stopPropagation)
      //   .on(link, "click", DomEvent.stop)
      .on(link, "click", function () {
        console.log("on click locate");

        map
          .locate({
            setView: true,
            maxZoom: 18,
            maximumAge: 150,
            timeout: 3000000,
          })
          .on("locationerror", (e) => console.log(e))
          .on("locationfound", (e) => console.log(e));
      });

    return container;
  },
});

export const LocateControl = createControlComponent(
  (props) => new CurrentLocationControlFactory(props)
);

interface LeafletMyPositionProps {
  zoom?: number;
}

const LeafletMyPosition: React.FC<LeafletMyPositionProps> = ({ zoom = 17 }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const map = useMapEvents({
    locationfound(e) {
      map.flyTo(e.latlng, zoom);
      setLoading(false);
    },
  });

  return (
    <LeafletControl position={"topleft"}>
      <div>
        asdas
        <MapPinIcon
          onClick={() => {
            setLoading(true);
            map.locate();
          }}
        ></MapPinIcon>
      </div>
    </LeafletControl>
  );
};

export default LeafletMyPosition;

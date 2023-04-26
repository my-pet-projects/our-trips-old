import { MapPinIcon } from "@heroicons/react/20/solid";
import { divIcon, LeafletMouseEvent } from "leaflet";
import Link from "next/link";
import { useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker, Popup, Tooltip, useMap } from "react-leaflet";
import { BasicAttractionInfo } from "./map";

const icon = divIcon({
  className: "",
  html: renderToStaticMarkup(<MapPinIcon className="h-6 w-6 text-red-500" />),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const selectedIcon = L.divIcon({
  className: "",
  html: renderToStaticMarkup(
    <MapPinIcon className="h-10 w-10 text-blue-500" />
  ),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  tooltipAnchor: [0, -40],
});

export type AttractionMarker = BasicAttractionInfo & { selected: boolean };

type AttractionMarkerProps = {
  item: AttractionMarker;
  onClick: (item: AttractionMarker) => void;
};

export const AttractionMarker = ({ item, onClick }: AttractionMarkerProps) => {
  const map = useMap();
  const [selected, setSelected] = useState(false);

  function onMarkerClick(event: LeafletMouseEvent): void {
    let zoom = map.getZoom();
    if (zoom < 14) {
      zoom = 14;
    }
    map.flyTo(event.latlng, zoom);
    // item.selected = true;
    setSelected(true);
    onClick(item);
  }

  if (!item.latitude || !item.longitude) {
    return null;
  }

  return (
    <Marker
      position={[item.latitude, item.longitude]}
      icon={item.selected ? selectedIcon : icon}
      eventHandlers={{ click: onMarkerClick }}
    >
      <Tooltip>
        <span className="text-sm font-medium text-gray-900">{item.name}</span>
      </Tooltip>
      <Popup>
        <br />
        <Link href={`/admin/attraction/edit/${item.id}`}>Edit</Link>
      </Popup>
    </Marker>
  );
};

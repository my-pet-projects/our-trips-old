import { getColor } from "@/utils/color";
import { MapPinIcon } from "@heroicons/react/20/solid";
import { divIcon, LeafletMouseEvent } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker, Tooltip, useMap } from "react-leaflet";

const icon = divIcon({
  className: "",
  html: renderToStaticMarkup(<MapPinIcon className="h-6 w-6 fill-slate-700" />),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const colorizeIcon = (color?: string) => {
  return divIcon({
    className: "",
    html: renderToStaticMarkup(<MapPinIcon className={`h-6 w-6 ${color}`} />),
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

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

export type AttractionMarkerData = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
};

type AttractionMarkerProps = {
  item: AttractionMarkerData;
  color?: string;
  selected: boolean;
  onClick: (item: AttractionMarkerData) => void;
};

export const AttractionMarker = ({
  item,
  color,
  selected,
  onClick,
}: AttractionMarkerProps) => {
  const map = useMap();

  function onMarkerClick(event: LeafletMouseEvent): void {
    let zoom = map.getZoom();
    if (zoom < 14) {
      zoom = 14;
    }
    map.flyTo(event.latlng, zoom);
    onClick(item);
  }

  if (!item.latitude || !item.longitude) {
    return null;
  }

  const getIcon = () => {
    if (selected) {
      return selectedIcon;
    }
    if (!color) {
      return icon;
    }
    return colorizeIcon(getColor(color));
  };

  return (
    <Marker
      position={[item.latitude, item.longitude]}
      icon={getIcon()}
      eventHandlers={{ click: onMarkerClick }}
      zIndexOffset={color || selected ? 1 : 0}
    >
      <Tooltip>
        <span className="text-sm font-medium text-gray-900">{item.name}</span>
      </Tooltip>
    </Marker>
  );
};

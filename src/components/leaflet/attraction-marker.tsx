import { getColor } from "@/utils/color";
import { divIcon, LeafletMouseEvent } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { FaMapMarker, FaMapMarkerAlt } from "react-icons/fa";
import { Marker, Tooltip, useMap } from "react-leaflet";

const icon = divIcon({
  className: "",
  html: renderToStaticMarkup(
    <FaMapMarkerAlt className="h-10 w-10 fill-slate-700" />
  ),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const colorizeIcon = (color?: string, digit?: number) => {
  return divIcon({
    className: "",
    html: renderToStaticMarkup(
      <span>
        {digit && (
          <span className="absolute z-10 w-10 text-center text-lg font-medium text-white">
            {digit}
          </span>
        )}
        <span className="absolute z-0">
          <FaMapMarker className={`h-10 w-10 fill-white`} />
        </span>
        <span className="absolute z-0">
          <FaMapMarker className={`h-9 w-9 pl-1 pt-0.5 ${color}`} />
        </span>
      </span>
    ),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const selectedIcon = L.divIcon({
  className: "",
  html: renderToStaticMarkup(
    <FaMapMarkerAlt className="h-14 w-14 text-blue-500" />
  ),
  iconSize: [56, 56],
  iconAnchor: [28, 56],
  popupAnchor: [0, -56],
  tooltipAnchor: [0, -56],
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
  digit?: number;
  selected: boolean;
  onClick: (item: AttractionMarkerData) => void;
};

export const AttractionMarker = ({
  item,
  color,
  selected,
  digit,
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

  const chooseIcon = () => {
    if (selected) {
      return selectedIcon;
    }
    if (!color) {
      return icon;
    }
    return colorizeIcon(getColor(color), digit);
  };

  const defineOffset = () => {
    if (selected) {
      return 2;
    }
    if (color) {
      return 1;
    }
    return 0;
  };

  return (
    <Marker
      position={[item.latitude, item.longitude]}
      icon={chooseIcon()}
      eventHandlers={{ click: onMarkerClick }}
      zIndexOffset={defineOffset()}
    >
      <Tooltip>
        <span className="text-sm font-medium text-gray-900">{item.name}</span>
      </Tooltip>
    </Marker>
  );
};

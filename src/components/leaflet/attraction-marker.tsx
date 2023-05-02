import { divIcon, LeafletMouseEvent } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker, Tooltip, useMap } from "react-leaflet";
import { ItineraryPlaceIcon, PlaceIcon, SelectedPlaceIcon } from "./icon";

const icon = divIcon({
  className: "",
  html: renderToStaticMarkup(<PlaceIcon />),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const colorizeIcon = (color?: string, digit?: number) => {
  return divIcon({
    className: "",
    html: renderToStaticMarkup(
      <ItineraryPlaceIcon digit={digit} color={color} />
    ),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const selectedIcon = L.divIcon({
  className: "",
  html: renderToStaticMarkup(<SelectedPlaceIcon />),
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
    return colorizeIcon(color, digit);
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

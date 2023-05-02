import { getColor } from "@/utils/color";
import { FaMapMarker, FaMapMarkerAlt } from "react-icons/fa";

export const SelectedPlaceIcon = () => (
  <FaMapMarkerAlt className="h-14 w-14 text-blue-500" />
);

export const PlaceIcon = () => (
  <FaMapMarkerAlt className="h-10 w-10 fill-slate-700" />
);

type ItineraryPlaceIconProps = {
  digit?: number;
  color?: string;
};

export const ItineraryPlaceIcon = ({
  digit,
  color,
}: ItineraryPlaceIconProps) => {
  const iconColor = color ? getColor(color) : "";

  if (!digit) {
    return <FaMapMarkerAlt className={`h-9 w-9 pl-1 pt-0.5 ${iconColor}`} />;
  }

  return (
    <span className="flex h-10 w-10">
      <span className="z-10 w-10 text-center text-lg font-medium text-white">
        {digit}
      </span>
      <span className="absolute z-0">
        <FaMapMarker className={`h-10 w-10 fill-white`} />
      </span>
      <span className="absolute z-0">
        <FaMapMarker className={`h-9 w-9 pl-1 pt-0.5 ${iconColor}`} />
      </span>
    </span>
  );
};

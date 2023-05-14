import { ItineraryPlaceIcon } from "@/components/leaflet/icon";
import {
  Itinerary,
  ItineraryPlace,
  ItineraryPlaceAttraction,
} from "@/server/api/routers/itinerary";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classNames from "classnames";
import { FaTrash } from "react-icons/fa";

type PlaceProps = {
  place: ItineraryPlace;
  selected: boolean;
  itinerary: Itinerary;
  onClick: (attraction: ItineraryPlaceAttraction) => void;
  onDelete: (
    attraction: ItineraryPlaceAttraction,
    itinerary: Itinerary
  ) => void;
};

export const Place = ({
  place,
  selected,
  itinerary,
  onClick,
  onDelete,
}: PlaceProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
  } = useSortable({ id: place.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onClick(place.attraction)}
      className={classNames(
        "group flex flex-row items-center gap-5 rounded-lg border border-gray-200 bg-white p-4 shadow transition duration-300 ease-in-out hover:cursor-pointer hover:shadow-lg",
        selected ? "shadow-xl" : ""
      )}
    >
      <div
        {...attributes}
        {...listeners}
        ref={setActivatorNodeRef}
        className={classNames("flex items-center", selected ? "scale-150" : "")}
      >
        <ItineraryPlaceIcon color={itinerary.color.name} digit={place.order} />
      </div>
      <div>
        <h5 className="text-xl font-medium leading-tight text-neutral-800">
          {place.attraction?.name}
          <br />
          <small className="text-neutral-500">
            {place.attraction.nameLocal}
            <br />
            {place.order}
            <br />
            {place.id}
          </small>
        </h5>
      </div>
      <div className="invisible ml-auto group-hover:visible">
        <button
          type="button"
          className="bg-white text-gray-400 hover:text-gray-500"
          onClick={() => onDelete(place.attraction, itinerary)}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

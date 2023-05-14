import { DropdownMenu } from "@/components/layout/drop-down-menu";
import { ModalDialog } from "@/components/layout/modal-dialog";
import { BasicAttractionInfo } from "@/server/api/routers/attraction";
import {
  Directions,
  Itinerary,
  ItineraryPlace,
} from "@/server/api/routers/itinerary";
import { api } from "@/utils/api";
import { Active, DndContext } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { Attraction } from "@prisma/client";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Place } from "./place";
import { PlaceDistance } from "./place-distance";

type ItineraryPlanProps = {
  itinerary: Itinerary;
  selectedPoi?: BasicAttractionInfo;
  onPoiClick(item: BasicAttractionInfo): void;
  onDeleteItinerary(itinerary: Itinerary): void;
  onRemoveFromItinerary(place: Attraction, itinerary: Itinerary): void;
  onDirectionsCalculated(data: Directions): void;
};

export const ItineraryPlan = ({
  itinerary,
  selectedPoi,
  onPoiClick,
  onRemoveFromItinerary,
  onDeleteItinerary,
  onDirectionsCalculated,
}: ItineraryPlanProps) => {
  const [showEditModel, setShowEditModal] = useState(false);
  const ctx = api.useContext();

  const [active, setActive] = useState<Active | null>(null);

  const [nameInput, setNameInput] = useState(itinerary.name);

  const { mutate: updateItinerary, isLoading: isUpdating } =
    api.itinerary.updateItinerary.useMutation({
      onSuccess: () => {
        ctx.itinerary.fetchItineraries.invalidate();
        toast.success("Itinerary details updated!");
        setShowEditModal(false);
      },
      onError: (e) => {
        const errorMessages = e.data?.zodError?.fieldErrors;
        if (errorMessages) {
          for (let key in errorMessages) {
            let messages = errorMessages[key];
            if (messages && messages[0]) {
              toast.error(`${key}: ${messages[0]}`);
            }
          }
        } else {
          ("Failed to update itinerary details! Please try again later.");
        }
      },
    });

  const { mutate: updatePlace, isLoading: isUpdatingPlace } =
    api.itinerary.updatePlace.useMutation();

  const handleClose = () => setShowEditModal(false);
  const handleShow = () => {
    setNameInput(itinerary.name);
    setShowEditModal(true);
  };
  const handleConfirm = () => {
    updateItinerary({
      id: itinerary.id,
      name: nameInput,
    });
  };

  const [sortedPlaces, setSortedPlaces] = useState(
    itinerary.places.sort(
      (placeOne, placeTwo) => placeOne.order - placeTwo.order
    )
  );

  const onChange = (items: ItineraryPlace[]) => {
    const q = items.map((item, idx) => {
      return { ...item, order: idx + 1 };
    });
    setSortedPlaces(q);
  };

  return (
    <div>
      <div className="flex w-full items-center">
        <div className="flex-grow">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            {itinerary.name}
          </h3>
        </div>

        <DropdownMenu>
          <button
            className="group flex w-full items-center"
            type="button"
            onClick={handleShow}
          >
            <FaEdit className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Edit
          </button>
          <button
            className="group flex w-full items-center"
            type="button"
            onClick={() => onDeleteItinerary(itinerary)}
          >
            <FaTrash className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Delete
          </button>
        </DropdownMenu>
      </div>

      <div className="space-y-5 pt-5">
        <DndContext
          onDragStart={({ active }) => {
            setActive(active);
          }}
          onDragEnd={({ active, over }) => {
            console.log("dragend");
            if (over && active.id !== over?.id) {
              const activeIndex = sortedPlaces.findIndex(
                ({ id }) => id === active.id
              );
              const overIndex = sortedPlaces.findIndex(
                ({ id }) => id === over.id
              );
              updatePlace({
                id: active.id.toString(),
                order: overIndex + 1,
              });
              updatePlace({
                id: over.id.toString(),
                order: activeIndex + 1,
              });
              onChange(arrayMove(sortedPlaces, activeIndex, overIndex));
            }
            setActive(null);
          }}
        >
          <SortableContext items={sortedPlaces.map((place) => place.id)}>
            {sortedPlaces.map((place, index) => (
              <>
                <Place
                  key={place.id}
                  place={place}
                  selected={selectedPoi?.id === place.attractionId}
                  itinerary={itinerary}
                  onClick={onPoiClick}
                  onDelete={onRemoveFromItinerary}
                />
                {index !== itinerary.places.length - 1 && (
                  <PlaceDistance
                    start={place}
                    end={sortedPlaces[index + 1]}
                    onDirectionsCalculated={onDirectionsCalculated}
                  />
                )}
              </>
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <ModalDialog
        isOpen={showEditModel}
        isBusy={isUpdating}
        title="Edit itinerary"
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      >
        <div className="flex items-center">
          <div className="flex-grow border-b border-gray-300 focus-within:border-indigo-600">
            <input
              type="text"
              name="name"
              id="name"
              className="block w-full border-0 border-b border-transparent bg-gray-50 text-sm focus:border-indigo-600 focus:ring-0"
              placeholder="Enter itinerary name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              disabled={isUpdating}
            />
          </div>
        </div>
      </ModalDialog>
    </div>
  );
};

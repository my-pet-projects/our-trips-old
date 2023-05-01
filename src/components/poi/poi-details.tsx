import { LoadingSpinner } from "@/components/common/loading";
import { AppPopover } from "@/components/layout/app-popover";
import { ItineraryWithPlaces } from "@/pages/admin/trips/[tripId]/itinerary";
import { api } from "@/utils/api";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { Attraction, Itinerary } from "@prisma/client";
import { ChangeEvent } from "react";
import { PlacesImages as PlaceImages } from "./place-images";

type PointOfInterestDetailsProps = {
  id: string;
  onClose: () => void;
  availableItineraries: ItineraryWithPlaces[];
  onAddToItinerary: (placeId: Attraction, itinerary: Itinerary) => void;
  onRemoveFromItinerary: (placeId: string, itinerary: Itinerary) => void;
};

export const PointOfInterestDetails = ({
  id,
  onClose,
  availableItineraries,
  onAddToItinerary,
  onRemoveFromItinerary,
}: PointOfInterestDetailsProps) => {
  const { data: poi, isLoading } = api.attraction.findAttraction.useQuery({
    id: id,
  });

  const selectItinerary = (itinerary: Itinerary, selected: boolean) => {
    if (!poi) {
      throw new Error("poi should not be null");
    }
    console.log(itinerary);
    if (selected) {
      onAddToItinerary(poi, itinerary);
    } else {
      onRemoveFromItinerary(poi.id, itinerary);
    }
  };

  return (
    <div className="h-full bg-slate-100">
      <div className="flex h-full flex-col divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
        {isLoading && <LoadingSpinner />}
        {!isLoading && poi && (
          <>
            <div className="flex items-start justify-between px-5 py-5">
              <div className="flex flex-col text-lg font-medium text-gray-900">
                <span>{poi.name}</span>
                <span className="text-sm">{poi.nameLocal}</span>
              </div>
              <div className="divide flex h-7 items-center">
                <AppPopover buttonText="Itineraries" className="mr-5">
                  <div className="pb-4">Choose itineraries for this place</div>
                  <div className="flex flex-col space-y-4">
                    {availableItineraries.map((itinerary) => (
                      <ItinerarySelectionOption
                        key={itinerary.id}
                        itinerary={itinerary}
                        onSelectionChange={selectItinerary}
                        selected={itinerary.places.some(
                          (place) => place.attractionId === id
                        )}
                      />
                    ))}
                  </div>
                </AppPopover>

                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={onClose}
                >
                  <span className="sr-only">Close panel</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-6 text-sm">
              <div>{poi.description}</div>
              <div>
                <PlaceImages place={poi} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

type ItinerarySelectionOptionProps = {
  onSelectionChange: (itinerary: Itinerary, selected: boolean) => void;
  itinerary: Itinerary;
  selected: boolean;
};

const ItinerarySelectionOption = ({
  onSelectionChange,
  itinerary,
  selected,
}: ItinerarySelectionOptionProps) => {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSelectionChange(itinerary, e.target.checked);
  };

  return (
    <div>
      <input
        id={`itin-${itinerary.id}`}
        defaultValue={itinerary.name}
        type="checkbox"
        defaultChecked={selected}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
      <label
        htmlFor={`itin-${itinerary.id}`}
        className="ml-3 text-sm text-gray-500"
      >
        {itinerary.name}
      </label>
    </div>
  );
};

import { LoadingSpinner } from "@/components/common/loading";
import { Directions, ItineraryPlace } from "@/server/api/routers/itinerary";
import { api } from "@/utils/api";
import { GiPathDistance } from "react-icons/gi";

type PlaceDistanceProps = {
  start: ItineraryPlace;
  end?: ItineraryPlace;
  onDirectionsCalculated: (data: Directions) => void;
};

export const PlaceDistance = ({
  start,
  end,
  onDirectionsCalculated,
}: PlaceDistanceProps) => {
  if (!end) {
    return null;
  }

  const {
    data: trip,
    isLoading,
    refetch: recalculate,
    isRefetching,
  } = api.itinerary.getPlaceDistance.useQuery(
    {
      placeOne: {
        id: start.id,
        order: start.order,
        attractionId: start.attractionId,
        latitude: start.attraction.latitude,
        longitude: start.attraction.longitude,
      },
      placeTwo: {
        id: end.id,
        order: end.order,
        attractionId: end.attractionId,
        latitude: end.attraction.latitude,
        longitude: end.attraction.longitude,
      },
    },
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        onDirectionsCalculated(data);
      },
    }
  );

  const reCalculateDistances = () => {
    recalculate();
  };

  const isBusy = isLoading || isRefetching;

  return (
    <div className="flex h-5 flex-row justify-center gap-4">
      {isBusy && <LoadingSpinner />}
      {!isBusy && (
        <>
          {trip?.features[0] && (
            <span className="flex flex-row gap-2">
              <span className="text-sm text-slate-400">
                {(trip.features[0].properties.summary.distance / 1000).toFixed(
                  2
                )}{" "}
                km
              </span>
              <span className="text-sm text-slate-400">
                {(trip.features[0]?.properties.summary.duration / 60).toFixed(
                  2
                )}{" "}
                min
              </span>
            </span>
          )}
          <button
            className="group flex items-center"
            type="button"
            onClick={reCalculateDistances}
          >
            <GiPathDistance className="h-5 w-5 text-slate-400 group-hover:text-gray-500" />
          </button>
        </>
      )}
    </div>
  );
};

import { LoadingSpinner } from "@/components/common/loading";
import { api } from "@/utils/api";
import { XMarkIcon } from "@heroicons/react/20/solid";

type PointOfInterestDetailsProps = {
  id: string;
  onClose: () => void;
};

export const PointOfInterestDetails = ({
  id,
  onClose,
}: PointOfInterestDetailsProps) => {
  const { data: poi, isLoading } = api.attraction.findAttraction.useQuery({
    id: id,
  });

  return (
    <div className="h-full bg-slate-100">
      <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
        {isLoading && <LoadingSpinner />}
        {!isLoading && poi && (
          <>
            <div className="flex items-start justify-between px-4 py-5 sm:px-6">
              <div className="text-lg font-medium text-gray-900">title</div>
              <div className="ml-3 flex h-7 items-center">
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
            <div className="px-4 py-5 sm:p-6">{poi.name}</div>
          </>
        )}
      </div>
    </div>
  );
};

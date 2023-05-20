import { LoadingSpinner } from "@/components/common/loading";
import { AttractionInfo } from "@/server/api/routers/attraction";
import { api } from "@/utils/api";
import Image from "next/image";
import { FaGoogle, FaMapMarkedAlt } from "react-icons/fa";
import { SiOpenstreetmap } from "react-icons/si";

type PlaceImagesProps = {
  place: AttractionInfo;
};

export const PlacesImages = ({ place }: PlaceImagesProps) => {
  const { data: searchResult, isLoading } =
    api.attraction.findAttractionImages.useQuery({
      name: place.nameLocal ?? place.name,
      city: place.city.name,
    });

  const googleSearchUrl = () =>
    `https://www.google.com/search?q=${place.nameLocal}+${place.city.name}&tbm=isch`;

  const googleMapUrl = (latitude: number, longitude: number) => {
    return `https://www.google.com/maps/@${latitude},${longitude},20z`;
  };

  const openStreetMapUrl = (latitude: number, longitude: number) => {
    return `https://www.openstreetmap.org?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
  };

  return (
    <div className="mt-5 flex flex-col">
      {isLoading && (
        <div className="flex justify-center">
          <LoadingSpinner size={40} />
        </div>
      )}
      {!isLoading && (
        <>
          <div className="-ml-2 -mr-2 flex flex-wrap">
            {searchResult?.images.map((image, idx) => (
              <div key={idx} className="flex w-1/3 p-2 sm:w-1/6">
                <Image
                  alt="gallery"
                  className="block h-full max-h-48 w-full rounded-lg object-cover object-center"
                  src={image.src}
                  width={200}
                  height={200}
                  quality={100}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-5">
            <a
              href={googleSearchUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <FaGoogle /> Google Search results
            </a>
            <a
              target="_blank"
              href={googleMapUrl(place.latitude, place.longitude)}
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <FaMapMarkedAlt /> Show on Google Maps
            </a>
            <a
              target="_blank"
              href={openStreetMapUrl(place.latitude, place.longitude)}
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <SiOpenstreetmap /> Show on OpenStreet Maps
            </a>
          </div>
        </>
      )}
    </div>
  );
};

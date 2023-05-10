import { LoadingSpinner } from "@/components/common/loading";
import { AttractionInfo } from "@/server/api/routers/attraction";
import { api } from "@/utils/api";
import Image from "next/image";
import { FaGoogle } from "react-icons/fa";

type PlaceImagesProps = {
  place: AttractionInfo;
};

export const PlacesImages = ({ place }: PlaceImagesProps) => {
  const { data: images, isLoading } =
    api.attraction.findAttractionImages.useQuery({
      name: place.nameLocal ?? place.name,
      city: place.city.name,
    });

  const googleSearchUrl = () =>
    `https://www.google.com/search?q=${place.nameLocal}+${place.city.name}&tbm=isch`;

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
            {images?.map((image, idx) => (
              <div key={idx} className="flex w-1/3 p-2">
                <Image
                  alt="gallery"
                  className="block h-full max-h-40 w-full rounded-lg object-cover object-center"
                  src={image.src}
                  width={200}
                  height={200}
                />
              </div>
            ))}
          </div>
          <div className="pt-5">
            <a
              href={googleSearchUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <FaGoogle /> Search results
            </a>
          </div>
        </>
      )}
    </div>
  );
};

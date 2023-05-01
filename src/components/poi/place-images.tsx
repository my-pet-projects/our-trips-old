import { api } from "@/utils/api";
import { Attraction } from "@prisma/client";
import Image from "next/image";

type PlaceImagesProps = {
  place: Attraction;
};

export const PlacesImages = ({ place }: PlaceImagesProps) => {
  const { data: images, isLoading } =
    api.attraction.findAttractionImages.useQuery({
      name: place.nameLocal ?? place.name,
    });

  return (
    <div>
      <div className="container mx-auto px-5 py-2 lg:px-32 lg:pt-12">
        <div className="-m-1 flex flex-wrap md:-m-2">
          {images?.map((image, idx) => (
            <div key={idx} className="flex w-1/3 flex-wrap">
              <div className="w-full p-1 md:p-2">
                <img
                  alt="gallery"
                  className="block h-full w-full rounded-lg object-cover object-center"
                  src={image.src}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 px-5 py-2 md:grid-cols-5">
        {images?.map((image, idx) => (
          <div key={idx}>
            <Image
              className="h-auto max-w-full rounded-lg"
              src={image.src}
              alt=""
              width={200}
              height={200}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

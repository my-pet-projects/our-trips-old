import { LoadingPage, LoadingSpinner } from "@/components/common/loading";
import { CityPicker } from "@/components/geography/city-picker";
import { CountryPicker } from "@/components/geography/country-picker";
import { CityMapDynamic } from "@/components/leaflet/city-map-dynamic";
import { Coordinates } from "@/types/coordinates";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import type { City, Country } from "@prisma/client";
import { useRouter } from "next/router";
import { ClipboardEvent, useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const formSchema = z.object({
  attractionName: z.string().min(1, "Attraction name is required"),
  localName: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  url: z.string().optional().nullable(),
  countryId: z.string().min(1, "Country is required"),
  cityId: z.string().min(1, "City is required"),
  oldId: z.number().optional().nullable(),
});

type FormSchemaType = z.infer<typeof formSchema>;

const Attraction = () => {
  const { query, isReady } = useRouter();
  const attractionId = query.attractionId as string;

  const [selectedCountry, setSelectedCountry] = useState<Country | null>();
  const [selectedCity, setSelectedCity] = useState<City | null>();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    resetField,
    setValue,
  } = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
  });

  const { data: result, isLoading } = api.attraction.findAttraction.useQuery(
    {
      id: attractionId,
    },
    {
      enabled: isReady,
      refetchOnWindowFocus: false,
    }
  );

  const { mutate: editAttraction, isLoading: isEditing } =
    api.attraction.updateAttraction.useMutation();

  const { data: nearestCities, isLoading: isCitiesLoading } =
    api.geography.getNearestCities.useQuery(
      {
        latitude: result?.latitude || 0,
        longitude: result?.longitude || 0,
      },
      {
        enabled: !!result,
      }
    );

  useEffect(() => {
    if (!result) {
      return;
    }
    setSelectedCountry(result.city.country);
    setSelectedCity(result.city);
    reset({
      attractionName: result.name,
      localName: result.nameLocal,
      address: result.address,
      description: result.description,
      latitude: result.latitude,
      longitude: result.longitude,
      url: result.originalUri,
      countryId: result.city.country.cca2,
      cityId: result.cityId,
    });
  }, [reset, result]);

  useEffect(() => {
    if (selectedCountry?.cca2 !== selectedCity?.countryCode) {
      setSelectedCity(null);
      resetField("cityId", { defaultValue: "" });
    }
  }, [selectedCountry, selectedCity, resetField]);

  const onSubmit: SubmitHandler<FormSchemaType> = (data) => {
    if (!selectedCity) {
      throw new Error("city should be selected");
    }
    editAttraction(
      {
        id: attractionId,
        name: data.attractionName,
        nameLocal: data.localName,
        address: data.address,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        originalUri: data.url,
        cityId: selectedCity.id,
      },
      {
        onSuccess: () => toast.success("Attraction updated successfully!"),
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
            toast.error("Failed to update attraction! Please try again later.");
          }
        },
      }
    );
  };

  function onCoordinatesPaste(event: ClipboardEvent): void {
    const coordinates = event.clipboardData.getData("Text").split(",");
    if (
      coordinates.length != 2 ||
      !coordinates[0] ||
      !coordinates[1] ||
      isNaN(+coordinates[0]) ||
      isNaN(+coordinates[1])
    ) {
      return;
    }
    event.preventDefault();
    setValue("latitude", +coordinates[0]);
    setValue("longitude", +coordinates[1]);
  }

  const onCoordinatesChange = (value: Coordinates) => {
    setValue("latitude", value.latitude);
    setValue("longitude", value.longitude);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div>
      <form
        onSubmit={(...args) => void handleSubmit(onSubmit)(...args)}
        autoComplete="off"
      >
        <div className="bg-white p-6">
          <div>
            <h2 className="text-lg font-medium leading-6 text-gray-900">
              Attraction details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Update attraction details information. Please note that ...
            </p>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <Controller
                render={({ field }) => (
                  <CountryPicker
                    selectedCountry={selectedCountry}
                    onSelectedCountryChange={setSelectedCountry}
                    onChange={field.onChange}
                  />
                )}
                control={control}
                name="countryId"
              />
              {errors.countryId && (
                <span className="mt-2 block text-red-800">
                  {errors.countryId?.message}
                </span>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <Controller
                render={({ field }) => (
                  <CityPicker
                    countryCode={selectedCountry?.cca2}
                    selectedCity={selectedCity}
                    onSelectedCityChange={setSelectedCity}
                    onChange={field.onChange}
                  />
                )}
                control={control}
                name="cityId"
              />
              {errors.cityId && (
                <span className="mt-2 block text-red-800">
                  {errors.cityId?.message}
                </span>
              )}
            </div>

            <div className="col-span-2">
              <label
                htmlFor="attractionName"
                className="block text-sm font-medium text-gray-700"
              >
                Attraction
              </label>
              <input
                type="text"
                id="attractionName"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                {...register("attractionName", { disabled: isEditing })}
              />
              {errors.attractionName && (
                <span className="mt-2 block text-red-800">
                  {errors.attractionName?.message}
                </span>
              )}
            </div>

            <div className="col-span-2">
              <label
                htmlFor="local-name"
                className="block text-sm font-medium text-gray-700"
              >
                Local name
              </label>
              <input
                type="text"
                id="local-name"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                {...register("localName", { disabled: isEditing })}
              />
            </div>

            <div className="col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                {...register("address", { disabled: isEditing })}
              />
            </div>

            <div className="col-span-2 row-span-3">
              {result && (
                <CityMapDynamic
                  cities={nearestCities}
                  selectedCity={result.city}
                  onChange={onCoordinatesChange}
                  coordinates={{
                    latitude: result.latitude,
                    longitude: result.longitude,
                  }}
                />
              )}
            </div>

            <div className="col-span-1 col-start-1">
              <label
                htmlFor="latitude"
                className="block text-sm font-medium text-gray-700"
              >
                Latitude
              </label>
              <input
                type="text"
                id="latitude"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                {...register("latitude", {
                  valueAsNumber: true,
                  disabled: isEditing,
                })}
                onPaste={onCoordinatesPaste}
              />
              {errors.latitude && (
                <span className="mt-2 block text-red-800">
                  {errors.latitude?.message}
                </span>
              )}
            </div>

            <div className="col-span-1">
              <label
                htmlFor="longitude"
                className="block text-sm font-medium text-gray-700"
              >
                Longitude
              </label>
              <input
                type="text"
                id="longitude"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                {...register("longitude", {
                  valueAsNumber: true,
                  disabled: isEditing,
                })}
              />
              {errors.longitude && (
                <span className="mt-2 block text-red-800">
                  {errors.longitude?.message}
                </span>
              )}
            </div>

            <div className="col-span-2 col-start-1">
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700"
              >
                Original URL
              </label>
              <input
                type="text"
                id="url"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                {...register("url", { disabled: isEditing })}
              />
            </div>

            <div className="col-span-4 col-start-1">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                rows={15}
                id="description"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                {...register("description", { disabled: isEditing })}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end bg-gray-50 py-3 px-6">
          {!isEditing && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              Save
            </button>
          )}
          {isEditing && (
            <div className="flex items-center justify-center">
              <LoadingSpinner size={37} />
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default Attraction;

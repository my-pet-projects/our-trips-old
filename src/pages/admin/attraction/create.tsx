import { CityPicker } from "@/components/geography/city-picker";
import { CountryPicker } from "@/components/geography/country-picker";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import type { City, Country } from "@prisma/client";
import { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  attractionName: z.string().min(1, "Attraction name is required"),
  localName: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  url: z.string().optional().nullable(),
  countryId: z.string().min(1, "Country is required"),
  cityId: z.string().min(1, "City is required"),
  oldId: z.number().optional().nullable(),
});

type FormSchemaType = z.infer<typeof formSchema>;

const AddAttraction = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>();
  const [selectedCity, setSelectedCity] = useState<City | undefined>();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
  });

  function onSelectedCountryChange(country: Country) {
    console.log("onSelectedCountryChange", country);
    setSelectedCountry(country);
    // if (!!selectedItem) {
    // } else {
    //   // setSelectedCountry(null);
    // }
  }

  function onSelectedCityChange(city: City) {
    console.log("onSelectedCityChange", city);
    setSelectedCity(city);
  }

  const { mutate: createAttraction, isLoading } =
    api.attraction.addAttraction.useMutation();

  const onSubmit: SubmitHandler<FormSchemaType> = (data) => {
    console.log(data);
    if (selectedCity === undefined) {
      throw new Error("city should be selected");
      return;
    }
    createAttraction({
      name: data.attractionName,
      cityId: selectedCity.id,
    });
  };

  useEffect(() => {
    if (selectedCountry?.cca2 !== selectedCity?.countryCode) {
      setSelectedCity(undefined);
    }
  }, [selectedCountry, selectedCity]);

  const onCountryChange = function (value?: Country | undefined): void {
    console.log(value);
  };

  const onCityChange = function (value?: City | undefined): void {
    console.log(value);
  };

  return (
    <>
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <section aria-labelledby="payment-details-heading">
          <form
            onSubmit={(...args) => void handleSubmit(onSubmit)(...args)}
            autoComplete="off"
          >
            <div className="shadow sm:overflow-hidden sm:rounded-md">
              <div className="bg-white py-6 px-4 sm:p-6">
                <div>
                  <h2
                    id="payment-details-heading"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Attraction details
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your billing information. Please note that updating
                    your location could affect your tax rates.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-4 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <Controller
                      render={({ field: { ...rest } }) => (
                        <CountryPicker
                          selectedItem={selectedCountry}
                          onSelectedItemChange={onSelectedCountryChange}
                          {...rest}
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
                      render={({ field: { ...rest } }) => (
                        <CityPicker
                          countryCode={selectedCountry?.cca2}
                          selectedItem={selectedCity}
                          onSelectedItemChange={onSelectedCityChange}
                          {...rest}
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
                      {...register("attractionName")}
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
                      {...register("localName")}
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
                      {...register("address")}
                    />
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
                      {...register("latitude", { valueAsNumber: true })}
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
                      {...register("longitude", { valueAsNumber: true })}
                    />
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
                      {...register("url")}
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
                      rows={5}
                      id="description"
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                      {...register("description")}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </>
  );
};

export default AddAttraction;

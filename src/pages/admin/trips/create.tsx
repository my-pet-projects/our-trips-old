import { LoadingSpinner } from "@/components/common/loading";
import { CountryPicker } from "@/components/geography/country-picker";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Country } from "@prisma/client";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Trip name is required"),
  countryId: z.string().min(1, "Country is required"),
});

type FormSchemaType = z.infer<typeof formSchema>;

const AddTrip = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>();
  const [destinations, setDestinations] = useState<string[]>([]);

  const { mutate: createTrip, isLoading: isCreating } =
    api.trip.addTrip.useMutation();

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

  const onSelectedCountryChange = (
    country?: Country | null | undefined
  ): void => {
    if (!country) {
      return;
    }
    setSelectedCountry(country);
    destinations.push(country.cca2);
    setDestinations(destinations);
  };

  const onSubmit: SubmitHandler<FormSchemaType> = (data) => {
    if (!destinations || destinations.length === 0) {
      return;
    }
    createTrip(
      {
        name: data.name,
        destinations: destinations,
      },
      {
        onSuccess: () => {
          toast.success("Trip created successfully!");
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
            toast.error("Failed to create trip! Please try again later.");
          }
        },
      }
    );
  };

  return (
    <div>
      <form
        onSubmit={(...args) => void handleSubmit(onSubmit)(...args)}
        autoComplete="off"
      >
        <div className="bg-white p-6">
          <div>
            <h2 className="text-lg font-medium leading-6 text-gray-900">
              Trip details
            </h2>
            <p className="mt-1 text-sm text-gray-500">Create a new trip.</p>
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
                    onSelectedCountryChange={onSelectedCountryChange}
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
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Trip
              </label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                {...register("name", { disabled: isCreating })}
              />
              {errors.name && (
                <span className="mt-2 block text-red-800">
                  {errors.name?.message}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end bg-gray-50 py-3 px-6">
          {!isCreating && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              Save
            </button>
          )}
          {isCreating && (
            <div className="flex items-center justify-center">
              <LoadingSpinner size={37} />
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddTrip;

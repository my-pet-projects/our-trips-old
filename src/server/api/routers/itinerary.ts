import { RouterOutputs } from "@/utils/api";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export type Itinerary = RouterOutputs["itinerary"]["fetchItineraries"][number];

export const itineraryRouter = createTRPCRouter({
  fetchItineraries: publicProcedure
    .input(
      z.object({
        tripId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.prisma.itinerary.findMany({
        where: {
          tripId: input.tripId,
        },
        include: {
          places: {
            include: {
              attraction: true,
            },
          },
          color: true,
        },
      });
      return result;
    }),

  createItinerary: publicProcedure
    .input(
      z.object({
        name: z.string(),
        tripId: z.string(),
        order: z.number(),
        colorId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.itinerary.create({
        data: {
          name: input.name,
          tripId: input.tripId,
          order: input.order,
          colorId: input.colorId,
        },
        include: {
          places: true,
        },
      });
      return result;
    }),

  deleteItinerary: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.itinerary.delete({
        where: {
          id: input.id,
        },
      });
      return result;
    }),

  addPlace: publicProcedure
    .input(
      z.object({
        itineraryId: z.string(),
        placeId: z.string(),
        order: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.itineraryPlace.create({
        data: {
          itineraryId: input.itineraryId,
          attractionId: input.placeId,
          order: input.order,
        },
        include: {
          attraction: true,
        },
      });
      return result;
    }),

  removePlace: publicProcedure
    .input(
      z.object({
        itineraryId: z.string(),
        placeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.itineraryPlace.deleteMany({
        where: {
          itineraryId: input.itineraryId,
          attractionId: input.placeId,
        },
      });
      return result;
    }),
});

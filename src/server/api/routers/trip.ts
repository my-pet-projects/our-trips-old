import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const tripRouter = createTRPCRouter({
  getTrips: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.trip.findMany({
      include: {
        destinations: {
          include: {
            country: true,
          },
        },
      },
    });

    return result;
  }),

  findTrip: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.prisma.trip.findFirst({
        where: {
          id: input.id,
        },
        include: {
          destinations: {
            include: {
              country: true,
            },
          },
        },
      });
      return result;
    }),

  addTrip: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(1),
        destinations: z.array(z.string().min(1)).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log("input", input);
      const result = await ctx.prisma.trip.create({
        data: {
          name: input.name,
          destinations: {
            create: input.destinations.map((dest) => {
              return {
                countryId: dest,
              };
            }),
          },
        },
      });

      return result;
    }),
});

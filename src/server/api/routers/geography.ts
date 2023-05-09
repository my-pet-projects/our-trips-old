import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const geographyRouter = createTRPCRouter({
  getCountries: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.country.findMany({
      orderBy: {
        nameCommon: "asc",
      },
    });
  }),

  getCities: publicProcedure
    .input(z.object({ countryCode: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.city.findMany({
        where: {
          countryCode: input.countryCode,
        },
        orderBy: {
          name: "asc",
        },
      });
    }),

  getNearestCities: publicProcedure
    .input(z.object({ latitude: z.number(), longitude: z.number() }))
    .query(async ({ ctx, input }) => {
      const distance = 0.1;
      return await ctx.prisma.city.findMany({
        where: {
          latitude: {
            gt: input.latitude - distance,
            lt: input.latitude + distance,
          },
          longitude: {
            gt: input.longitude - distance,
            lt: input.longitude + distance,
          },
        },
      });
    }),
});

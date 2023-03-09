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
});

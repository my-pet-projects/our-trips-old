import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const attractionRouter = createTRPCRouter({
  addAttraction: publicProcedure
    .input(
      z.object({
        name: z.string(),
        cityId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const voteInDb = await ctx.prisma.attraction.create({
        data: {
          name: input.name,
          cityId: input.cityId,
        },
      });

      return { success: true, vote: voteInDb };
    }),
  updateAttraction: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        cityId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const voteInDb = await ctx.prisma.attraction.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          cityId: input.cityId,
        },
      });

      return { success: true, vote: voteInDb };
    }),

  findAttraction: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.attraction.findFirst({
        where: {
          id: input.id,
        },
        include: {
          city: {
            include: {
              country: true,
            },
          },
        },
      });
    }),
  getAttractions: publicProcedure
    .input(
      z.object({
        cityId: z.string().optional(),
        countryCode: z.string().optional(),
        skip: z.number(),
        take: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const whereClause = {
        cityId: input.cityId,
        city: {
          countryCode: input.countryCode,
        },
      };
      const result = await ctx.prisma.$transaction([
        ctx.prisma.attraction.count({
          where: whereClause,
        }),
        ctx.prisma.attraction.findMany({
          skip: input.skip,
          take: input.take,
          where: whereClause,
          include: {
            city: true,
          },
          orderBy: {
            id: "asc",
          },
        }),
      ]);

      return {
        total: result[0] ?? 0,
        data: result[1],
      };
    }),

  getAllAttractions: publicProcedure
    .input(
      z.object({
        cityId: z.string().optional(),
        countryCode: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.prisma.attraction.findMany({
        take: 1500,
        where: {
          cityId: input.cityId,
          city: {
            countryCode: input.countryCode,
          },
        },
        include: {
          city: true,
        },
        orderBy: {
          id: "asc",
        },
      });

      return result;
    }),
});

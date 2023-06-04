import cheerio from "cheerio";
import { z } from "zod";

import { RouterOutputs } from "@/utils/api";
import { createTRPCRouter, publicProcedure } from "../trpc";

export type AttractionImage = {
  src: string;
};

export type BasicAttractionInfo =
  RouterOutputs["attraction"]["getAllAttractions"][number];

export type AttractionInfo = RouterOutputs["attraction"]["findAttraction"];

export const attractionRouter = createTRPCRouter({
  addAttraction: publicProcedure
    .input(
      z.object({
        name: z.string(),
        nameLocal: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        latitude: z.number(),
        longitude: z.number(),
        originalUri: z.string().optional().nullable(),
        cityId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const voteInDb = await ctx.prisma.attraction.create({
        data: {
          name: input.name,
          nameLocal: input.nameLocal,
          address: input.address,
          description: input.description,
          latitude: input.latitude,
          longitude: input.longitude,
          originalUri: input.originalUri,
          cityId: input.cityId,
        },
      });

      return { success: true, vote: voteInDb };
    }),

  deleteAttraction: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.attraction.delete({
        where: {
          id: input.id,
        },
      });
      return result;
    }),

  updateAttraction: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        nameLocal: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        latitude: z.number(),
        longitude: z.number(),
        originalUri: z.string().optional().nullable(),
        cityId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const attraction = await ctx.prisma.attraction.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          nameLocal: input.nameLocal,
          address: input.address,
          description: input.description,
          latitude: input.latitude,
          longitude: input.longitude,
          originalUri: input.originalUri,
          cityId: input.cityId,
        },
      });

      return attraction;
    }),

  findAttraction: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.attraction.findFirstOrThrow({
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

  findAttractionImages: publicProcedure
    .input(
      z.object({
        name: z.string(),
        city: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const name = input.name.replaceAll(" ", "+");
      const url = `https://www.google.com/search?q=${name}+${input.city}&tbm=isch&tbs=isz:l`;
      const res = await fetch(url);
      const data = await res.text();

      const attractionImages: AttractionImage[] = [];

      const cherioRoot = cheerio.load(data);
      const images = cherioRoot("img");
      images.each((_, element) => {
        const imgSrc = cherioRoot(element).attr("src");
        if (!imgSrc?.startsWith("http")) {
          return;
        }
        attractionImages.push({
          src: imgSrc,
        });
      });

      return { images: attractionImages, url: url };
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
        countryCodes: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.prisma.attraction.findMany({
        where: {
          cityId: input.cityId,
          city: {
            countryCode: {
              in: input.countryCodes,
            },
          },
        },
        orderBy: {
          id: "asc",
        },
        select: {
          id: true,
          name: true,
          city: {
            select: {
              id: true,
              name: true,
            },
          },
          latitude: true,
          longitude: true,
        },
      });

      return result;
    }),

  parseAttraction: publicProcedure
    .input(z.object({ url: z.string() }))
    .query(async ({ ctx, input }) => {
      if (input.url.includes("www.votpusk.ru")) {
        return parseVotpuskSite(input.url);
      }
      return parseRutravellerSite(input.url);
    }),
});

const parseRutravellerSite = async (url: string) => {
  const res = await fetch(url);
  const data = await res.text();

  const cherioRoot = cheerio.load(data);
  const description = cherioRoot(
    ".place-descr .place-descr__box .place-descr__txt"
  )
    .text()
    .trim()
    .replaceAll("\n\n", "\n");
  const combinedName = cherioRoot(".topline-city .bth__ttl-h2").text().trim();
  const names = /(?<name>.*)\((?<localName>.*)\)/g.exec(combinedName);
  const mapLink = cherioRoot(".place-descr .place-descr__box .flr")
    .children()
    .first()
    .attr("href");
  const coordinates = mapLink?.match(/[+-]?([0-9]*[.])?[0-9]+/g);

  return {
    name: names?.groups?.name?.trim() || combinedName,
    localName: names?.groups?.localName?.trim() || combinedName,
    latitude: coordinates && coordinates[0] ? +coordinates[0] : 0,
    longitude: coordinates && coordinates[1] ? +coordinates[1] : 0,
    description: description,
    url: url,
  };
};

const parseVotpuskSite = async (url: string) => {
  const res = await fetch(url);
  const data = await res.text();

  const cherioRoot = cheerio.load(data);
  const description = cherioRoot(".landmark-info__text p")
    .text()
    .trim()
    .replaceAll("\n\n", "\n");
  const name = cherioRoot(".block-head__title").text().trim();
  const subText = cherioRoot(".block-head__subtitle").text().trim();
  const localName = /Название на английском языке - (?<localName>.*)./g.exec(
    subText
  );
  const coordinates =
    /\"latitude\"\:(?<lat>[0-9]*[.][0-9]*),"longitude":(?<lon>[0-9]*[.][0-9]*)/g.exec(
      cherioRoot.html()
    );

  return {
    name: name,
    localName: localName?.groups?.localName || name,
    description: description,
    latitude: coordinates?.groups?.lat ? +coordinates.groups.lat : 0,
    longitude: coordinates?.groups?.lon ? +coordinates.groups.lon : 0,
    url: url,
  };
};

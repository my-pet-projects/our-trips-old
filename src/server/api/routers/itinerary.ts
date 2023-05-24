import { env } from "@/env.mjs";
import { Coordinates } from "@/types/coordinates";
import { RouterOutputs } from "@/utils/api";
import fs from "fs";
import { BBox, GeoJsonTypes } from "geojson";
import PDFDocument from "pdfkit";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export type Itinerary = RouterOutputs["itinerary"]["fetchItineraries"][number];
export type ItineraryPlace = Itinerary["places"][number];
export type ItineraryPlaceAttraction = ItineraryPlace["attraction"];

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
              attraction: {
                include: {
                  city: true,
                },
              },
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

  updateItinerary: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.itinerary.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
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
          attraction: {
            include: {
              city: true,
            },
          },
        },
      });
      return result;
    }),

  removePlace: publicProcedure
    .input(
      z.object({
        itineraryId: z.string(),
        attractionId: z.string(), // TODO: change to placeId
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.itineraryPlace.deleteMany({
        where: {
          itineraryId: input.itineraryId,
          attractionId: input.attractionId,
        },
      });
      return result;
    }),

  updatePlace: publicProcedure
    .input(
      z.object({
        id: z.string(),
        order: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.itineraryPlace.update({
        where: {
          id: input.id,
        },
        data: {
          order: input.order,
        },
      });
      return result;
    }),

  getPlaceDistance: publicProcedure
    .input(
      z.object({
        placeOne: z.object({
          id: z.string(),
          attractionId: z.string(),
          order: z.number(),
          latitude: z.number(),
          longitude: z.number(),
        }),
        placeTwo: z.object({
          id: z.string(),
          attractionId: z.string(),
          order: z.number(),
          latitude: z.number(),
          longitude: z.number(),
        }),
      })
    )
    .query(async ({ ctx, input }) => {
      let directions = {} as Directions;
      const dbDirections = await ctx.prisma.direction.findFirst({
        where: {
          startPlaceId: input.placeOne.id,
          endPlaceId: input.placeTwo.id,
        },
      });

      if (dbDirections) {
        directions = JSON.parse(
          dbDirections.directionsData as string
        ) as Directions;
      }

      if (!dbDirections) {
        console.info("Directions not found in DB, making HTTP call");
        const start = {
          latitude: input.placeOne.latitude,
          longitude: input.placeOne.longitude,
        };
        const end = {
          latitude: input.placeTwo.latitude,
          longitude: input.placeTwo.longitude,
        };
        directions = await fetchDirections(start, end);

        await ctx.prisma.direction.create({
          data: {
            startPlaceId: input.placeOne.id,
            endPlaceId: input.placeTwo.id,
            directionsData: JSON.stringify(directions),
          },
        });
      }

      directions.features.map((feature) => {
        const flippedCoordinates = feature.geometry.coordinates.map(
          (coordinates) => [coordinates[1], coordinates[0]]
        );
        return {
          ...feature,
          geometry: { ...feature.geometry, coordinates: flippedCoordinates },
        };
      });
      return {
        ...directions,
        placeIdOne: input.placeOne.id,
        placeIdTwo: input.placeTwo.id,
        placeOneOrder: input.placeOne.order,
        placeTwoOrder: input.placeTwo.order,
        attractionIdOne: input.placeOne.attractionId,
        attractionIdTwo: input.placeTwo.attractionId,
      };
    }),

  generatePdf: publicProcedure
    .input(
      z.object({
        tripId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const itineraries = await ctx.prisma.itinerary.findMany({
        where: {
          tripId: input.tripId,
        },
        include: {
          places: {
            include: {
              attraction: {
                include: {
                  city: true,
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
          color: true,
        },
        orderBy: {
          order: "asc",
        },
      });

      const stream = await generatePdf(itineraries);
      // await fsPromises.writeFile("test.pdf", stream);

      return {};
    }),
});

const generatePdf = async (itineraries: Itinerary[]) => {
  for (const itin of itineraries) {
    const ws = fs.createWriteStream(`${itin.name}.pdf`);
    const doc = new PDFDocument();
    doc.pipe(ws);
    doc.registerFont("Heading Font", "public/fonts/noto-sans-bold.ttf");
    doc.registerFont("Normal Font", "public/fonts/noto-sans-regular.ttf");
    doc.fontSize(10);
    doc.font("Normal Font");

    doc.font("Heading Font").fontSize(20).text(itin.name);

    for (const place of itin.places) {
      const data = await fetchStaticMap({
        latitude: place.attraction.latitude,
        longitude: place.attraction.longitude,
      });

      doc
        .font("Heading Font")
        .fontSize(15)
        .text(`${place.order} ${place.attraction.name}`);
      doc.fontSize(10).text(place.attraction.nameLocal || "");

      const imgHeight = 200;
      if (
        imgHeight +
          doc.y +
          doc.currentLineHeight(true) +
          doc.page.margins.top +
          doc.page.margins.bottom >
        doc.page.maxY()
      ) {
        doc.addPage();
      }

      doc.image(data, {
        height: imgHeight,
        align: "center",
        valign: "center",
      });
      doc.moveDown();

      doc
        .fontSize(10)
        .font("Normal Font")
        .text(place.attraction.description || "", { align: "justify" });
      doc.moveDown();
    }
    doc.end();
  }
};

const fetchStaticMap = async (coordinates: Coordinates) => {
  const host = "https://api.mapbox.com";
  const zoom = "15,0";
  const size = "300x200@2x";
  const marker = `pin-l+ba2626(${coordinates.longitude},${coordinates.latitude})`;
  const url = `${host}/styles/v1/mapbox/streets-v11/static/${marker}/${coordinates.longitude},${coordinates.latitude},${zoom}/${size}?access_token=${env.MAPBOX_SECRET}`;

  const res = await fetch(url);
  const data = await res.arrayBuffer();
  return data;
};

const fetchDirections = async (start: Coordinates, end: Coordinates) => {
  const host = "https://api.openrouteservice.org";
  const profile = "foot-walking";
  const url = `${host}/v2/directions/${profile}?api_key=${env.OPENROUTE_SECRET}&start=${start.longitude},${start.latitude}&end=${end.longitude},${end.latitude}`;

  const res = await fetch(url);
  const data = await res.json();
  return data as Directions;
};

export type Directions = {
  placeIdOne: string;
  attractionIdOne: string;
  placeOneOrder: number;
  placeIdTwo: string;
  placeTwoOrder: number;
  attractionIdTwo: string;
  itineraryId: string;
  type: GeoJsonTypes;
  features: Feature[];
  bbox: BBox | undefined;
  metadata: Metadata;
};

export type Feature = {
  bbox: number[];
  type: string;
  properties: Properties;
  geometry: Geometry;
};

export type Geometry = {
  coordinates: Array<number[]>;
  type: GeoJsonTypes;
};

export type Properties = {
  segments: Segment[];
  way_points: number[];
  summary: Summary;
};

export type Segment = {
  distance: number;
  duration: number;
  steps: Step[];
};

export type Step = {
  distance: number;
  duration: number;
  type: number;
  instruction: string;
  name: string;
  way_points: number[];
};

export type Summary = {
  distance: number;
  duration: number;
};

export type Metadata = {
  attribution: string;
  service: string;
  timestamp: number;
  query: Query;
  engine: Engine;
};

export type Engine = {
  version: string;
  build_date: Date;
  graph_date: Date;
};

export type Query = {
  coordinates: Array<number[]>;
  profile: string;
  format: string;
};

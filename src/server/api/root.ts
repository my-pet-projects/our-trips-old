import { attractionRouter } from "./routers/attraction";
import { exampleRouter } from "./routers/example";
import { geographyRouter } from "./routers/geography";
import { itineraryRouter } from "./routers/itinerary";
import { tripRouter } from "./routers/trip";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  geography: geographyRouter,
  attraction: attractionRouter,
  trip: tripRouter,
  itinerary: itineraryRouter,
});

export type AppRouter = typeof appRouter;

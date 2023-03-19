import { attractionRouter } from "./routers/attraction";
import { exampleRouter } from "./routers/example";
import { geographyRouter } from "./routers/geography";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  geography: geographyRouter,
  attraction: attractionRouter,
});

export type AppRouter = typeof appRouter;

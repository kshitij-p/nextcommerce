import imageRouter from "./routers/imageRouter";
import productRouter from "./routers/productRouter";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for the server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  product: productRouter,
  image: imageRouter,
});

export type AppRouter = typeof appRouter;

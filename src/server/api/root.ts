import cartRouter from "./routers/cartRouter";
import imageRouter from "./routers/imageRouter";
import paymentsRouter from "./routers/paymentsRouter";
import productRouter from "./routers/productRouter";
import reviewRouter from "./routers/reviewRouter";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for the server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  product: productRouter,
  image: imageRouter,
  cart: cartRouter,
  review: reviewRouter,
  payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;

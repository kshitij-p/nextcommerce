import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for the server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({});

export type AppRouter = typeof appRouter;

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const reviewRouter = createTRPCRouter({
  getForProduct: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input: { productId } }) => {
      const reviews = await ctx.prisma.review.findMany({
        where: {
          productId: productId,
        },
        include: {
          user: true,
        },
      });

      return {
        message: "Successfully got reviews for the requested product.",
        reviews: reviews,
      };
    }),
  create: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { productId, body } }) => {
      const review = await ctx.prisma.review.create({
        data: {
          productId: productId,
          userId: ctx.session.user.id,
          body: body,
        },
      });

      return {
        message: "Successfully created a review",
        review: review,
      };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input: { id } }) => {
      const toDelete = await ctx.prisma.review.findUnique({
        where: {
          id: id,
        },
      });

      if (!toDelete) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (toDelete.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const deletedReview = await ctx.prisma.review.delete({
        where: {
          id: toDelete.id,
        },
      });

      return {
        message: "Successfully deleted the requested review.",
        deletedReview: deletedReview,
      };
    }),
});

export default reviewRouter;

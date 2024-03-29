import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const ReviewRatingValidator = z.preprocess(
  (val) => parseInt(val as string),
  z.number().positive().min(1).max(5)
);

const reviewRouter = createTRPCRouter({
  getForProduct: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input: { productId } }) => {
      const reviews = await ctx.prisma.review.findMany({
        where: {
          productId: productId,
          userId: {
            not: ctx.session?.user.id,
          },
        },
        include: {
          user: true,
        },
      });

      const userReview = ctx.session
        ? await ctx.prisma.review.findUnique({
            where: {
              userId_productId: {
                productId: productId,
                userId: ctx.session.user.id,
              },
            },
            include: {
              user: true,
            },
          })
        : null;

      return {
        message: "Successfully got reviews for the requested product.",
        reviews: reviews,
        userReview: userReview,
      };
    }),
  create: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        body: z.string(),
        rating: ReviewRatingValidator,
      })
    )
    .mutation(async ({ ctx, input: { productId, body, rating } }) => {
      const review = await ctx.prisma.review.create({
        data: {
          productId: productId,
          userId: ctx.session.user.id,
          body: body,
          rating: rating,
        },
      });

      return {
        message: "Successfully created a review",
        review: review,
      };
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        rating: ReviewRatingValidator.optional(),
        body: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input: { id, rating, body } }) => {
      const toEdit = await ctx.prisma.review.findUnique({
        where: {
          id: id,
        },
      });

      if (!toEdit) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (toEdit.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const updatedReview = await ctx.prisma.review.update({
        where: {
          id: toEdit.id,
        },
        data: {
          rating: rating,
          body: body?.length ? body : undefined,
        },
      });

      return {
        message: "Successfully updated the requested review.",
        updatedReview: updatedReview,
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

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const productRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.prisma.product.findMany({
      include: {
        images: {},
      },
    });

    const images = await ctx.prisma.image.findMany();

    return {
      products,
      images,
    };
  }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        imageKey: z.string(),
        imagePublicUrl: z.string(),
      })
    )
    .mutation(
      async ({
        input: { title, description, imageKey, imagePublicUrl },
        ctx,
      }) => {
        const product = await ctx.prisma.product.create({
          data: {
            description: description,
            title: title,
            userId: ctx.session.user.id,
            images: {
              createMany: {
                data: {
                  key: imageKey,
                  publicUrl: imagePublicUrl,
                },
              },
            },
          },
        });

        return {
          message: "Successfully created the requested product.",
          product: product,
        };
      }
    ),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      })
    )
    .mutation(async ({ input: { id }, ctx }) => {
      const product = await ctx.prisma.product.findUnique({
        where: {
          id: id,
        },
        include: {
          user: {},
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (product.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const deletedProduct = await ctx.prisma.product.delete({
        where: {
          id: id,
        },
      });

      return {
        message: "Successfully deleted the requested product.",
        deletedProduct: deletedProduct,
      };
    }),
});

export default productRouter;

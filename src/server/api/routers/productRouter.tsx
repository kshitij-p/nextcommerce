import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "../../../env.mjs";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { deleteImage, deleteImageFromR2 } from "./imageRouter/util";

const getPublicUrlFromKey = (imageKey: string) => {
  return `${env.R2_PUBLIC_URL}/${imageKey}`;
};

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
        price: z.preprocess(
          (val) => parseInt(val as string),
          z.number().positive()
        ),
      })
    )
    .mutation(
      async ({ input: { title, description, imageKey, price }, ctx }) => {
        const images = [];

        if (imageKey) {
          images.push({
            key: imageKey,
            publicUrl: getPublicUrlFromKey(imageKey),
          });
        }

        let product;

        try {
          product = await ctx.prisma.product.create({
            data: {
              description: description,
              title: title,
              userId: ctx.session.user.id,
              price: price,
              images: {
                create: images,
              },
            },
          });
        } catch (e) {
          if (imageKey) {
            await deleteImageFromR2(imageKey);
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
          });
        }

        return {
          message: "Successfully created the requested product.",
          product: product,
        };
      }
    ),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        title: z.string().optional(),
        description: z.string().optional(),
        imageKey: z.string().optional(),
        imagePublicUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input: { id, title, description }, ctx }) => {
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

      const updatedProduct = await ctx.prisma.product.update({
        where: {
          id: id,
        },
        data: {
          description: description?.length ? description : undefined,
          title: title?.length ? title : undefined,
        },
      });

      return {
        message: "Successfully updated the requested product.",
        updatedProduct: updatedProduct,
      };
    }),
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
          images: {},
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

      for (let image of product.images) {
        try {
          await deleteImage(ctx.prisma, image.id);
        } catch (e) {
          continue;
        }
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

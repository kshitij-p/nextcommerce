import { type Product, ProductCategories } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { type NextApiResponse } from "next";
import { z } from "zod";
import { env } from "../../../env.mjs";
import {
  ProductCategoriesValidator,
  ProductPriceValidator,
} from "../../../utils/client";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { deleteImage, deleteImageFromR2 } from "./imageRouter/util";
import { stripeClient } from "../../../utils";

const getPublicUrlFromKey = (imageKey: string) => {
  return `${env.R2_PUBLIC_URL}/${imageKey}`;
};

const ProductIdValidator = z.string().min(1);

const getProductPageUrl = (id: string) => `/products/${id}`;

const createStripePrice = async (
  userId: string,
  { price, title }: Pick<Product, "price" | "title">
) => {
  return await stripeClient.prices.create({
    currency: "USD",
    unit_amount: price * 100, //* 100 to convert to dollars since unit_amount expects cents
    product_data: {
      name: `${userId}-${title}`,
      active: true,
    },
  });
};

const archiveStripePrice = async (id: string) => {
  return await stripeClient.prices.update(id, {
    active: false,
  });
};

const revalidateProduct = async ({
  res,
  product,
}: {
  res?: NextApiResponse;
  product: Product;
}) => {
  let revalidated = false;

  if (res) {
    try {
      await res.revalidate(getProductPageUrl(product.id));
      if (product.featured) {
        await res.revalidate("/");
      }
      revalidated = true;
    } catch (e) {
      revalidated = false;
    }
  }

  return revalidated;
};

const productRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        titleQuery: z.string().optional(),
        priceLte: ProductPriceValidator.optional(),
        category: ProductCategoriesValidator.optional(),
        cursor: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(
      async ({
        ctx,
        input: { titleQuery, priceLte, category, cursor, limit: passedLimit },
      }) => {
        //Pc screen can hold 6 times at a time. Featured products uses 10 as limit so havin same limit will make it load faster if home screen is loaded first.
        const LIMIT = passedLimit ?? 10;

        const products = await ctx.prisma.product.findMany({
          take: LIMIT + 1,
          where: {
            title: {
              contains: titleQuery,
              mode: "insensitive",
            },
            price: {
              lte: priceLte,
            },
            category: {
              equals: category,
            },
          },
          include: {
            images: true,
          },
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: {
            id: "asc",
          },
        });

        let nextCursor: typeof cursor | undefined = undefined;

        if (products.length > LIMIT) {
          nextCursor = products.pop()?.id;
        }

        return {
          message: "Successfully got all products.",
          products: products,
          nextCursor: nextCursor,
        };
      }
    ),
  getAutocomplete: publicProcedure
    .input(
      z.object({
        title: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ ctx, input: { title, limit: passedLimit } }) => {
      const LIMIT = passedLimit ?? 20;

      const products = title
        ? await ctx.prisma.product.findMany({
            take: LIMIT,
            where: {
              title: {
                startsWith: title.trim(),
                mode: "insensitive",
              },
            },
            orderBy: {
              id: "asc",
            },
          })
        : [];

      return {
        message:
          "Successfully got all products that start with the given title.",
        products: products,
      };
    }),
  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input: { limit: passedLimit }, ctx }) => {
      const LIMIT = passedLimit ?? 10;

      const products = await ctx.prisma.product.findMany({
        take: LIMIT,
        where: {
          featured: {
            equals: true,
          },
        },
        include: {
          images: true,
        },
      });

      return {
        message: "Successfully got the requested featured products.",
        products: products,
      };
    }),
  get: publicProcedure
    .input(z.object({ id: ProductIdValidator }))
    .query(async ({ input: { id }, ctx }) => {
      const product = await ctx.prisma.product.findUnique({
        where: {
          id: id,
        },
        include: {
          images: true,
          user: true,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return {
        message: "Successfully got the requested product.",
        product: product,
      };
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        imageKey: z.string(),
        price: ProductPriceValidator,
        category: z.nativeEnum(ProductCategories),
      })
    )
    .mutation(
      async ({
        input: { title, description, imageKey, price, category },
        ctx,
      }) => {
        const { session } = ctx;
        const images = [];

        if (imageKey) {
          images.push({
            key: imageKey,
            publicUrl: getPublicUrlFromKey(imageKey),
          });
        }

        let product;
        let stripePrice;

        try {
          stripePrice = await createStripePrice(session.user.id, {
            price,
            title,
          });

          product = await ctx.prisma.product.create({
            data: {
              description: description,
              title: title,
              userId: ctx.session.user.id,
              price: price,
              images: {
                create: images,
              },
              category: category,
              stripePriceId: stripePrice.id,
            },
          });

          await revalidateProduct({ res: ctx.res, product });
        } catch (e) {
          if (imageKey) {
            await deleteImageFromR2(imageKey);
          }
          if (stripePrice?.id) {
            await archiveStripePrice(stripePrice.id);
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
        id: ProductIdValidator,
        title: z.string().optional(),
        description: z.string().optional(),
        price: ProductPriceValidator.optional(),
      })
    )
    .mutation(async ({ input: { id, title, description, price }, ctx }) => {
      const { session } = ctx;
      const product = await ctx.prisma.product.findUnique({
        where: {
          id: id,
        },
        include: {
          user: true,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (product.userId !== session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      let stripePriceId;

      title = title?.length ? title : undefined;

      if (price) {
        await archiveStripePrice(product.stripePriceId);

        stripePriceId = (
          await createStripePrice(session.user.id, {
            price,
            title: title ?? product.title,
          })
        ).id;
      }

      const updatedProduct = await ctx.prisma.product.update({
        where: {
          id: id,
        },
        data: {
          description: description?.length ? description : undefined,
          title,
          price,
          stripePriceId,
        },
      });

      let revalidated = await revalidateProduct({
        res: ctx.res,
        product,
      });

      return {
        message: "Successfully updated the requested product.",
        updatedProduct: updatedProduct,
        revalidated: revalidated,
      };
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: ProductIdValidator,
      })
    )
    .mutation(async ({ input: { id }, ctx }) => {
      const product = await ctx.prisma.product.findUnique({
        where: {
          id: id,
        },
        include: {
          user: true,
          images: true,
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

      await archiveStripePrice(deletedProduct.stripePriceId);

      let revalidated = await revalidateProduct({
        res: ctx.res,
        product,
      });

      return {
        message: "Successfully deleted the requested product.",
        deletedProduct: deletedProduct,
        revalidated: revalidated,
      };
    }),
});

export default productRouter;

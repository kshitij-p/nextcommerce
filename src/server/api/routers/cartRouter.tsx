import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const CartItemQuantityValidator = z.coerce.number().positive();

const cartRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const cart = await ctx.prisma.cart.findUnique({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        cartItems: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }

    return {
      message: "Successfully got the current user's cart.",
      cart: cart,
    };
  }),
  getProduct: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input: { productId } }) => {
      const cartItem = await ctx.prisma.cartItem.findFirst({
        where: {
          cart: {
            userId: ctx.session.user.id,
          },
          AND: {
            productId: productId,
          },
        },
      });

      if (!cartItem) {
        return null;
      }

      return {
        message: "Successfully got the requested product from the user's cart.",
        cartItem: cartItem,
      };
    }),
  addToCart: protectedProcedure
    .input(
      z.object({ productId: z.string(), quantity: CartItemQuantityValidator })
    )
    .mutation(async ({ ctx, input: { productId, quantity } }) => {
      //Find or create cart
      const oldCart = await ctx.prisma.cart.upsert({
        where: {
          userId: ctx.session.user.id,
        },
        update: {},
        create: {
          cartItems: {
            create: [],
          },
          userId: ctx.session.user.id,
        },
        include: {
          cartItems: true,
        },
      });

      oldCart.cartItems.forEach((cartItem) => {
        if (cartItem.productId === productId) {
          throw new TRPCError({
            code: "CONFLICT",
          });
        }
      });

      const cartItem = await ctx.prisma.cartItem.create({
        data: {
          quantity: quantity,
          productId: productId,
          cartId: oldCart.id,
        },
      });

      return {
        message: "Successfully added to cart.",
        cartItem: cartItem,
      };
    }),
  updateQuantity: protectedProcedure
    .input(
      z.object({ cartItemId: z.string(), quantity: CartItemQuantityValidator })
    )
    .mutation(async ({ ctx, input: { cartItemId, quantity } }) => {
      const cart = await ctx.prisma.cart.findFirst({
        where: {
          cartItems: {
            some: {
              id: cartItemId,
            },
          },
        },
      });

      if (!cart) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (cart.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const cartItem = await ctx.prisma.cartItem.update({
        where: {
          id: cartItemId,
        },
        data: {
          quantity: quantity,
        },
      });

      return {
        message: "Successfully updated the request cart item's quantity.",
        updatedCartItem: cartItem,
      };
    }),
  deleteFromCart: protectedProcedure
    .input(z.object({ cartItemId: z.string() }))
    .mutation(async ({ ctx, input: { cartItemId } }) => {
      const cart = await ctx.prisma.cart.findFirst({
        where: {
          cartItems: {
            some: {
              id: cartItemId,
            },
          },
        },
      });

      if (!cart) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (cart.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const deletedCartItem = await ctx.prisma.cartItem.delete({
        where: {
          id: cartItemId,
        },
      });

      return {
        message: "Successfully deleted the request cart item.",
        deletedCartItem: deletedCartItem,
      };
    }),
});

export default cartRouter;

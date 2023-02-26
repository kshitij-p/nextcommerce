import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const CartItemQuantityValidator = z.preprocess(
  (val) => parseInt(val as string),
  z.number().positive()
);

const cartRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const cart = await ctx.prisma.cart.findUnique({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        cartItems: {
          include: {
            product: true,
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
            code: "BAD_REQUEST",
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
  deleteFromCart: protectedProcedure
    .input(z.object({ cartItemId: z.string() }))
    .mutation(async ({ ctx, input: { cartItemId } }) => {
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

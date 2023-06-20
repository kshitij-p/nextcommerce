import { z } from "zod";
import { stripeClient } from "../../../utils";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { env } from "../../../env.mjs";

const createStripeCheckout = async (
  lineItems: Array<{ price: string; quantity: number }>,
  email?: string | null
) => {
  return await stripeClient.checkout.sessions.create({
    line_items: lineItems,
    mode: "payment",
    submit_type: "pay",
    success_url: `${env.NEXTAUTH_URL}/payments/sucess`,
    customer_email: email ?? undefined,
  });
};

const paymentsRouter = createTRPCRouter({
  checkoutProduct: protectedProcedure
    .input(z.object({ quantity: z.number().positive(), productId: z.string() }))
    .mutation(
      async ({ ctx: { prisma, session }, input: { quantity, productId } }) => {
        const product = await prisma.product.findUnique({
          where: {
            id: productId,
          },
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
          });
        }

        const checkout = await createStripeCheckout(
          [
            {
              price: product.stripePriceId,
              quantity,
            },
          ],
          session.user.email
        );

        return checkout;
      }
    ),
  checkoutCart: protectedProcedure.mutation(
    async ({ ctx: { session, prisma } }) => {
      const cart = await prisma.cart.findUnique({
        where: {
          userId: session.user.id,
        },
        include: {
          cartItems: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart) throw new TRPCError({ code: "NOT_FOUND" });

      const checkout = createStripeCheckout(
        cart.cartItems.map((item) => ({
          price: item.product.stripePriceId,
          quantity: item.quantity,
        })),
        session.user.email
      );

      return checkout;
    }
  ),
});

export default paymentsRouter;

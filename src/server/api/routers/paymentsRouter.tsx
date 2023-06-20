import { z } from "zod";
import { stripeClient } from "../../../utils";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { env } from "../../../env.mjs";

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

        const checkout = await stripeClient.checkout.sessions.create({
          line_items: [
            {
              price: product.stripePriceId,
              quantity,
            },
          ],
          mode: "payment",
          submit_type: "pay",
          success_url: `${env.NEXTAUTH_URL}/payments/sucess`,
          customer_email: session.user.email ?? undefined,
        });

        return checkout;
      }
    ),
});

export default paymentsRouter;

import { type Product } from "@prisma/client";
import type useTRPCUtils from "../useTRPCUtils";

type ApiUtils = ReturnType<typeof useTRPCUtils>;

export const cancelCartItemQuery = async ({
  utils,
  productId,
}: {
  utils: ApiUtils;
  productId: Product["id"];
}) => {
  await utils.cart.getProduct.cancel({ productId });
  await utils.cart.get.cancel();
};

export const invalidateCartItemQuery = async ({
  utils,
  productId,
}: {
  utils: ApiUtils;
  productId: Product["id"];
}) => {
  await utils.cart.getProduct.invalidate({ productId });
  await utils.cart.get.invalidate();
};

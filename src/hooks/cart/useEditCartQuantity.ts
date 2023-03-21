import { type Product } from "@prisma/client";
import { api } from "../../utils/api";
import toast from "../../utils/toast";
import useTRPCUtils from "../useTRPCUtils";
import { cancelCartItemQuery, invalidateCartItemQuery } from "./utils";

const useEditCartQuantity = ({
  productId,
  toastOnSuccess = false,
}: {
  productId: Product["id"];
  toastOnSuccess?: boolean;
}) => {
  const utils = useTRPCUtils();

  return api.cart.updateQuantity.useMutation({
    onMutate: async (input) => {
      await cancelCartItemQuery({ utils, productId });

      const previousCart = utils.cart.get.getData();
      const previousCartProduct = utils.cart.getProduct.getData({ productId });

      utils.cart.get.setData(undefined, (currState) => {
        if (!currState) {
          return currState;
        }

        return {
          ...currState,
          message: "Optimistic update",
          cart: {
            ...currState.cart,
            cartItems: currState.cart.cartItems.map((cartItem) => {
              if (cartItem.productId !== productId) {
                return cartItem;
              }

              return { ...cartItem, quantity: input.quantity };
            }),
          },
        };
      });

      utils.cart.getProduct.setData({ productId }, (currState) => {
        if (!currState) {
          return currState;
        }

        return {
          ...currState,
          message: "Optimistic update",
          cartItem: {
            ...currState.cartItem,
            quantity: input.quantity,
          },
        };
      });

      return { previousCart: previousCart, previousCartProduct };
    },
    onError: (error, _, ctx) => {
      if (!ctx) {
        return;
      }
      utils.cart.get.setData(undefined, ctx.previousCart);
      utils.cart.getProduct.setData({ productId }, ctx.previousCartProduct);
    },
    onSettled: async () => {
      await invalidateCartItemQuery({ utils, productId });
    },
    onSuccess: () => {
      if (toastOnSuccess) {
        toast("Updated quantity in cart", {
          type: "success",
        });
      }
    },
  });
};

export default useEditCartQuantity;

import { getQueryKey } from "@trpc/react-query";
import React from "react";
import Button from "../components/Button";
import ProtectedPage from "../components/ProtectedPage";
import useTRPCUtils from "../hooks/useTRPCUtils";
import { api } from "../utils/api";
import { TIME_IN_MS } from "../utils/client";

export const CART_GET_QUERY_KEY = getQueryKey(api.cart.get, undefined, "query");

const RemoveFromCartButton = ({ cartItemId }: { cartItemId: string }) => {
  const utils = useTRPCUtils();

  const { mutateAsync, isLoading } = api.cart.deleteFromCart.useMutation({
    onMutate: async () => {
      await utils.cart.get.cancel();

      const previousCart = utils.cart.get.getData();

      utils.cart.get.setData(undefined, (data) => {
        if (!data) {
          return;
        }

        const { cart: currCart } = data;

        return {
          message: "Optimistic update",
          cart: {
            ...currCart,
            currItems: currCart.cartItems.filter(
              (cartItem) => cartItem.id !== cartItemId
            ),
          },
        };
      });

      return { previousCart: previousCart };
    },

    onSettled: async () => {
      await utils.cart.get.invalidate();
    },
    onError: (err, deletedItem, ctx) => {
      if (!ctx) {
        return;
      }

      utils.cart.get.setData(undefined, ctx.previousCart);
    },
    onSuccess: async (data) => {
      //To do throw a toast here
      await utils.cart.getProduct.invalidate({
        productId: data.deletedCartItem.productId,
      });
      console.log("successfully removed from cart");
    },
  });

  return (
    <Button
      disabled={isLoading}
      onClick={async () => {
        await mutateAsync({ cartItemId: cartItemId });
      }}
    >
      Remove from cart
    </Button>
  );
};

const CartPage = () => {
  const {
    data: { cart },
  } = api.cart.get.useQuery(undefined, {
    staleTime: TIME_IN_MS.FIVE_MINUTES,
    initialData: {
      message: "Initial data",
      cart: {
        userId: "",
        cartItems: [],
        id: "",
      },
    },
    initialDataUpdatedAt: 0,
  });

  return (
    <div>
      {cart.cartItems.map(({ product, id, quantity }) => {
        return (
          <div key={product.id}>
            <p>{product.title}</p>
            <p>{product.description}</p>
            <p>{`$${product.price}`}</p>
            <p>
              Quantity <b>{quantity}</b>
            </p>
            <RemoveFromCartButton cartItemId={id} />
          </div>
        );
      })}
    </div>
  );
};

export default ProtectedPage(CartPage);

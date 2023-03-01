import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import React from "react";
import Button from "../components/Button";
import { api, type RouterOutputs } from "../utils/api";

const RemoveFromCartButton = ({ cartItemId }: { cartItemId: string }) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = api.cart.deleteFromCart.useMutation({
    onMutate: async () => {
      const queryKey = getQueryKey(api.cart.get, undefined, "query");

      await queryClient.cancelQueries(queryKey);

      const previousCart =
        queryClient.getQueryData<RouterOutputs["cart"]["get"]>(queryKey);

      queryClient.setQueryData<RouterOutputs["cart"]["get"]>(
        queryKey,
        (data) => {
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
        }
      );

      return { previousCart: previousCart };
    },

    onSettled: async () => {
      const queryKey = getQueryKey(api.cart.get, undefined, "query");

      await queryClient.invalidateQueries(queryKey);
    },
    onError: (err, deletedItem, ctx) => {
      if (!ctx) {
        return;
      }

      const queryKey = getQueryKey(api.cart.get, undefined, "query");

      queryClient.setQueryData<RouterOutputs["cart"]["get"]>(
        queryKey,
        ctx.previousCart
      );
    },
    onSuccess: () => {
      //To do throw a toast here
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
    initialData: {
      message: "Initial data",
      cart: {
        userId: "",
        cartItems: [],
        id: "",
      },
    },
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

export default CartPage;

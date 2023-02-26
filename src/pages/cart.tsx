import { type Cart, type CartItem, type Product } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import React from "react";
import Button from "../components/Button";
import { api } from "../utils/api";

type PopulatedCart = Cart & {
  cartItems: (CartItem & {
    product: Product;
  })[];
};

const RemoveFromCartButton = ({ cartItemId }: { cartItemId: string }) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = api.cart.deleteFromCart.useMutation({
    onMutate: async () => {
      const queryKey = getQueryKey(api.cart.get);

      await queryClient.cancelQueries(queryKey);

      const previousCart = queryClient.getQueryData<PopulatedCart>(queryKey);

      queryClient.setQueryData<PopulatedCart>(queryKey, (currCart) => {
        if (!currCart) {
          return;
        }

        return {
          ...currCart,
          currItems: currCart.cartItems.filter(
            (cartItem) => cartItem.id !== cartItemId
          ),
        };
      });

      return { previousCart: previousCart };
    },

    onSettled: async () => {
      const queryKey = getQueryKey(api.cart.get);

      await queryClient.invalidateQueries(queryKey);
    },
    onError: (err, deletedItem, ctx) => {
      if (!ctx) {
        return;
      }

      const queryKey = getQueryKey(api.cart.get);

      queryClient.setQueryData<PopulatedCart>(queryKey, ctx.previousCart);
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
  const { data } = api.cart.get.useQuery(undefined, {
    initialData: {
      message: "Initial data",
      cart: {
        userId: "",
        cartItems: [],
        id: "",
      },
    },
  });

  const {
    cart,
  }: {
    cart: PopulatedCart;
  } = data;

  return (
    <div>
      {cart.cartItems.map(({ product, id }) => {
        return (
          <div key={product.id}>
            <p>{product.title}</p>
            <p>{product.description}</p>
            <p>{`$${product.price}`}</p>
            <RemoveFromCartButton cartItemId={id} />
          </div>
        );
      })}
    </div>
  );
};

export default CartPage;

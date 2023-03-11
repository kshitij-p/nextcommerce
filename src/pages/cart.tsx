import Link from "next/link";
import React, { useMemo } from "react";
import Button from "../components/Button";
import Divider from "../components/Divider";
import Image from "../components/Image";
import ProtectedPage from "../components/ProtectedPage";
import TruncatedText from "../components/TruncatedText";
import useTRPCUtils from "../hooks/useTRPCUtils";
import { api } from "../utils/api";
import { TIME_IN_MS } from "../utils/client";

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
      variants={{ size: "sm", type: "danger" }}
      disabled={isLoading}
      onClick={async () => {
        await mutateAsync({ cartItemId: cartItemId });
      }}
    >
      Remove
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

  ///To do add a fallback image here

  const totalPrice = useMemo(
    () =>
      cart.cartItems.reduce(
        (prev, curr) => curr.product.price * curr.quantity + prev,
        0
      ),
    [cart]
  );

  return (
    <div className="p-4 md:p-8">
      <div className="mobile-scrollbar flex h-[70vh] w-full flex-col gap-1 overflow-auto">
        {cart.cartItems.map(({ product, id, quantity }) => {
          return (
            <div className="flex w-full gap-2 p-2" key={product.id}>
              <Image
                fill
                Container={
                  <Link
                    href={`/products/${product.id}`}
                    prefetch={false}
                    className="w-28 shrink-0 md:w-56"
                  />
                }
                className="rounded-sm object-cover"
                src={product.images[0]?.publicUrl ?? ""}
                alt={`Image of ${product.title}`}
              />
              <div className="flex min-w-0 flex-col">
                <Link href={`/products/${product.id}`} prefetch={false}>
                  <TruncatedText
                    className="text-xl font-bold md:text-3xl"
                    title={product.title}
                    maxLines={2}
                  >
                    {product.title}
                  </TruncatedText>
                </Link>
                <p>{`$${product.price}`}</p>

                <div className="flex gap-2">
                  <p>Qty: </p>
                  <div className="flex gap-1">
                    <button>-</button>
                    <p className="font-semibold">{quantity}</p>
                    <button>+</button>
                  </div>
                </div>
                <div className="mt-1">
                  <RemoveFromCartButton cartItemId={id} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex w-full flex-col items-center">
        <div className="text-md flex w-full flex-col items-center">
          <div className="flex w-full items-end justify-between gap-1 px-4">
            <p>{`Total: `}</p>
            <b>{`$${totalPrice}`}</b>
          </div>
          <Divider
            className="my-2 bg-neutral-800"
            thickness="1px"
            size="100%"
          />
        </div>
        <div className="mt-2">
          <Button variants={{ type: "secondary", size: "lg" }}>Checkout</Button>
        </div>
      </div>
    </div>
  );
};

export default ProtectedPage(CartPage);

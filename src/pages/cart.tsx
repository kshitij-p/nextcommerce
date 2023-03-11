import Link from "next/link";
import React, { useMemo } from "react";
import Button from "../components/Button";
import Divider from "../components/Divider";
import Image from "../components/Image";
import ProtectedPage from "../components/ProtectedPage";
import TruncatedText from "../components/TruncatedText";
import useEditCartQuantity from "../hooks/cart/useEditCartQuantity";
import useTRPCUtils from "../hooks/useTRPCUtils";
import { api, type RouterOutputs } from "../utils/api";
import { TIME_IN_MS } from "../utils/client";

const RemoveFromCartButton = ({
  cartItemId,
  disabled,
  ...rest
}: Omit<React.ComponentProps<typeof Button>, "variants"> & {
  cartItemId: string;
}) => {
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
      {...rest}
      variants={{ size: "sm", type: "danger" }}
      disabled={disabled || isLoading}
      onClick={async () => {
        await mutateAsync({ cartItemId: cartItemId });
      }}
    >
      Remove
    </Button>
  );
};

const CartItem = ({
  cartItem,
}: {
  cartItem: RouterOutputs["cart"]["get"]["cart"]["cartItems"][0];
}) => {
  const { product, id, quantity } = cartItem;

  const { isLoading: isLoadingQuantity, mutateAsync: updateQuantity } =
    useEditCartQuantity({
      productId: cartItem.productId,
    });

  const handleUpdateQuantity = async (increment: number) => {
    await updateQuantity({
      cartItemId: cartItem.id,
      quantity: cartItem.quantity + increment,
    });
  };

  return (
    <div className="relative flex w-full gap-2 p-2 md:gap-4 xl:max-w-[50%]">
      <Image
        fill
        Container={
          <Link
            tabIndex={-1}
            href={`/products/${product.id}`}
            prefetch={false}
            className="w-36 shrink-0 md:w-56"
          />
        }
        className="rounded-sm object-cover"
        src={product.images[0]?.publicUrl ?? ""}
        alt={`Image of ${product.title}`}
      />
      <div className="flex min-w-0 flex-col md:text-2xl">
        <Link href={`/products/${product.id}`} prefetch={false}>
          <TruncatedText
            className="text-xl font-bold md:text-5xl"
            title={product.title}
            lineHeight={1}
            maxLines={2}
          >
            {product.title}
          </TruncatedText>
        </Link>
        <p>{`$${product.price}`}</p>
        <TruncatedText maxLines={2} lineHeight={1}>
          {product.description}
        </TruncatedText>
        <div className="flex gap-2">
          <p>Qty: </p>
          <div className="flex gap-1">
            <button
              onClick={async () => {
                await handleUpdateQuantity(-1);
              }}
            >
              -
            </button>
            <p className="font-semibold">{quantity}</p>
            <button
              onClick={async () => {
                await handleUpdateQuantity(1);
              }}
            >
              +
            </button>
          </div>
        </div>
        <div className="mt-auto mb-2">
          <RemoveFromCartButton cartItemId={id} disabled={isLoadingQuantity} />
        </div>
      </div>
    </div>
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
        {cart.cartItems.map((cartItem) => {
          return <CartItem cartItem={cartItem} key={cartItem.id} />;
        })}
      </div>
      <div className="flex w-full flex-col items-center">
        <div className="text-md flex w-full max-w-xl flex-col items-center md:text-4xl">
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

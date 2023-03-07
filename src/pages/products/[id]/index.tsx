import {
  type InferGetStaticPropsType,
  type GetStaticPaths,
  type GetStaticProps,
} from "next";
import { prisma } from "../../../server/db";

import { type Product } from "@prisma/client";
import PageWithFallback from "../../../components/PageWithFallback";
import Image from "../../../components/Image";
import ExpandableText from "../../../components/ExpandableText";
import Button from "../../../components/Button";
import { useSession } from "next-auth/react";
import React, { type ForwardedRef, useState } from "react";
import { api, type RouterOutputs } from "../../../utils/api";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateProducts, TIME_IN_MS } from "../../../utils/client";
import { z } from "zod";
import { getQueryKey } from "@trpc/react-query";
import { CART_GET_QUERY_KEY } from "../../cart";
import EditableText, {
  useEditableText,
} from "../../../components/EditableText";
import { EditableTextDialog } from "../../../components/EditableText";
import { type EditableTextProps } from "../../../components/EditableText/EditableTextDialog";
import DangerDialog from "../../../components/DangerDialog";
import Select from "../../../components/Select";
import Reviews from "../../../components/ProductPage/Reviews";

type EditableProductFields = keyof Omit<Product, "userId" | "id">;

type ProductPageProps = {
  product: RouterOutputs["product"]["get"]["product"] | null;
};

export type PageProduct = Exclude<
  InferGetStaticPropsType<typeof getStaticProps>["product"],
  null
>;

export const getStaticProps: GetStaticProps<ProductPageProps> = async (ctx) => {
  const id = z.string().parse(ctx.params?.id);

  const product = await prisma.product.findUnique({
    where: {
      id: id,
    },
    include: {
      images: true,
      user: true,
    },
  });

  return {
    props: {
      product: product,
    } satisfies ProductPageProps,
    revalidate: 31536000,
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: true,
  };
};

const ProductEditDialog = ({
  value,
  fieldToEdit,
  open,
  setOpen,
  product,
  onDiscard,
  onMutationComplete,
  canSave,
}: {
  value: string;
  fieldToEdit: EditableProductFields;
  open: EditableTextProps["open"];
  setOpen: EditableTextProps["setOpen"];
  product: PageProduct;
  onDiscard: EditableTextProps["onDiscard"];
  onMutationComplete: () => void;
  canSave: boolean;
}) => {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = api.product.update.useMutation({
    onSettled: async () => {
      const queryKey = getQueryKey(
        api.product.get,
        {
          id: product.id,
        },
        "query"
      );

      await queryClient.invalidateQueries(queryKey);
      await queryClient.invalidateQueries(CART_GET_QUERY_KEY);
    },
    onMutate: async () => {
      const queryKey = getQueryKey(
        api.product.get,
        {
          id: product.id,
        },
        "query"
      );

      await queryClient.cancelQueries(queryKey);
      await queryClient.cancelQueries(CART_GET_QUERY_KEY);

      queryClient.setQueryData<RouterOutputs["product"]["get"]>(queryKey, {
        message: "Optimistic update data",
        product: {
          ...product,
          [fieldToEdit]: value,
        } satisfies typeof product,
      });

      onMutationComplete();

      return { previousProduct: product };
    },
    onError: (err, newProduct, ctx) => {
      if (!ctx) {
        return;
      }

      const queryKey = getQueryKey(
        api.product.get,
        { id: product.id },
        "query"
      );

      queryClient.setQueryData(queryKey, ctx.previousProduct);
    },
    onSuccess: async () => {
      //To do throw a toast here
      await invalidateProducts(queryClient);
      console.log("Successfully edited");
    },
  });

  const handleSaveChanges = () => {
    mutate({ [fieldToEdit]: value, id: product.id });
  };

  return (
    <EditableTextDialog
      open={open}
      setOpen={setOpen}
      title={`Edit this product's ${fieldToEdit}`}
      isLoading={isLoading}
      onSaveChanges={handleSaveChanges}
      onDiscard={onDiscard}
      canSave={canSave}
    />
  );
};

const productValidators: {
  [k in EditableProductFields]: Zod.Schema;
} = {
  title: z.string().min(1, "Must contain atleast 1 character"),
  description: z.string().min(1, "Must contain atleast 1 character"),
  price: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .positive("Must be a positive number"),
};

const EditableProductText = ({
  children,
  canEdit,
  fieldToEdit,
  product,
  ...rest
}: Omit<React.ComponentProps<"p">, "children"> & {
  children: string;
  canEdit: boolean;
  as?: React.ReactElement<Record<string, unknown>>;
  inputElement?: "textarea" | "input";
  fieldToEdit: EditableProductFields;
  product: React.ComponentProps<typeof ProductEditDialog>["product"];
  onChangeComplete?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}) => {
  const {
    diagOpen,
    setDiagOpen,
    editing,
    setEditing,
    text,
    setText,
    errorMsg,
    setErrorMsg,
    onStopEditing,
  } = useEditableText();

  return (
    <EditableText
      {...rest}
      value={children}
      canEdit={canEdit}
      text={text}
      setText={setText}
      setDiagOpen={setDiagOpen}
      errorMsg={errorMsg}
      setErrorMsg={setErrorMsg}
      editing={editing}
      setEditing={setEditing}
      validatorSchema={productValidators[fieldToEdit]}
    >
      <ProductEditDialog
        onMutationComplete={onStopEditing}
        onDiscard={onStopEditing}
        open={diagOpen}
        setOpen={setDiagOpen}
        fieldToEdit={fieldToEdit}
        value={text}
        product={product}
        canSave={errorMsg ? false : true}
      />
    </EditableText>
  );
};

const ProductDeleteDialog = ({ productId }: { productId: string }) => {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const { mutate, isLoading } = api.product.delete.useMutation({
    onSuccess: async () => {
      //To do throw a toast here
      await invalidateProducts(queryClient);
      await queryClient.invalidateQueries(CART_GET_QUERY_KEY);
      console.log("Deleted");
    },
    onSettled: () => {
      setOpen(false);
    },
  });

  const handleDeleteClick = () => {
    mutate({ id: productId });
  };

  return (
    <DangerDialog
      openerProps={{ className: "order-last" }}
      open={open}
      setOpen={setOpen}
      title="Delete this product"
      openerChildren="Delete"
      confirmButtonChildren="Yes delete this"
      onConfirmDelete={handleDeleteClick}
      isLoading={isLoading}
    />
  );
};

const AddToCart = React.forwardRef(
  (
    { product }: { product: PageProduct },
    passedRef: ForwardedRef<HTMLDivElement>
  ) => {
    const queryClient = useQueryClient();

    const { status } = useSession();
    const isLoggedIn = status === "authenticated";

    const [quantityOptions] = useState(() => {
      let options: Array<{ value: number }> = [];
      for (let i = 0; i < 5; i++) {
        options.push({ value: i + 1 });
      }
      return options;
    });

    const [quantity, setQuantity] = useState<(typeof quantityOptions)[0]>(
      quantityOptions[0] as (typeof quantityOptions)[0]
    );

    const cancelCartItemQuery = async () => {
      const queryKey = getQueryKey(
        api.cart.getProduct,
        {
          productId: product.id,
        },
        "query"
      );

      await queryClient.cancelQueries(queryKey);
      await queryClient.cancelQueries(CART_GET_QUERY_KEY);
    };

    const invalidateCartItemQuery = async () => {
      const queryKey = getQueryKey(
        api.cart.getProduct,
        {
          productId: product.id,
        },
        "query"
      );

      await queryClient.invalidateQueries(queryKey);
      await queryClient.invalidateQueries(CART_GET_QUERY_KEY);
    };

    const { mutateAsync: addToCart, isLoading: isAdding } =
      api.cart.addToCart.useMutation({
        onMutate: cancelCartItemQuery,
        onSettled: invalidateCartItemQuery,
        onSuccess: () => {
          //To do throw a toast here
          console.log("added to cart");
        },
      });

    const { mutateAsync: updateQuantity, isLoading: isUpdatingQty } =
      api.cart.updateQuantity.useMutation({
        onMutate: cancelCartItemQuery,
        onSettled: invalidateCartItemQuery,
        onSuccess: () => {
          //To do throw a toast here
          console.log("updated product quantity");
        },
      });

    const { data } = api.cart.getProduct.useQuery(
      { productId: product.id },
      {
        enabled: isLoggedIn,
      }
    );

    const handleAddToCart = async () => {
      if (!isLoggedIn) {
        return;
      }

      //To do add a quantity picker here for selecting quantity
      //To do add react hook form here for validation
      if (!data) {
        await addToCart({
          productId: product.id,
          quantity: quantity.value,
        });
      } else {
        await updateQuantity({
          cartItemId: data.cartItem.id,
          quantity: data.cartItem.quantity + quantity.value,
        });
      }
    };

    return (
      <>
        <Select
          className="order-2"
          options={quantityOptions}
          value={quantity}
          setValue={setQuantity}
          textField={"value"}
          multiple={false}
          ref={passedRef}
        />
        <Button
          variants={{ type: "secondary" }}
          disabled={isAdding || isUpdatingQty}
          onClick={handleAddToCart}
        >
          Add to cart
        </Button>
      </>
    );
  }
);

AddToCart.displayName = "AddToCart";

const ProductPage = ({ product: passedProduct }: { product: PageProduct }) => {
  const { data: session } = useSession();

  //This query is only for optimistically updating the ui
  const {
    data: { product },
  } = api.product.get.useQuery(
    { id: passedProduct.id },
    {
      staleTime: TIME_IN_MS.FIVE_MINUTES,
      initialData: { message: "Initial data", product: passedProduct },
    }
  );

  const canEdit = product.userId === session?.user?.id;

  const editableProductTextProps: Omit<
    React.ComponentProps<typeof EditableProductText>,
    "children" | "fieldToEdit"
  > = {
    canEdit: canEdit,
    product: product,
  };

  return (
    <div className="flex w-full flex-col gap-4 p-5 text-zinc-300 md:p-8 xl:flex-row xl:gap-8">
      <Image
        className="rounded-sm object-cover"
        src={product.images?.[0]?.publicUrl ?? ""}
        alt={`Image of ${product.title}`}
        fill
        Container={
          <div className="w-full max-w-xl self-center xl:self-start" />
        }
      />
      <div className="flex w-full flex-col gap-2 text-lg md:gap-3 md:text-3xl xl:mt-2 xl:text-2xl">
        <EditableProductText
          className="text-3xl font-bold text-zinc-200 md:text-5xl xl:max-w-[80%]"
          {...editableProductTextProps}
          fieldToEdit={"title"}
          as={<h2 />}
        >
          {product.title}
        </EditableProductText>
        <div className="flex items-center text-2xl md:text-4xl">
          <p>$</p>
          <EditableProductText
            {...editableProductTextProps}
            fieldToEdit={"price"}
            inputElement={"input"}
          >
            {`${product.price}`}
          </EditableProductText>
        </div>
        {/* Font size for this is defined in the parent div */}
        <EditableProductText
          className="flex"
          {...editableProductTextProps}
          fieldToEdit={"description"}
          as={
            <ExpandableText
              className="mt-2 text-zinc-400 md:mt-3 xl:max-w-[80%]"
              maxLines={10}
            />
          }
        >
          {product.description}
        </EditableProductText>
        <div className="flex flex-wrap gap-2">
          <AddToCart product={product} />
          <Button>Buy now</Button>
          {canEdit ? <ProductDeleteDialog productId={product.id} /> : null}
        </div>
        <Reviews product={product} />
      </div>

      {/* To do add image fall back here */}
    </div>
  );
};

const MainPage = ({
  product,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  if (!product) {
    //To do show error page here
    return <div>Failed to get product</div>;
  }

  return <ProductPage product={product} />;
};

export default PageWithFallback(MainPage);

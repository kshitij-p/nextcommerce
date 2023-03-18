import {
  type InferGetStaticPropsType,
  type GetStaticPaths,
  type GetStaticProps,
} from "next";
import { prisma } from "../../../server/db";

import { type Product } from "@prisma/client";
import PageWithFallback from "../../../components/PageWithFallback";
import Image from "../../../components/ui/Image";
import ExpandableText from "../../../components/ui/ExpandableText";
import Button from "../../../components/ui/Button";
import { useSession } from "next-auth/react";
import React, { type ForwardedRef, useState } from "react";
import { api, type RouterOutputs } from "../../../utils/api";
import { TIME_IN_MS } from "../../../utils/client";
import { z } from "zod";
import EditableText, {
  useEditableText,
} from "../../../components/EditableText";
import { EditableTextDialog } from "../../../components/EditableText";
import { type EditableTextProps } from "../../../components/EditableText/EditableTextDialog";
import DangerDialog from "../../../components/ui/DangerDialog";
import Select from "../../../components/ui/Select";
import Reviews from "../../../components/ProductPage/Reviews";
import useTRPCUtils from "../../../hooks/useTRPCUtils";
import useEditCartQuantity from "../../../hooks/cart/useEditCartQuantity";
import {
  cancelCartItemQuery,
  invalidateCartItemQuery,
} from "../../../hooks/cart/utils";
import Error404Page from "../../404";
import Head from "next/head";

type EditableProductFields = keyof Omit<Product, "userId" | "id" | "category">;

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
  const utils = useTRPCUtils();

  const { mutate, isLoading } = api.product.update.useMutation({
    onSettled: async () => {
      await utils.product.get.invalidate({ id: product.id });
      await utils.cart.get.invalidate();
    },
    onMutate: async () => {
      await utils.product.get.cancel({ id: product.id });
      await utils.cart.get.cancel();

      const previousProduct = utils.product.get.getData({ id: product.id });

      utils.product.get.setData(
        { id: product.id },
        {
          message: "Optimistic update data",
          product: {
            ...product,
            [fieldToEdit]: value,
          } satisfies typeof product,
        }
      );

      onMutationComplete();

      return { previousProduct: previousProduct };
    },
    onError: (err, newProduct, ctx) => {
      if (!ctx) {
        return;
      }

      utils.product.get.setData({ id: product.id }, ctx.previousProduct);
    },
    onSuccess: async () => {
      //To do throw a toast here
      await utils.product.getAll.cancel();
      await utils.product.getAll.invalidate();
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
  labelText,
  fieldToEdit,
  product,
  ...rest
}: Omit<React.ComponentProps<"p">, "children"> & {
  children: string;
  canEdit: boolean;
  labelText?: string;
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
      labelText={labelText}
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
  const utils = useTRPCUtils();

  const [open, setOpen] = useState(false);

  const { mutate, isLoading } = api.product.delete.useMutation({
    onSuccess: async () => {
      //To do throw a toast here
      await utils.product.getAll.invalidate();
      await utils.cart.get.invalidate();
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
      open={open}
      setOpen={setOpen}
      title="Delete this product"
      openerProps={{ className: "ml-1 md:ml-2" }}
      openerChildren="Delete"
      confirmButtonChildren="Yes delete this"
      onConfirmDelete={handleDeleteClick}
      isLoading={isLoading}
    />
  );
};

const ProductBuyArea = React.forwardRef(
  (
    { product }: { product: PageProduct },
    passedRef: ForwardedRef<HTMLDivElement>
  ) => {
    const { status } = useSession();
    const isLoggedIn = status === "authenticated";

    const utils = api.useContext();

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

    const { mutateAsync: addToCart, isLoading: isAdding } =
      api.cart.addToCart.useMutation({
        onMutate: async () => {
          await cancelCartItemQuery({ utils, productId: product.id });
        },
        onSettled: async () => {
          await invalidateCartItemQuery({ utils, productId: product.id });
        },
        onSuccess: () => {
          //To do throw a toast here
          console.log("added to cart");
        },
      });

    const { mutateAsync: updateQuantity, isLoading: isUpdatingQty } =
      useEditCartQuantity({ productId: product.id });

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
        <Button
          variants={{ type: "secondary" }}
          disabled={isAdding || isUpdatingQty}
          onClick={handleAddToCart}
        >
          Add to cart
        </Button>
        <Button>Buy now</Button>
        <Select
          openerProps={{ className: "h-full" }}
          listElProps={{ className: "text-center" }}
          options={quantityOptions}
          value={quantity}
          setValue={setQuantity}
          textField={"value"}
          multiple={false}
          ref={passedRef}
        />
      </>
    );
  }
);

ProductBuyArea.displayName = "ProductBuyArea";

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

  //To do add sizes to every image

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
        sizes={`576px`}
      />
      <div className="flex w-full flex-col gap-2 text-lg md:gap-3 md:text-3xl xl:mt-2 xl:text-2xl">
        <EditableProductText
          className="text-3xl font-bold text-zinc-200 md:text-5xl xl:max-w-[80%]"
          {...editableProductTextProps}
          fieldToEdit={"title"}
          as={<h2 className="max-w-full text-ellipsis break-words" />}
        >
          {product.title}
        </EditableProductText>
        <div className="flex items-center text-2xl md:text-4xl">
          <EditableProductText
            {...editableProductTextProps}
            fieldToEdit={"price"}
            inputElement={"input"}
            labelText={"$"}
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
        <div className="mt-1 flex flex-wrap gap-2">
          <ProductBuyArea product={product} />
          {canEdit ? <ProductDeleteDialog productId={product.id} /> : null}
        </div>
        <div className="mt-8 md:mt-12">
          <Reviews product={product} />
        </div>
      </div>

      {/* To do add image fall back here */}
    </div>
  );
};

const MainPage = ({
  product,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  if (!product) {
    return <Error404Page />;
  }

  return (
    <>
      <Head>
        <title>{`${product.title} | Nextcommerce`}</title>
      </Head>
      <ProductPage product={product} />
    </>
  );
};

export default PageWithFallback(MainPage);

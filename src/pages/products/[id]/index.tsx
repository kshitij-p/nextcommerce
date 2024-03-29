import {
  type InferGetStaticPropsType,
  type GetStaticPaths,
  type GetStaticProps,
} from "next";
import { type Product } from "@prisma/client";
import PageWithFallback from "../../../components/PageWithFallback";
import Image from "../../../components/ui/Image/Image";
import ExpandableText from "../../../components/ui/ExpandableText";
import Button from "../../../components/ui/Button";
import { useSession } from "next-auth/react";
import React, { type ForwardedRef, useState } from "react";
import { api, type RouterOutputs } from "../../../utils/api";
import { FALLBACK_IMG_URL, TIME_IN_MS } from "../../../utils/client";
import toast from "../../../utils/toast";
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
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "../../../server/api/root";
import { createInnerTRPCContext } from "../../../server/api/trpc";
import superjson from "superjson";
import { prisma } from "../../../server/db";
import { useRouter } from "next/router";

type EditableProductFields = keyof Omit<
  Product,
  "userId" | "id" | "category" | "featured" | "stripePriceId"
>;

type ProductPageProps = {
  product: RouterOutputs["product"]["get"]["product"] | null;
};

export type PageProduct = Exclude<ProductPageProps["product"], null>;

export const getStaticProps: GetStaticProps<{ id: string }> = async (ctx) => {
  const id = z.string().parse(ctx.params?.id);

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null }),
    transformer: superjson,
  });

  await ssg.product.get.prefetch({ id: id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id: id,
    },
    revalidate: 31536000, //1 year in seconds,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const featuredProducts = await prisma.product.findMany({
    where: {
      featured: true,
    },
  });

  const paths = featuredProducts.map((product) => ({
    params: { id: product.id },
  }));

  return {
    paths: paths,
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
      await utils.product.getAutocomplete.invalidate();
      //getAll is only invalidated on success to save requests
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
      await utils.product.getAll.cancel();
      await utils.product.getAll.invalidate();
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
  inputContainerProps?: React.ComponentProps<"div">;
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
      await utils.product.getAll.invalidate();
      await utils.product.getAutocomplete.invalidate();
      await utils.cart.get.invalidate();

      toast("This product has been deleted", {
        type: "danger",
        duration: Infinity,
      });
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

    const router = useRouter();

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
          toast("Added to cart", {
            type: "success",
          });
        },
      });

    const { mutateAsync: updateQuantity, isLoading: isUpdatingQty } =
      useEditCartQuantity({ productId: product.id, toastOnSuccess: true });

    const { data } = api.cart.getProduct.useQuery(
      { productId: product.id },
      {
        enabled: isLoggedIn,
      }
    );

    const { mutate: buyProduct, isLoading: isProcessingBuyNow } =
      api.payments.checkoutProduct.useMutation({
        onSuccess: async (checkoutSession) => {
          if (!checkoutSession.url) return;
          await router.push(checkoutSession.url);
        },
      });

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

    const actionsDisabled = isProcessingBuyNow || isAdding || isUpdatingQty;

    return (
      <>
        <Button
          variants={{ type: "secondary" }}
          disabled={actionsDisabled}
          onClick={handleAddToCart}
        >
          Add to cart
        </Button>
        <Button
          disabled={actionsDisabled}
          onClick={() => {
            if (actionsDisabled) return;
            buyProduct({ productId: product.id, quantity: quantity.value });
          }}
        >
          Buy now
        </Button>
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

const ProductPage = ({
  id,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { data: session } = useSession();

  //This query is only for optimistically updating the ui
  const { data } = api.product.get.useQuery(
    { id: id },
    {
      staleTime: TIME_IN_MS.FIVE_MINUTES,
    }
  );

  if (!data) {
    return <Error404Page />;
  }

  const { product } = data;

  const canEdit = product.userId === session?.user?.id;

  const editableProductTextProps: Omit<
    React.ComponentProps<typeof EditableProductText>,
    "children" | "fieldToEdit"
  > = {
    canEdit: canEdit,
    product: product,
  };

  return (
    <>
      <Head>
        <title>{`${product.title} | Nextcommerce`}</title>
      </Head>
      <div className="flex w-full flex-col gap-4 p-5 text-zinc-300 md:p-8 xl:flex-row xl:gap-8">
        <Image
          priority
          className="rounded-sm object-cover"
          src={product.images?.[0]?.publicUrl ?? FALLBACK_IMG_URL}
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
            className="flex w-full"
            inputContainerProps={{ className: "xl:max-w-[80%]" }}
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
      </div>
    </>
  );
};

export default PageWithFallback(ProductPage);

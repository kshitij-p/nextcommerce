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
import StyledDialog from "../../../components/StyledDialog";
import React, { useRef, useState } from "react";
import { api, type RouterOutputs } from "../../../utils/api";
import { flushSync } from "react-dom";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { type ControlledDialogProps } from "../../../components/Dialog/ControlledDialog";
import Textarea from "../../../components/Textarea";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateProducts, TIME_IN_MS } from "../../../utils/client";
import { z } from "zod";
import { getQueryKey } from "@trpc/react-query";
import { CART_GET_QUERY_KEY } from "../../cart";

type EditableProductFields = keyof Omit<Product, "userId" | "id">;

type ProductPageProps = {
  product: RouterOutputs["product"]["get"]["product"] | null;
};

type PageProduct = Exclude<
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
  onConfirmEdit,
}: {
  value: string;
  fieldToEdit: EditableProductFields;
  open: ControlledDialogProps["open"];
  setOpen: ControlledDialogProps["setOpen"];
  product: PageProduct;
  onDiscard: () => void;
  onConfirmEdit: () => void;
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

      onConfirmEdit();

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

  const handleEdit = () => {
    mutate({ [fieldToEdit]: value, id: product.id });
  };

  return (
    <StyledDialog
      open={open}
      setOpen={setOpen}
      title={`Edit this product's ${fieldToEdit}`}
      description="Are you sure you want to do this ?"
    >
      <div className="mt-1 flex flex-wrap items-center gap-2 md:mt-2 md:gap-4">
        <Button
          variants={{ type: "secondary", size: "sm" }}
          onClick={() => setOpen(false)}
          disabled={isLoading}
        >
          Keep editing
        </Button>
        <Button
          variants={{ type: "secondary", size: "sm" }}
          onClick={onDiscard}
          disabled={isLoading}
        >
          Discard Changes
        </Button>
        <Button
          variants={{ size: "sm" }}
          onClick={handleEdit}
          disabled={isLoading}
        >
          Save changes
        </Button>
      </div>
    </StyledDialog>
  );
};

const EditableText = ({
  children,
  canEdit,
  as = <p />,
  inputElement = "textarea",
  fieldToEdit,
  product,
  onChangeComplete,
  className = "",
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
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);

  const [diagOpen, setDiagOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const handleStopEditing = () => {
    setEditing(false);
    setDiagOpen(false);
  };

  const handleBlur = () => {
    if (children.trim() === text.trim()) {
      setEditing(false);
      return;
    }
    setDiagOpen(true);
  };

  const textElProps = {
    className:
      "w-full resize-none rounded-sm bg-transparent p-2 focus:outline-blue-500 outline outline-2 outline-blue-200",
    autoFocus: true,
    value: text,
    onChange: (
      e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
      setText(e.currentTarget.value);
      if (onChangeComplete) {
        onChangeComplete(e);
      }
    },
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
  };

  return (
    <div {...rest} className={`group relative ${className}`} ref={containerRef}>
      {editing ? (
        inputElement === "textarea" ? (
          <Textarea {...textElProps} autoResize cursorToTextEndOnFocus />
        ) : (
          <input {...textElProps} />
        )
      ) : (
        <>
          {React.cloneElement(as, {
            ...as.props,
            className: `inline ${
              as.props.className && typeof as.props.className === "string"
                ? as.props.className
                : ""
            }`,
            children: children,
          })}
          {canEdit ? (
            <button
              className="visible ml-2 align-baseline opacity-50 transition-all duration-300 group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100 xl:invisible xl:opacity-0"
              onClick={() => {
                flushSync(() => setText(children));
                setEditing(true);
              }}
            >
              <Pencil1Icon className="h-full w-6 md:w-8" />
            </button>
          ) : null}
        </>
      )}
      <ProductEditDialog
        onConfirmEdit={handleStopEditing}
        onDiscard={handleStopEditing}
        open={diagOpen}
        setOpen={setDiagOpen}
        fieldToEdit={fieldToEdit}
        value={text}
        product={product}
      />
    </div>
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
      setOpen(false);
    },
  });

  const handleDeleteClick = () => {
    if (isLoading) {
      return;
    }

    mutate({ id: productId });
  };

  return (
    <StyledDialog
      open={open}
      setOpen={setOpen}
      Opener={<Button variants={{ type: "danger" }}>Delete this</Button>}
      title="Delete this product"
      description="Are you sure you want to do this ?"
    >
      <div className="mt-4 flex items-center gap-2 md:gap-4">
        <Button variants={{ type: "secondary" }} onClick={() => setOpen(false)}>
          No go back
        </Button>
        <Button
          onClick={handleDeleteClick}
          disabled={isLoading}
          variants={{ type: "danger" }}
        >
          Yes delete this
        </Button>
      </div>
    </StyledDialog>
  );
};

const AddToCart = ({ product }: { product: PageProduct }) => {
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState("1");

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

  const { data } = api.cart.getProduct.useQuery({ productId: product.id });

  return (
    <>
      <input
        value={quantity}
        onChange={(e) => {
          setQuantity(e.currentTarget.value);
        }}
      />
      <Button
        variants={{ type: "secondary" }}
        disabled={isAdding || isUpdatingQty}
        onClick={async () => {
          //To do add a quantity picker here for selecting quantity
          //To do add react hook form here for validation
          if (!data) {
            await addToCart({
              productId: product.id,
              quantity: parseInt(quantity),
            });
          } else {
            await updateQuantity({
              cartItemId: data.cartItem.id,
              quantity: data.cartItem.quantity + parseInt(quantity),
            });
          }
        }}
      >
        Add to cart
      </Button>
    </>
  );
};

const DeleteReviewDialog = ({
  review,
}: {
  review: RouterOutputs["review"]["getForProduct"]["reviews"][0];
}) => {
  const { mutate: deleteReview, isLoading } = api.review.delete.useMutation();

  //To do make a common dangerdialog component and use it here and in delete product
  return (
    <Button
      disabled={isLoading}
      onClick={() => {
        deleteReview({ id: review.id });
      }}
      variants={{ type: "danger" }}
    >
      Delete
    </Button>
  );
};

const CreateReview = ({ productId }: { productId: string }) => {
  const [body, setBody] = useState("");

  const { mutate: postReview, isLoading } = api.review.create.useMutation();

  return (
    <div>
      <b>Write a review</b>
      <textarea
        disabled={isLoading}
        value={body}
        onChange={(e) => setBody(e.currentTarget.value)}
        placeholder="Leave your thoughts about this product..."
      />
      <Button
        onClick={() => {
          postReview({ productId: productId, body: body });
        }}
      >
        Create
      </Button>
    </div>
  );
};

const Reviews = ({ product }: { product: PageProduct }) => {
  const { status } = useSession();

  const {
    data: { reviews },
  } = api.review.getForProduct.useQuery(
    { productId: product.id },
    {
      initialData: { message: "Initial data", reviews: [] },
      initialDataUpdatedAt: 0,
    }
  );

  return (
    <div>
      {status === "authenticated" ? (
        <CreateReview productId={product.id} />
      ) : null}
      {reviews.map((review) => {
        return (
          <div key={review.id}>
            <p>{`Posted by: ${review.user.name ?? "Unknown Name"}`}</p>
            {review.body}
            <DeleteReviewDialog review={review} />
          </div>
        );
      })}
    </div>
  );
};

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

  const editableTextProps: Omit<
    React.ComponentProps<typeof EditableText>,
    "children" | "fieldToEdit"
  > = {
    canEdit: canEdit,
    product: product,
  };

  return (
    <div className="flex w-full flex-col gap-4 p-5 text-zinc-300 md:p-8 xl:flex-row xl:gap-8">
      <Image
        className="rounded-sm"
        src={product.images?.[0]?.publicUrl ?? ""}
        alt={`Image of ${product.title}`}
        fill
        Container={
          <div className="w-full max-w-xl self-center xl:self-start" />
        }
      />
      <div className="flex w-full flex-col gap-2 text-lg md:gap-3 md:text-3xl xl:mt-2 xl:text-2xl">
        <EditableText
          className="text-3xl font-bold text-zinc-200 md:text-5xl xl:max-w-[80%]"
          {...editableTextProps}
          fieldToEdit={"title"}
          as={<h2 />}
        >
          {product.title}
        </EditableText>
        <div className="flex items-center text-2xl md:text-4xl">
          <p>$</p>
          <EditableText
            {...editableTextProps}
            fieldToEdit={"price"}
            inputElement={"input"}
          >
            {`${product.price}`}
          </EditableText>
        </div>
        {/* Font size for this is defined in the parent div */}
        <EditableText
          className="flex"
          {...editableTextProps}
          fieldToEdit={"description"}
          as={
            <ExpandableText
              className="mt-2 text-zinc-400 md:mt-3 xl:max-w-[80%]"
              maxLines={10}
            />
          }
        >
          {product.description}
        </EditableText>
        <div className="flex gap-2">
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

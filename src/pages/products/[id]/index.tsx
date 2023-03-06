import {
  type InferGetStaticPropsType,
  type GetStaticPaths,
  type GetStaticProps,
} from "next";
import { prisma } from "../../../server/db";

import { type Review, type Product } from "@prisma/client";
import PageWithFallback from "../../../components/PageWithFallback";
import Image from "../../../components/Image";
import ExpandableText from "../../../components/ExpandableText";
import Button from "../../../components/Button";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { api, type RouterOutputs } from "../../../utils/api";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
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
import EditableHoverButton from "../../../components/EditableText/EditableHoverButton";
import { flushSync } from "react-dom";
import ConfirmDialog from "../../../components/ConfirmDialog";
import Select from "../../../components/Select";

type EditableProductFields = keyof Omit<Product, "userId" | "id">;

type EditableReviewFields = keyof Omit<Review, "userId" | "id" | "productId">;

type ProductPageProps = {
  product: RouterOutputs["product"]["get"]["product"] | null;
};

type PageProduct = Exclude<
  InferGetStaticPropsType<typeof getStaticProps>["product"],
  null
>;

type ProductReview = RouterOutputs["review"]["getForProduct"]["reviews"][0];

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
}: {
  value: string;
  fieldToEdit: EditableProductFields;
  open: EditableTextProps["open"];
  setOpen: EditableTextProps["setOpen"];
  product: PageProduct;
  onDiscard: EditableTextProps["onDiscard"];
  onMutationComplete: () => void;
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
    />
  );
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
      editing={editing}
      setEditing={setEditing}
    >
      <ProductEditDialog
        onMutationComplete={onStopEditing}
        onDiscard={onStopEditing}
        open={diagOpen}
        setOpen={setDiagOpen}
        fieldToEdit={fieldToEdit}
        value={text}
        product={product}
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

const AddToCart = ({ product }: { product: PageProduct }) => {
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
};

const getReviewsQueryKey = (productId: PageProduct["id"]) => {
  return getQueryKey(
    api.review.getForProduct,
    { productId: productId },
    "query"
  );
};

const invalidateReviewsQuery = async ({
  queryClient,
  productId,
}: {
  queryClient: QueryClient;
  productId: PageProduct["id"];
}) => {
  await queryClient.invalidateQueries(getReviewsQueryKey(productId));
};

const useEditReview = ({
  fieldToEdit,
  value,
  review,
  onMutationComplete,
}: {
  fieldToEdit: EditableReviewFields;
  value: string;
  review: ProductReview;
  onMutationComplete: () => void;
}) => {
  const queryClient = useQueryClient();

  return api.review.update.useMutation({
    onMutate: async () => {
      const queryKey = getReviewsQueryKey(review.productId);

      await queryClient.cancelQueries(queryKey);

      const previousReviews =
        queryClient.getQueryData<RouterOutputs["review"]["getForProduct"]>(
          queryKey
        );

      queryClient.setQueryData<RouterOutputs["review"]["getForProduct"]>(
        queryKey,
        (data) => {
          if (!data) {
            return data;
          }

          return {
            ...data,
            reviews: data.reviews.map((currReview) => {
              if (currReview.id !== review.id) {
                return currReview;
              }

              return { ...review, [fieldToEdit]: value };
            }),
          };
        }
      );

      onMutationComplete();

      return { previousReviews: previousReviews };
    },
    onError: (err, _, ctx) => {
      if (!ctx) {
        return;
      }

      queryClient.setQueryData<RouterOutputs["review"]["getForProduct"]>(
        getReviewsQueryKey(review.productId),
        ctx.previousReviews
      );
    },
    onSettled: async () => {
      await invalidateReviewsQuery({
        queryClient: queryClient,
        productId: review.productId,
      });
    },
  });
};

const ReviewEditDialog = ({
  open,
  setOpen,
  onDiscard,
  review,
  fieldToEdit,
  value,
  onMutationComplete,
}: {
  open: EditableTextProps["open"];
  setOpen: EditableTextProps["setOpen"];
  onDiscard: EditableTextProps["onDiscard"];
  review: ProductReview;
  fieldToEdit: EditableReviewFields;
  value: string;
  onMutationComplete: () => void;
}) => {
  const { mutate: updateReview, isLoading } = useEditReview({
    fieldToEdit,
    review,
    value,
    onMutationComplete,
  });

  const handleSaveEditChanges = () => {
    updateReview({ id: review.id, [fieldToEdit]: value });
  };

  return (
    <EditableTextDialog
      title={`Edit this review's ${fieldToEdit as string}`}
      open={open}
      setOpen={setOpen}
      isLoading={isLoading}
      onDiscard={onDiscard}
      onSaveChanges={handleSaveEditChanges}
    />
  );
};

const EditableReviewText = ({
  children,
  canEdit,
  fieldToEdit,
  review,
  ...rest
}: Omit<React.ComponentProps<"p">, "children"> & {
  children: string;
  canEdit: boolean;
  as?: React.ReactElement<Record<string, unknown>>;
  inputElement?: "textarea" | "input";
  fieldToEdit: EditableReviewFields;
  review: ProductReview;
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
      editing={editing}
      setEditing={setEditing}
    >
      <ReviewEditDialog
        onMutationComplete={onStopEditing}
        onDiscard={onStopEditing}
        open={diagOpen}
        setOpen={setDiagOpen}
        fieldToEdit={fieldToEdit}
        value={text}
        review={review}
      />
    </EditableText>
  );
};

const ReviewDeleteDialog = ({ review }: { review: ProductReview }) => {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const { mutate: deleteReview, isLoading } = api.review.delete.useMutation({
    onSuccess: async () => {
      await invalidateReviewsQuery({
        queryClient,
        productId: review.productId,
      });
      //To do throw a toast here
      console.log("deleted review");
    },
    onSettled: () => {
      setOpen(false);
    },
  });

  const handleConfirmDelete = () => {
    deleteReview({ id: review.id });
  };

  return (
    <DangerDialog
      open={open}
      setOpen={setOpen}
      title={"Delete this review"}
      openerChildren={"Delete"}
      confirmButtonChildren={"Yes delete this"}
      onConfirmDelete={handleConfirmDelete}
      isLoading={isLoading}
    />
  );
};

const CreateReview = ({ productId }: { productId: string }) => {
  const queryClient = useQueryClient();

  const [body, setBody] = useState("");
  const [rating, setRating] = useState("1");

  const { mutate: postReview, isLoading } = api.review.create.useMutation({
    onSuccess: async () => {
      await invalidateReviewsQuery({
        queryClient: queryClient,
        productId: productId,
      });
    },
  });

  //To do use rhf here for validation

  return (
    <div>
      <b>Write a review</b>
      <textarea
        disabled={isLoading}
        value={body}
        onChange={(e) => setBody(e.currentTarget.value)}
        placeholder="Leave your thoughts about this product..."
      />
      Rating
      <input
        value={rating}
        onChange={(e) => setRating(e.currentTarget.value)}
      />
      <Button
        onClick={() => {
          postReview({ productId: productId, body: body, rating: rating });
        }}
      >
        Create
      </Button>
    </div>
  );
};

const ReviewRating = ({
  review,
  canEdit,
}: {
  review: ProductReview;
  canEdit: boolean;
}) => {
  const {
    text,
    setText,
    diagOpen,
    setDiagOpen,
    editing,
    setEditing,
    onStopEditing,
  } = useEditableText();

  const { mutate: updateReview, isLoading } = useEditReview({
    fieldToEdit: "rating",
    value: text,
    onMutationComplete: onStopEditing,
    review: review,
  });

  const rating = `${review.rating}`;

  const handleBlur = () => {
    if (rating.trim() === text.trim()) {
      setEditing(false);
      return;
    }
    setDiagOpen(true);
  };

  const handleConfirm = () => {
    updateReview({ id: review.id, rating: text });
  };

  //To do replace rating with a star rating component

  return (
    <div className="group relative">
      {editing ? (
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          onBlur={handleBlur}
        />
      ) : (
        <>
          <b>{`Rated ${review.rating}`}</b>
          {canEdit ? (
            <EditableHoverButton
              onClick={() => {
                flushSync(() => {
                  setText(rating);
                });
                setEditing(true);
              }}
            />
          ) : null}
        </>
      )}

      <ConfirmDialog
        open={diagOpen}
        setOpen={setDiagOpen}
        title={`Edit this review's rating`}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        handleDiscard={onStopEditing}
      />
    </div>
  );
};

const Review = ({ review }: { review: ProductReview }) => {
  const { data: session } = useSession();

  const canEdit = review.userId === session?.user?.id;

  return (
    <div key={review.id}>
      <p>{`Posted by: ${review.user.name ?? "Unknown Name"}`}</p>
      <ReviewRating review={review} canEdit={canEdit} />
      <EditableReviewText
        className="flex"
        canEdit={canEdit}
        review={review}
        fieldToEdit={"body"}
        as={
          <ExpandableText
            className="mt-2 text-zinc-400 md:mt-3 xl:max-w-[80%]"
            maxLines={10}
          />
        }
      >
        {review.body}
      </EditableReviewText>
      {canEdit ? <ReviewDeleteDialog review={review} /> : null}
    </div>
  );
};

const Reviews = ({ product }: { product: PageProduct }) => {
  const { status } = useSession();

  const {
    data: { reviews, userReview },
  } = api.review.getForProduct.useQuery(
    { productId: product.id },
    {
      staleTime: TIME_IN_MS.FIVE_MINUTES,
      initialData: { message: "Initial data", reviews: [] },
      initialDataUpdatedAt: 0,
    }
  );

  return (
    <div>
      {status === "authenticated" ? (
        userReview ? (
          <Review review={userReview} />
        ) : (
          <CreateReview productId={product.id} />
        )
      ) : null}

      {reviews.map((review) => {
        return <Review key={review.id} review={review} />;
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

import {
  type InferGetStaticPropsType,
  type GetStaticPaths,
  type GetStaticProps,
} from "next";
import { prisma } from "../../../server/db";

import { type Image as ProductImage, type Product } from "@prisma/client";
import PageWithFallback from "../../../components/PageWithFallback";
import Image from "../../../components/Image";
import ExpandableText from "../../../components/ExpandableText";
import Button from "../../../components/Button";
import { useSession } from "next-auth/react";
import StyledDialog from "../../../components/StyledDialog";
import React, { useRef, useState } from "react";
import { api } from "../../../utils/api";
import { flushSync } from "react-dom";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { type ControlledDialogProps } from "../../../components/Dialog/ControlledDialog";
import Textarea from "../../../components/Textarea";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateProducts } from "../../../utils/client";
import { z } from "zod";

type EditableProductFields = keyof Omit<Product, "userId" | "id">;

export const getStaticProps: GetStaticProps<{
  product:
    | (Product & {
        images?: ProductImage[];
      })
    | null;
}> = async (ctx) => {
  const id = z.string().parse(ctx.params?.id);

  const product = await prisma.product.findUnique({
    where: {
      id: id,
    },
    include: {
      images: {},
    },
  });

  return {
    props: {
      product: product,
    },
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
  productId,
  onSettled,
  onDiscard,
}: {
  value: string;
  fieldToEdit: EditableProductFields;
  open: ControlledDialogProps["open"];
  setOpen: ControlledDialogProps["setOpen"];
  productId: string;
  onSettled: () => void;
  onDiscard: () => void;
}) => {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = api.product.update.useMutation({
    onSettled: () => {
      onSettled();
    },
    onSuccess: async () => {
      //To do throw a toast here
      await invalidateProducts(queryClient);
      console.log("Successfully edited");
    },
  });

  const handleEdit = () => {
    mutate({ [fieldToEdit]: value, id: productId });
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
          onClick={() => {
            onDiscard();
          }}
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
  productId,
  onChangeComplete,
  className = "",
  ...rest
}: Omit<React.ComponentProps<"p">, "children"> & {
  children: string;
  canEdit: boolean;
  as?: React.ReactElement<Record<string, unknown>>;
  inputElement?: "textarea" | "input";
  fieldToEdit: EditableProductFields;
  productId: string;
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
        onSettled={handleStopEditing}
        onDiscard={handleStopEditing}
        open={diagOpen}
        setOpen={setDiagOpen}
        fieldToEdit={fieldToEdit}
        value={text}
        productId={productId}
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

const ProductPage = ({
  product,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { data } = useSession();

  if (!product) {
    //To do show error page here
    return <div>Failed to get product</div>;
  }

  const canEdit = product.userId === data?.user?.id;

  const editableTextProps = {
    canEdit: canEdit,
    productId: product.id,
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
          <Button variants={{ type: "secondary" }}>Add to cart</Button>
          <Button>Buy now</Button>
          {canEdit ? <ProductDeleteDialog productId={product.id} /> : null}
        </div>
      </div>

      {/* To do add image fall back here */}
    </div>
  );
};

export default PageWithFallback(ProductPage);

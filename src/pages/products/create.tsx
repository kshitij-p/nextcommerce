import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React, { type ForwardedRef, useState } from "react";
import { z } from "zod";
import ProtectedPage from "../../components/ProtectedPage";
import { api } from "../../utils/api";
import { invalidateProducts } from "../../utils/client";
import useForm from "../../hooks/useForm";

const CreateProductFormSchema = z.object({
  title: z.string().min(1, "Must have atleast 1 character"),
  description: z.string().min(1, "Must have atleast 1 character"),
  price: z
    .number({ invalid_type_error: "Must be a positive number" })
    .positive("Must be a positive number"),
  files:
    typeof window === "undefined"
      ? z.undefined()
      : z.preprocess(
          (val: unknown) => [...(val as FileList)],
          z
            .array(z.instanceof(File))
            .min(1, { message: "Atleast 1 image is required" })
        ),
});

type CreateProductForm = z.infer<typeof CreateProductFormSchema>;

const Input = React.forwardRef(
  (
    {
      errorMessage,
      ...rest
    }: React.ComponentProps<"input"> & {
      errorMessage?: string;
    },
    passedRef: ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <>
        <input {...rest} ref={passedRef} />
        {errorMessage ? <b className="text-red-500">{errorMessage}</b> : null}
      </>
    );
  }
);

Input.displayName = "Input";

const CreateProductPage = () => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ schema: CreateProductFormSchema });

  const [productLink, setProductLink] = useState("");

  const [progress, setProgress] = useState(0);

  const { mutate: createProduct } = api.product.create.useMutation({
    onSuccess: async (data) => {
      await invalidateProducts(queryClient);
      setProductLink(data.product.id);
      setProgress(100);
    },
    onError: () => {
      setProgress(0);
    },
  });

  const { mutateAsync: getPresignedUrl } =
    api.image.getPresignedUrl.useMutation({
      onSuccess: () => {
        setProgress(25);
      },
    });

  const handleCreate = async ({
    title,
    description,
    price,
    files,
  }: CreateProductForm) => {
    const file = files?.[0];

    if (!file) {
      setError("files", { message: "Atleast 1 image is required" });
      return;
    }

    if (!file.type.startsWith("image")) {
      setError("files", { message: "Only images are allowed" });
      return;
    }

    const { presignedUrl, key } = await getPresignedUrl();

    try {
      await fetch(presignedUrl, {
        method: "PUT",
        body: file,
      });
    } catch (e) {
      return;
    }

    setProgress(50);

    createProduct({
      title: title,
      description: description,
      imageKey: key,
      price: price,
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(handleCreate)}>
        Title
        <Input {...register("title")} errorMessage={errors.title?.message} />
        <br />
        Description
        <Input
          {...register("description")}
          errorMessage={errors.description?.message}
        />
        <br />
        Price
        <Input
          {...register("price", { valueAsNumber: true })}
          errorMessage={errors.price?.message}
        />
        <br />
        <Input
          type="file"
          accept="image/*"
          {...register("files")}
          errorMessage={errors.files?.message}
        />
        {/* Progressbar */}
        <div
          className={`h-1 w-full rounded-sm bg-teal-400 transition-all duration-300`}
          style={{
            width: `${progress}%`,
          }}
        />
        <button type="submit">Create</button>
        {productLink ? (
          <Link href={`/products/${productLink}`}>
            Success! Click to visit your product
          </Link>
        ) : null}
      </form>
    </div>
  );
};

export default ProtectedPage(CreateProductPage);

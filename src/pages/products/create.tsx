import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React, { useState } from "react";
import { z } from "zod";
import ProtectedPage from "../../components/ProtectedPage";
import { api } from "../../utils/api";
import { invalidateProducts } from "../../utils/client";
import useForm from "../../hooks/useForm";
import LabelledInput from "../../components/LabelledInput";
import Form from "../../components/Form";
import FileInput from "../../components/FileInput";
import Button from "../../components/Button";

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

const CreateProductPage = () => {
  const queryClient = useQueryClient();

  const form = useForm({ schema: CreateProductFormSchema });

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
      form.setError("files", { message: "Atleast 1 image is required" });
      return;
    }

    if (!file.type.startsWith("image")) {
      form.setError("files", { message: "Only images are allowed" });
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
      <Form form={form} onSubmit={handleCreate}>
        <LabelledInput {...form.register("title")} />
        <LabelledInput {...form.register("description")} />
        <LabelledInput {...form.register("price", { valueAsNumber: true })} />
        <FileInput accept="image/*" {...form.register("files")} />
        {/* Progressbar */}
        <div
          className={`h-1 w-full rounded-sm bg-teal-400 transition-all duration-300`}
          style={{
            width: `${progress}%`,
          }}
        />
        <Button type="submit">Create</Button>
        {productLink ? (
          <Link href={`/products/${productLink}`}>
            Success! Click to visit your product
          </Link>
        ) : null}
      </Form>
    </div>
  );
};

export default ProtectedPage(CreateProductPage);

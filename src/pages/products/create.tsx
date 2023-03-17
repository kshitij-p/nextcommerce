import Link from "next/link";
import React, { useState } from "react";
import { z } from "zod";
import ProtectedPage from "../../components/ProtectedPage";
import { api } from "../../utils/api";
import useForm from "../../hooks/useForm";
import LabelledInput from "../../components/ui/LabelledInput";
import Form from "../../components/ui/Form";
import FileInput from "../../components/ui/FileInput";
import Button from "../../components/ui/Button";
import useTRPCUtils from "../../hooks/useTRPCUtils";
import {
  ProductCategoriesSelect,
  DEFAULT_CATEGORY_OPTION_VALUE,
} from "../../components/ProductCategoriesSelect";
import Head from "next/head";
import Image from "next/image";

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
  const utils = useTRPCUtils();

  const form = useForm({ schema: CreateProductFormSchema });

  const [productLink, setProductLink] = useState("");

  const [progress, setProgress] = useState(0);
  const [category, setCategory] = useState(DEFAULT_CATEGORY_OPTION_VALUE);

  const { mutate: createProduct } = api.product.create.useMutation({
    onSuccess: async (data) => {
      await utils.product.getAll.invalidate();
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
    setProgress(0);
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
      category: category.key,
    });
  };

  const inputProps: {
    variants: React.ComponentProps<typeof LabelledInput>["variants"];
    className: string;
  } = {
    className: "w-full",
    variants: { padding: "lg" },
  };

  return (
    <>
      <Head>
        <title>Create a product | Nextcommerce</title>
      </Head>
      <div className="flex flex-col xl:flex-row">
        {/* To do add a diff image here and fix the alt */}
        <div className="relative aspect-video w-full shrink-0 xl:order-last xl:w-[30%]">
          <Image
            className="object-cover"
            src={"/images/create-product-banner.jpeg"}
            alt={"Image of a cat"}
            fill
          />
        </div>
        <div className="flex w-full">
          <Form form={form} onSubmit={handleCreate} className={"p-4 md:p-8"}>
            <div className="flex flex-col gap-4 text-2xl md:text-4xl">
              <LabelledInput {...inputProps} {...form.register("title")} />

              <LabelledInput
                {...inputProps}
                inputEl="textarea"
                autoResize
                style={{ resize: "none" }}
                {...form.register("description")}
              />
              <LabelledInput
                {...inputProps}
                {...form.register("price", { valueAsNumber: true })}
              />
              <label className="flex items-center gap-2 md:gap-4">
                Category
                <ProductCategoriesSelect
                  openerProps={{ variants: { type: "secondary" } }}
                  listElProps={{ className: "text-base md:text-lg" }}
                  value={category}
                  setValue={setCategory}
                  multiple={false}
                />
              </label>
              <FileInput accept="image/*" {...form.register("files")} />
              {/* Progressbar */}
              <div
                className={`${
                  progress > 0 ? "relative h-1" : "absolute h-0"
                } w-full rounded-sm bg-teal-400 transition-all duration-300`}
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
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default ProtectedPage(CreateProductPage);

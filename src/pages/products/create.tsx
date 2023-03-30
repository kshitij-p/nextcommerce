import Link from "next/link";
import React, { useEffect, useState } from "react";
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
import { breakpoints } from "../../utils/client";
import bannerImg from "../../../public/images/create-product-banner.webp";

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
  const [isUploadingToR2, setIsUploadingToR2] = useState(false);

  const [progress, setProgress] = useState(0);
  const [category, setCategory] = useState(DEFAULT_CATEGORY_OPTION_VALUE);

  const { mutate: createProduct, isLoading: isLoadingCreateProduct } =
    api.product.create.useMutation({
      onSuccess: async (data) => {
        await utils.product.getAll.invalidate();
        await utils.product.getAutocomplete.invalidate();
        setProductLink(data.product.id);
        setProgress(100);
      },
      onError: () => {
        setProgress(0);
      },
    });

  const { mutateAsync: getPresignedUrl, isLoading: isLoadingPresignedUrl } =
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

    setIsUploadingToR2(true);

    try {
      await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: new Headers({
          "Cache-Control": "public, max-age=31536000",
        }),
      });
    } catch (e) {
      return;
    }

    setIsUploadingToR2(false);

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
    className: "w-full mobile-scrollbar",
    variants: { padding: "lg" },
  };

  const productIsBeingCreated =
    isLoadingPresignedUrl || isUploadingToR2 || isLoadingCreateProduct;

  //to do throw a warning preventing the user from going to another page while the upload is happenin
  useEffect(() => {
    if (!productIsBeingCreated) {
      return;
    }

    const closureMessage =
      "Your product is still being created. Please wait a few seconds for it to finish before you leave.";
    const preventTabClose = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = closureMessage;
      return closureMessage;
    };

    window.addEventListener("beforeunload", preventTabClose);

    return function cleanup() {
      window.removeEventListener("beforeunload", preventTabClose);
    };
  }, [productIsBeingCreated]);

  return (
    <>
      <Head>
        <title>Create a product | Nextcommerce</title>
      </Head>
      <div className="flex flex-col xl:flex-row xl:p-8">
        <div className="w-full shrink-0 xl:order-last xl:w-[50%] ">
          <div className="relative aspect-video w-full shrink-0 xl:aspect-square xl:w-3/4">
            <Image
              priority
              className="object-cover object-center xl:rounded-3xl"
              src={bannerImg}
              alt={"Image of a girl writing"}
              fill
              sizes={`(max-width: ${breakpoints.xl}): 100vw, 720px`}
              placeholder="blur"
            />
          </div>
        </div>
        <div className="flex w-full xl:w-1/2">
          <Form
            form={form}
            disabled={productIsBeingCreated}
            onSubmit={handleCreate}
            className={"p-4 md:p-8 xl:p-0"}
          >
            <div className="flex flex-col gap-4 text-2xl text-neutral-300 md:gap-6 md:text-4xl">
              <div className="mb-2 md:mb-8">
                <h2 className="text-4xl font-extrabold text-neutral-50 md:text-7xl">
                  Create a product
                </h2>
              </div>
              <LabelledInput {...inputProps} {...form.register("title")} />

              <LabelledInput
                {...inputProps}
                className={`${inputProps.className} h-40 md:h-60`}
                inputEl="textarea"
                style={{ resize: "none" }}
                {...form.register("description")}
              />
              <LabelledInput
                {...inputProps}
                {...form.register("price", { valueAsNumber: true })}
              />
              <div className="flex items-center gap-2 md:gap-4">
                Category
                <ProductCategoriesSelect
                  openerProps={{ variants: { type: "secondary" } }}
                  listElProps={{ className: "text-base md:text-lg" }}
                  value={category}
                  setValue={setCategory}
                  multiple={false}
                />
              </div>
              <FileInput accept="image/*" {...form.register("files")} />
              {/* Progressbar */}
              <div
                className={`${
                  progress > 0 ? "relative h-1" : "absolute h-0"
                } w-full rounded-sm bg-teal-600 transition-all duration-300`}
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

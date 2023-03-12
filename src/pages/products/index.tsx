import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import Image from "../../components/Image";
import TruncatedText from "../../components/TruncatedText";
import { extractQueryParam, TIME_IN_MS } from "../../utils/client";
import { api } from "../../utils/api";
import ButtonLink from "../../components/ButtonLink";
import Loader from "../../components/Loader";
import {
  DEFAULT_ALL_CATEGORY_OPTION_VALUE,
  AllProductCategoriesSelect,
} from "../../components/ProductCategoriesSelect";
import { type ProductCategories } from "@prisma/client";
import { useRouter } from "next/router";
import useTimeout from "../../hooks/useTimeout";

const AllProductsPage = () => {
  const { status } = useSession();

  const router = useRouter();

  const searchQuery = extractQueryParam(router.query.title);

  const [category, setCategory] = useState(DEFAULT_ALL_CATEGORY_OPTION_VALUE);

  const { runAfterClearing } = useTimeout();

  const setQueryParam = (params: { title?: string }) => {
    runAfterClearing(async () => {
      const searchParams = new URLSearchParams(params);
      await router.replace(`/products?${searchParams.toString()}`, undefined, {
        shallow: true,
      });
    }, 250);
  };

  const {
    data: { products: products },
    isLoading,
  } = api.product.getAll.useQuery(
    {
      category:
        category.key === "All"
          ? undefined
          : (category.key as ProductCategories),
      titleQuery: searchQuery,
    },
    {
      initialData: { message: "Initial data received", products: [] },
      initialDataUpdatedAt: 0,
      staleTime: TIME_IN_MS.FIVE_MINUTES,
    }
  );

  //to do throw a timeout before searching

  return (
    <div className="flex flex-col items-center gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <div className="ml-1 flex items-center gap-2 md:ml-2 xl:ml-3">
          <h2 className="text-3xl font-semibold md:text-5xl">Products</h2>
          {status === "authenticated" ? (
            <ButtonLink
              className="text-xl"
              href={`/products/create`}
              variants={{ type: "secondary" }}
            >
              Create
            </ButtonLink>
          ) : null}
        </div>
        <input
          className="rounded p-1 md:p-2"
          defaultValue={searchQuery}
          onChange={(e) => {
            setQueryParam({ title: e.currentTarget.value });
          }}
        />
        <AllProductCategoriesSelect value={category} setValue={setCategory} />
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-4 md:gap-8 xl:flex-row xl:flex-wrap">
        {isLoading ? (
          <Loader
            className="mt-12"
            variant="default"
            height="5rem"
            width="5rem"
          />
        ) : (
          products.map((product) => {
            return (
              <Link
                className="flex w-full items-start gap-2 rounded-sm p-4 text-base text-zinc-200 hover:bg-zinc-800 md:gap-4 md:text-2xl xl:max-w-[30%]"
                prefetch={false}
                key={product.id}
                href={`/products/${product.id}`}
              >
                <Image
                  fill
                  Container={
                    <div className="w-36 shrink-0 self-center md:w-56" />
                  }
                  className="rounded-sm object-cover"
                  src={product.images[0]?.publicUrl ?? ""}
                  aspectRatio={"1 / 1"}
                  alt={`${product.title}'s image`}
                />
                <div className="flex min-w-0 flex-col">
                  <TruncatedText
                    className="text-xl font-bold md:text-3xl"
                    title={product.title}
                    maxLines={2}
                  >
                    {product.title}
                  </TruncatedText>
                  <p className="text-zinc-300 md:text-3xl">{`$${product.price}`}</p>

                  <TruncatedText className="mt-1 text-zinc-400" maxLines={3}>
                    {product.description}
                  </TruncatedText>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AllProductsPage;

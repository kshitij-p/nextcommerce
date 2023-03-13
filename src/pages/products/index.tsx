import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "../../components/ui/Image";
import TruncatedText from "../../components/ui/TruncatedText";
import { extractQueryParam, TIME_IN_MS } from "../../utils/client";
import { api, type RouterOutputs } from "../../utils/api";
import ButtonLink from "../../components/ui/ButtonLink";
import Loader from "../../components/ui/Loader";
import {
  AllProductCategoriesSelect,
  DEFAULT_ALL_CATEGORY_OPTION_VALUE,
} from "../../components/ProductCategoriesSelect";
import { type ProductCategories } from "@prisma/client";
import { useRouter } from "next/router";
import useTimeout from "../../hooks/useTimeout";
import useInfiniteLoading from "../../hooks/useInfiniteLoading";

const FilterBy = ({
  category,
  setCategory,
  searchQuery,
  onSearchQueryChange,
  price,
  onPriceChange,
}: {
  searchQuery: string | undefined;
  onSearchQueryChange: React.ChangeEventHandler<HTMLInputElement>;
  category: React.ComponentProps<typeof AllProductCategoriesSelect>["value"];
  setCategory: React.ComponentProps<
    typeof AllProductCategoriesSelect
  >["setValue"];
  price: string | undefined;
  onPriceChange: React.ChangeEventHandler<HTMLInputElement>;
}) => {
  return (
    <>
      <input
        className="rounded p-1 text-lg"
        defaultValue={searchQuery}
        onChange={onSearchQueryChange}
      />
      <div className="flex flex-col items-baseline gap-2 text-lg">
        <div className="flex w-full items-center gap-2">
          <p>Category: </p>
          <AllProductCategoriesSelect
            listElProps={{ className: "text-sm" }}
            value={category}
            setValue={setCategory}
            openerProps={{ variants: { size: "sm", type: "secondary" } }}
          />
        </div>
        <div className="flex w-full items-center gap-2">
          <p>Under: </p>
          <div>
            $
            <input
              className="max-w-[6ch] bg-neutral-800"
              defaultValue={price}
              onChange={onPriceChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const AllProductsPage = () => {
  const { status } = useSession();

  const router = useRouter();

  const searchQuery = extractQueryParam(router.query.title);

  const category = {
    key:
      extractQueryParam(router.query.categoryKey) ??
      DEFAULT_ALL_CATEGORY_OPTION_VALUE.key,
    value:
      extractQueryParam(router.query.categoryValue) ??
      DEFAULT_ALL_CATEGORY_OPTION_VALUE.value,
  };

  const priceQuery = extractQueryParam(router.query.price);

  const { runAfterClearing } = useTimeout();

  const setQueryParam = (
    params: {
      title?: string;
      categoryKey?: string;
      categoryValue?: string;
      price?: string;
    },
    delay = 250
  ) => {
    runAfterClearing(async () => {
      const searchParams = new URLSearchParams({ ...router.query, ...params });
      await router.replace(`/products?${searchParams.toString()}`, undefined, {
        shallow: true,
      });
    }, delay);
  };

  const { data, isLoading, fetchNextPage, hasNextPage } =
    api.product.getAll.useInfiniteQuery(
      {
        category:
          category.key === "All"
            ? undefined
            : (category.key as ProductCategories),
        titleQuery: searchQuery,
        priceLte: priceQuery?.length ? priceQuery : undefined,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialData: {
          pages: [
            {
              message: "Initial data received",
              products: [],
              nextCursor: undefined,
            },
          ] as Array<RouterOutputs["product"]["getAll"]>,
          pageParams: [undefined],
        },
        initialDataUpdatedAt: 0,
        staleTime: TIME_IN_MS.FIVE_MINUTES,
      }
    );

  const products =
    data?.pages.reduce((prevProducts, currPage) => {
      return [...prevProducts, ...currPage.products];
    }, [] as RouterOutputs["product"]["getAll"]["products"]) ?? [];

  const productInfiniteLoadingTarget = useInfiniteLoading({
    fetchNextPage,
    hasNextPage,
  });

  return (
    <div className="flex flex-col items-center gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex w-full flex-col items-center gap-2">
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
        <FilterBy
          searchQuery={searchQuery}
          onSearchQueryChange={(e) =>
            setQueryParam({ title: e.currentTarget.value })
          }
          category={category}
          setCategory={(category) => {
            setQueryParam(
              {
                categoryKey: category.key,
                categoryValue: category.value,
              },
              10
            );
          }}
          price={priceQuery}
          onPriceChange={(e) => setQueryParam({ price: e.currentTarget.value })}
        />
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
          products.map((product, idx) => {
            return (
              <Link
                className="flex w-full items-start gap-2 rounded-sm p-4 text-base text-zinc-200 hover:bg-zinc-800 md:gap-4 md:text-2xl xl:max-w-[30%]"
                prefetch={false}
                key={product.id}
                href={`/products/${product.id}`}
                ref={
                  idx === products.length - 1
                    ? productInfiniteLoadingTarget
                    : undefined
                }
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

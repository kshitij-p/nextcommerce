import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "../../components/ui/Image/Image";
import TruncatedText from "../../components/ui/TruncatedText";
import {
  breakpoints,
  extractQueryParam,
  FALLBACK_IMG_URL,
  TIME_IN_MS,
} from "../../utils/client";
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
import Head from "next/head";
import { AnimatePresence, motion } from "framer-motion";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import Divider from "../../components/ui/Divider";
import Autocomplete from "../../components/ui/Autocomplete";
import { useState } from "react";
import {
  defaultAnimationTransition,
  getAnimationVariant,
} from "../../utils/animationHelpers";

const FilterBy = ({
  searchQuery,
  category,
  price,
}: {
  searchQuery: string | undefined;
  category: React.ComponentProps<typeof AllProductCategoriesSelect>["value"];
  price: string | undefined;
}) => {
  const router = useRouter();

  const { runAfterClearing: setQueryParamTimeout } = useTimeout();

  const [autocompleteTimeoutQueued, setAutocompleteTimeoutQueued] =
    useState(false);
  const {
    runAfterClearing: setAutocompleteTimeout,
    timeoutRef: autocompleteTimeoutRef,
  } = useTimeout();

  const setQueryParam = (
    params: {
      title?: string;
      categoryKey?: string;
      categoryValue?: string;
      price?: string;
    },
    delay = 250
  ) => {
    setQueryParamTimeout(async () => {
      const searchParams = new URLSearchParams({ ...router.query, ...params });
      await router.push(`/products?${searchParams.toString()}`, undefined, {
        shallow: true,
      });
    }, delay);
  };

  const placeholderValue = {
    id: "",
    category: "Other",
    description: "",
    price: 1,
    title: "",
    userId: "",
    featured: false,
  } as (typeof autocompleteData)[0];

  const [autocompleteValue, setAutocompleteValue] =
    useState<(typeof autocompleteData)[0]>(placeholderValue);
  const [autocompleteQuery, setAutocompleteQuery] = useState(searchQuery ?? "");

  const {
    data: { products: autocompleteData },
    refetch: fetchAutocompleteData,
    isFetching,
  } = api.product.getAutocomplete.useQuery(
    { title: autocompleteQuery },
    {
      initialData: {
        message: "Initial data",
        products: [],
      },
      initialDataUpdatedAt: 0,
      enabled: false,
      refetchOnWindowFocus: false,
      staleTime: TIME_IN_MS.ONE_MINUTE,
    }
  );

  const searchingStateNoOptionsText = `Searching for ${autocompleteQuery}`;

  return (
    <>
      <Autocomplete
        placeholderValue={placeholderValue}
        noOptionsText={
          !autocompleteTimeoutQueued
            ? autocompleteQuery === ""
              ? "Start typing to see suggestions"
              : isFetching
              ? searchingStateNoOptionsText
              : "No results found"
            : searchingStateNoOptionsText
        }
        Opener={
          <div
            className="flex items-center gap-1 rounded-lg
            border-2 border-teal-900 py-1 px-2
            text-lg transition focus-within:border-teal-700
            focus-within:shadow-[0px_0px_6px_#0f766e]
            hover:border-teal-800 focus-within:hover:border-teal-700 md:gap-2 md:py-1 md:px-2"
          >
            <MagnifyingGlassIcon
              className="aspect-square h-auto text-teal-800"
              width={20}
            />
            <Divider className="bg-teal-800" size="1.25rem" vertical />
          </div>
        }
        inputElProps={{
          className: "bg-transparent text-neutral-300 focus:outline-0 text-lg",
        }}
        listElProps={{
          className: "w-full h-52",
        }}
        listItemProps={{
          textAsTitle: true,
        }}
        textField={"title"}
        options={
          autocompleteQuery ? autocompleteData : ([] as typeof autocompleteData)
        }
        value={autocompleteValue}
        onChange={(value) => {
          setAutocompleteValue(value);
          if (value.title === "") {
            if (searchQuery?.length) {
              setQueryParam({ title: value.title }, 0);
            }
          } else {
            setQueryParam({ title: value.title }, 0);
          }
        }}
        query={autocompleteQuery}
        onQueryChange={(title, triggeredByOptionSelect) => {
          setAutocompleteQuery(title);

          if (!title) {
            clearTimeout(autocompleteTimeoutRef.current);
            setAutocompleteTimeoutQueued(false);

            return;
          }

          if (!triggeredByOptionSelect) {
            setAutocompleteTimeoutQueued(true);
            setAutocompleteTimeout(() => {
              void fetchAutocompleteData();
              setAutocompleteTimeoutQueued(false);
            }, 500);
          }
        }}
      />
      <div className="flex flex-col items-baseline gap-2 text-lg">
        <div className="flex w-full items-center gap-2">
          <p>Category: </p>
          <AllProductCategoriesSelect
            listElProps={{ className: "text-sm" }}
            value={category}
            setValue={(category) => {
              setQueryParam(
                {
                  categoryKey: category.key,
                  categoryValue: category.value,
                },
                10
              );
            }}
            openerProps={{ variants: { size: "sm", type: "secondary" } }}
          />
        </div>
        <label className="flex w-full items-center gap-2">
          <p>Under: </p>
          <div>
            $
            <input
              className="max-w-[6ch] rounded-sm border-b border-b-neutral-700 bg-neutral-800 bg-transparent focus:border-b-neutral-300 focus:outline-0"
              defaultValue={price}
              onChange={(e) => setQueryParam({ price: e.currentTarget.value })}
            />
          </div>
        </label>
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

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
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
        refetchOnWindowFocus: false,
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
    <>
      <Head>
        <title>Products | Nextcommerce</title>
      </Head>
      <div className="flex flex-col items-center gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex w-full flex-col items-center gap-2">
          <div className="flex items-center gap-2">
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
            category={category}
            price={priceQuery}
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
                    priority={idx <= 2}
                    fill
                    Container={
                      <div className="w-36 shrink-0 self-center md:w-56" />
                    }
                    className="rounded-sm object-cover"
                    src={product.images[0]?.publicUrl ?? FALLBACK_IMG_URL}
                    aspectRatio={"1 / 1"}
                    alt={`${product.title}'s image`}
                    sizes={`(max-width: ${breakpoints.sm}): 144px, 224px`}
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
        <AnimatePresence>
          <motion.div
            variants={getAnimationVariant({
              type: "fade",
            })}
            initial={"hidden"}
            animate={"visible"}
            exit={"hidden"}
            transition={defaultAnimationTransition}
          >
            {isFetchingNextPage ? (
              <Loader className="aspect-square h-auto w-8" />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default AllProductsPage;

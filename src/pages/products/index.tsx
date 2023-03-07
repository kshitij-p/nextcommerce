import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import Image from "../../components/Image";
import TruncatedText from "../../components/TruncatedText";
import { TIME_IN_MS } from "../../utils/client";
import { api } from "../../utils/api";
import ButtonLink from "../../components/ButtonLink";

const AllProductsPage = () => {
  const { status } = useSession();

  const {
    data: { products: allProducts },
  } = api.product.getAll.useQuery(undefined, {
    initialData: { message: "Initial data received", products: [] },
    initialDataUpdatedAt: 0,
    staleTime: TIME_IN_MS.FIVE_MINUTES,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const products = useMemo(() => {
    return allProducts.filter((product) => product.title.includes(searchQuery));
  }, [allProducts, searchQuery]);

  return (
    <div className="flex flex-col items-center gap-2 p-4 md:gap-8 md:p-8">
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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
      </div>
      <div className="flex w-full flex-col items-center gap-4 md:gap-8 xl:flex-row xl:flex-wrap">
        {products.map((product) => {
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

                <TruncatedText className="mt-2 text-zinc-400" maxLines={3}>
                  {product.description}
                </TruncatedText>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AllProductsPage;

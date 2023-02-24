import {
  type InferGetStaticPropsType,
  type GetStaticPaths,
  type GetStaticProps,
} from "next";
import { prisma } from "../../../server/db";
import { PrismaCuidSchema } from "../../types";
import { type Image as ProductImage, type Product } from "@prisma/client";
import PageWithFallback from "../../../components/PageWithFallback";
import Image from "../../../components/Image";
import ExpandableText from "../../../components/ExpandableText";
import Button from "../../../components/Button";
import { useSession } from "next-auth/react";
import StyledDialog from "../../../components/StyledDialog";
import { useState } from "react";
import { api } from "../../../utils/api";

export const getStaticProps: GetStaticProps<{
  product:
    | (Product & {
        images?: ProductImage[];
      })
    | null;
}> = async (ctx) => {
  const id = PrismaCuidSchema.parse(ctx.params?.id);

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
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: true,
  };
};

const ProductDeleteDialog = ({ productId }: { productId: string }) => {
  const [open, setOpen] = useState(false);

  const { mutate, isLoading } = api.product.delete.useMutation({
    onSuccess: () => {
      //To do throw a toast here
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

  const isAuthedToEdit = product.userId === data?.user?.id;

  console.log({ isAuthedToEdit });

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
        <h2 className="text-3xl font-bold text-zinc-200 md:text-5xl xl:max-w-[80%]">
          {product.title}
        </h2>
        <p className="text-2xl md:text-4xl">{`$${product.price}`}</p>
        {/* Font size for this is defined in the parent div */}
        <ExpandableText
          className="mt-2 text-zinc-400 md:mt-3 xl:max-w-[80%]"
          maxLines={10}
        >
          {product.description}
        </ExpandableText>
        <div className="flex gap-2">
          <Button variants={{ type: "secondary" }}>Add to cart</Button>
          <Button>Buy now</Button>
          {isAuthedToEdit ? (
            <ProductDeleteDialog productId={product.id} />
          ) : null}
        </div>
      </div>

      {/* To do add image fall back here */}
    </div>
  );
};

export default PageWithFallback(ProductPage);

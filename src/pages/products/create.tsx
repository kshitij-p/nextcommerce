import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React, { useState } from "react";
import { api } from "../../utils/api";
import { invalidateProducts } from "../../utils/client";

const CreateProductPage = () => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState<File | undefined>(undefined);

  const [productLink, setProductLink] = useState("");

  const { mutate: createProduct } = api.product.create.useMutation({
    onSuccess: async (data) => {
      await invalidateProducts(queryClient);
      setProductLink(data.product.id);
    },
  });

  const { mutateAsync: getPresignedUrl } =
    api.image.getPresignedUrl.useMutation({});

  const handleCreate = async () => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image")) {
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

    //To do show a progress bar for file upload
    alert("Got key");

    createProduct({
      title: title,
      description: desc,
      imageKey: key,
      price: price,
    });
  };

  return (
    <div>
      Title
      <input
        name="title"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
      />
      <br />
      Description
      <input
        name="description"
        value={desc}
        onChange={(e) => setDesc(e.currentTarget.value)}
      />
      <br />
      Price
      <input
        name="price"
        value={price}
        onChange={(e) => setPrice(e.currentTarget.value)}
      />
      <br />
      <input
        type="file"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          let file = e.currentTarget?.files?.[0];
          if (!file) {
            return;
          }
          setFile(file);
        }}
      />
      <button onClick={handleCreate}>Create</button>
      {productLink ? (
        <Link href={`/products/${productLink}`}>
          Success! Click to visit your product
        </Link>
      ) : null}
    </div>
  );
};

export default CreateProductPage;

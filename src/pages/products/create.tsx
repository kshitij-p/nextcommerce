import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React, { useState } from "react";
import ImageUploader from "../../components/ImageUploader";
import { api } from "../../utils/api";
import { invalidateProducts } from "../../utils/client";

/* 
Testing img
https://img.fruugo.com/product/8/62/185698628_max.jpg
*/

const CreateProductPage = () => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [imageKey, setImageKey] = useState("");

  const [productLink, setProductLink] = useState("");

  const { mutate } = api.product.create.useMutation({
    onSuccess: async (data) => {
      await invalidateProducts(queryClient);
      setProductLink(data.product.id);
    },
  });

  const handleCreate = () => {
    mutate({
      title: title,
      description: desc,
      imageKey: imageKey,
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
      Image Key
      <input
        value={imageKey}
        onChange={(e) => {
          setImageKey(e.currentTarget.value);
        }}
      />
      <ImageUploader
        onSuccess={(key) => {
          setImageKey(key);
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

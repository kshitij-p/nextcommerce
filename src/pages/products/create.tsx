import React, { useState } from "react";
import { api } from "../../utils/api";

/* 
Testing img
https://img.fruugo.com/product/8/62/185698628_max.jpg
*/

const CreateProductPage = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const { mutate } = api.product.create.useMutation();

  const handleCreate = () => {
    mutate({
      title: title,
      description: desc,
      imageKey: "https://img.fruugo.com/product/8/62/185698628_max.jpg",
      imagePublicUrl: "https://img.fruugo.com/product/8/62/185698628_max.jpg",
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
      <button onClick={handleCreate}>Create</button>
    </div>
  );
};

export default CreateProductPage;

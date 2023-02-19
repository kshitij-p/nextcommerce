import React, { useState } from "react";
import { api } from "../../utils/api";

/* 
Testing img
https://img.fruugo.com/product/8/62/185698628_max.jpg
*/

const UpdateProductPage = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [id, setId] = useState("");

  const { mutate } = api.product.update.useMutation();

  const handleCreate = () => {
    mutate({
      title: title,
      description: desc,
      id: id,
    });
  };

  return (
    <div>
      id
      <input
        name="id"
        value={id}
        onChange={(e) => setId(e.currentTarget.value)}
      />
      <br />
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
      <button onClick={handleCreate}>Update</button>
    </div>
  );
};

export default UpdateProductPage;

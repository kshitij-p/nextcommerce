import React, { useState } from "react";
import { api } from "../../utils/api";

/* 
Testing img
https://img.fruugo.com/product/8/62/185698628_max.jpg
*/

const DeleteProductPage = () => {
  const [id, setId] = useState("");

  const { mutate } = api.product.delete.useMutation();

  const handleCreate = () => {
    mutate({ id: id });
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
      <button onClick={handleCreate}>Create</button>
    </div>
  );
};

export default DeleteProductPage;

import React from "react";
import { api } from "../../../utils/api";

const ProductPage = () => {
  const { data } = api.product.getAll.useQuery();

  console.log({ data });

  return (
    <div>
      <h2>Title</h2>
      <p>Description</p>
    </div>
  );
};

export default ProductPage;

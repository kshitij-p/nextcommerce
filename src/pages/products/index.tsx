import React from "react";
import { api } from "../../utils/api";

const AllProductsPage = () => {
  const { data } = api.product.getAll.useQuery();

  console.log({ data });

  return <div>AllProductsPage</div>;
};

export default AllProductsPage;

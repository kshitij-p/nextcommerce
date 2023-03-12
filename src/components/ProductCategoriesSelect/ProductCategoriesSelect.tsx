import { type ProductCategories } from "@prisma/client";
import React from "react";
import { PRODUCT_CATEGORIES } from "../../utils/client";
import Select from "../Select";

export const CATEGORY_OPTIONS: Array<{
  key: ProductCategories;
  value: (typeof PRODUCT_CATEGORIES)[keyof typeof PRODUCT_CATEGORIES];
}> = Object.entries(PRODUCT_CATEGORIES).map(
  ([catKey, catValue]) =>
    ({ key: catKey as ProductCategories, value: catValue } as const)
);

export const DEFAULT_CATEGORY_OPTION_VALUE =
  CATEGORY_OPTIONS[0] as (typeof CATEGORY_OPTIONS)[0];

const ProductCategoriesSelect = ({
  listElProps,
  multiple = false,
  ...rest
}: Omit<
  React.ComponentProps<typeof Select<(typeof CATEGORY_OPTIONS)[0]>>,
  "options" | "multiple" | "textField"
> & {
  multiple?: React.ComponentProps<typeof Select>["multiple"];
}) => {
  return (
    <Select
      {...rest}
      multiple={multiple}
      textField={"value"}
      listElProps={{
        ...listElProps,
        className: `text-start w-max max-h-52 ${listElProps?.className ?? ""}`,
      }}
      options={CATEGORY_OPTIONS}
    />
  );
};

export default ProductCategoriesSelect;

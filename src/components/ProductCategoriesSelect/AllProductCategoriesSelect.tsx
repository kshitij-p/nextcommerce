import Select from "../ui/Select";
import { CATEGORY_OPTIONS } from "./ProductCategoriesSelect";

export const ALL_CATEGORY_OPTIONS = [
  { key: "All", value: "All" },
  ...CATEGORY_OPTIONS,
];

export const DEFAULT_ALL_CATEGORY_OPTION_VALUE =
  ALL_CATEGORY_OPTIONS[0] as (typeof ALL_CATEGORY_OPTIONS)[0];

const AllProductCategoriesSelect = ({
  listElProps,
  multiple = false,
  ...rest
}: Omit<
  React.ComponentProps<typeof Select<(typeof ALL_CATEGORY_OPTIONS)[0]>>,
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
      options={ALL_CATEGORY_OPTIONS}
    />
  );
};

export default AllProductCategoriesSelect;

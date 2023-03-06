import { zodResolver } from "@hookform/resolvers/zod";
import { useForm as useRHFForm, type UseFormProps } from "react-hook-form";
import { type TypeOf } from "zod";

const useForm = <Z extends Zod.Schema>({
  schema,
  ...rest
}: Exclude<UseFormProps<TypeOf<Z>>, "resolver"> & {
  schema: Z;
}) => {
  return useRHFForm({ ...rest, resolver: zodResolver(schema) });
};

export default useForm;

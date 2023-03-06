import { zodResolver } from "@hookform/resolvers/zod";
import { useForm as useRHFForm, type UseFormProps } from "react-hook-form";
import { type z } from "zod";

const useForm = <Z extends Zod.Schema>({
  schema,
}: UseFormProps<Z> & {
  schema: Z;
}) => {
  return useRHFForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
};

export default useForm;

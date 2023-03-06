import { type ComponentProps } from "react";
import {
  FormProvider,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";

interface FormProps<T extends FieldValues>
  extends Omit<ComponentProps<"form">, "onSubmit"> {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
}

const Form = <T extends FieldValues>({
  form,
  onSubmit,
  children,
  ...rest
}: FormProps<T>) => (
  <FormProvider {...form}>
    <form {...rest} onSubmit={form.handleSubmit(onSubmit)}>
      <fieldset disabled={form.formState.isSubmitting}>{children}</fieldset>
    </form>
  </FormProvider>
);

Form.displayName = "Form";

export default Form;

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
  disabled?: boolean;
  preventSubmitWhileDisabled?: boolean;
}

const Form = <T extends FieldValues>({
  form,
  onSubmit,
  children,
  disabled: passedDisabled = false,
  preventSubmitWhileDisabled = true,
  ...rest
}: FormProps<T>) => {
  const disabled = passedDisabled || form.formState.isSubmitting;

  const handleSubmit = form.handleSubmit((...args) => {
    if (preventSubmitWhileDisabled && disabled) {
      return;
    }
    onSubmit(...args);
  });

  return (
    <FormProvider {...form}>
      <form {...rest} onSubmit={handleSubmit}>
        <fieldset disabled={disabled}>{children}</fieldset>
      </form>
    </FormProvider>
  );
};

Form.displayName = "Form";

export default Form;

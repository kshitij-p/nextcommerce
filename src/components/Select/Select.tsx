import React, { Fragment } from "react";
import { Listbox } from "@headlessui/react";
import Button from "../Button";

interface SelectGenericProps<
  T extends Record<string, unknown> | Array<Record<string, unknown>>
> {
  renderOpener: React.ReactElement;
  value: T;
  setValue: (value: T) => void;
  textField: T extends Array<Record<string, unknown>> ? keyof T[0] : keyof T;
  valueField: T extends Array<Record<string, unknown>> ? keyof T[0] : keyof T;
  options: T extends Array<Record<string, unknown>> ? Array<T[0]> : Array<T>;
}

interface SingleSelectProps
  extends SelectGenericProps<Record<string, unknown>> {
  multiple: false;
}

interface MultipleSelectProps
  extends SelectGenericProps<Array<Record<string, unknown>>> {
  multiple: true;
}

export type SelectProps = SingleSelectProps | MultipleSelectProps;

const Select = ({
  value,
  setValue,
  options,
  textField,
  valueField,
  multiple,
}: SelectProps) => {
  return (
    <Listbox value={value} onChange={setValue} multiple={multiple}>
      <Listbox.Button as={Fragment}>
        <Button>
          {multiple
            ? value.map((val) => val[textField]).join(",")
            : (value[textField] as string)}
        </Button>
      </Listbox.Button>

      <Listbox.Options>
        {options.map((x) => {
          return (
            <Listbox.Option
              key={x[valueField] as string}
              value={x[valueField] as string}
            >
              {x[textField] as string}
            </Listbox.Option>
          );
        })}
      </Listbox.Options>
    </Listbox>
  );
};

Select.displayName = "Select";

export default Select;

import React, { Fragment } from "react";
import { Listbox } from "@headlessui/react";
import Button from "../Button";

interface SelectGenericProps<T> {
  value: T;
  setValue: (value: T) => void;
  /* textField: T extends Array<T> ? keyof T[keyof T] : keyof T;
  options: T extends Array<T> ? Array<T[keyof T]> : Array<T>; */
  textField: keyof T;
  options: Array<T>;
}

interface SingleSelectProps<T> extends SelectGenericProps<T> {
  multiple: false;
}
/* 
interface MultipleSelectProps<T> extends SelectGenericProps<Array<T>> {
  multiple: true;
} */

export type SelectProps<T> = React.ComponentProps<"div"> &
  SingleSelectProps<T> /* | MultipleSelectProps<T> */;

const Select = <T extends Record<string, unknown>>({
  value,
  setValue,
  options,
  textField,
  multiple,
  className = "",
  ...rest
}: SelectProps<T>) => {
  return (
    <Listbox value={value} onChange={setValue} multiple={multiple}>
      <div {...rest} className={`relative ${className}`}>
        <Listbox.Button as={Fragment}>
          <Button>{value[textField] as string}</Button>
        </Listbox.Button>

        <Listbox.Options className="absolute top-full z-[1500] mt-2 flex flex-col gap-2 rounded bg-zinc-800 p-2">
          {options.map((x) => {
            return (
              <Listbox.Option
                key={x[textField] as string}
                value={x}
                as={Fragment}
              >
                <li
                  className={`items-center justify-center rounded-sm p-2 ui-selected:bg-red-500 ui-active:bg-red-500`}
                >
                  {x[textField] as string}
                </li>
              </Listbox.Option>
            );
          })}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};

Select.displayName = "Select";

export default Select;

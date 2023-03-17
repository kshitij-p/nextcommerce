import React, { Fragment } from "react";
import { Listbox } from "@headlessui/react";
import Button from "../Button";
import { useFloating, flip, offset } from "@floating-ui/react-dom";

interface SelectGenericProps<T> {
  value: T;
  setValue: (value: T) => void;
  /* textField: T extends Array<T> ? keyof T[keyof T] : keyof T;
  options: T extends Array<T> ? Array<T[keyof T]> : Array<T>; */
  textField: keyof T;
  options: Array<T>;
  openerProps?: Omit<React.ComponentProps<typeof Button>, "children">;
  listElProps?: Omit<React.ComponentProps<"ul">, "children">;
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
  openerProps,
  listElProps,
  textField,
  multiple,
  className = "",
  ...rest
}: SelectProps<T>) => {
  const { x, y, strategy, refs } = useFloating({
    placement: "bottom-start",
    middleware: [offset(8), flip()],
  });

  return (
    <Listbox value={value} onChange={setValue} multiple={multiple}>
      <div {...rest} className={`relative flex ${className}`}>
        <Listbox.Button as={"div"} ref={refs.setReference}>
          <Button {...openerProps}>{value[textField] as string}</Button>
        </Listbox.Button>

        <Listbox.Options
          className={`mobile-scrollbar z-[1500] flex flex-col gap-2 overflow-auto rounded bg-neutral-900 p-2 shadow shadow-black focus:outline-0 ${
            listElProps?.className ?? ""
          }`}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: "max-content",
          }}
          ref={refs.setFloating}
        >
          {options.map((x) => {
            return (
              <Listbox.Option
                key={x[textField] as string}
                value={x}
                as={Fragment}
              >
                <li
                  className={`cursor-pointer items-center justify-center rounded border-2 border-transparent p-2 transition ui-selected:border-teal-700 ui-selected:bg-teal-700/40 ui-active:border-teal-500`}
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

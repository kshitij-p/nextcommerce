import React, { type ForwardedRef, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import Button from "../Button";
import { useFloating, flip, offset } from "@floating-ui/react-dom";
import { getTransitionAnimation } from "../../../utils/animationHelpers";

export const SelectListItem = React.forwardRef(
  (
    { children, className = "", ...rest }: React.ComponentProps<"li">,
    passedRef: ForwardedRef<HTMLLIElement>
  ) => {
    return (
      <li
        {...rest}
        className={`shrink-0 cursor-pointer items-center justify-center truncate rounded border-2 border-transparent p-2 transition ui-selected:border-teal-700 ui-selected:bg-teal-700/40 ui-active:border-teal-500 ${className}`}
        ref={passedRef}
      >
        {children}
      </li>
    );
  }
);

SelectListItem.displayName = "SelectListItem";

export const SelectList = React.forwardRef(
  (
    { children, className = "", ...rest }: React.ComponentProps<"ul">,
    passedRef: ForwardedRef<HTMLUListElement>
  ) => {
    return (
      <ul
        {...rest}
        className={`mobile-scrollbar z-[1500] flex origin-top flex-col gap-2 overflow-auto rounded bg-neutral-900 p-2 shadow shadow-black focus:outline-0 ${className}`}
        ref={passedRef}
      >
        {children}
      </ul>
    );
  }
);

SelectList.displayName = "SelectList";

export const useSelectPositioning = () => {
  return useFloating({
    placement: "bottom-start",
    middleware: [offset(8), flip()],
  });
};

interface SelectGenericProps<T> {
  value: T;
  setValue: (value: T) => void;
  /* textField: T extends Array<T> ? keyof T[keyof T] : keyof T;
  options: T extends Array<T> ? Array<T[keyof T]> : Array<T>; */
  textField: keyof T;
  options: Array<T>;
  openerProps?: Omit<React.ComponentProps<typeof Button>, "children">;
  listElProps?: Omit<React.ComponentProps<typeof SelectList>, "children">;
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
  const { x, y, strategy, refs } = useSelectPositioning();

  return (
    <Listbox value={value} onChange={setValue} multiple={multiple}>
      {({ open }) => (
        <div {...rest} className={`relative flex ${className}`}>
          <Listbox.Button as={"div"} ref={refs.setReference}>
            <Button {...openerProps}>{value[textField] as string}</Button>
          </Listbox.Button>

          <Transition
            show={open}
            appear
            {...getTransitionAnimation({
              hidden: "transform scale-y-90 opacity-0",
              visible: "transform scale-y-100 opacity-100",
            })}
            as={Fragment}
          >
            <Listbox.Options as={Fragment}>
              <SelectList
                {...listElProps}
                style={{
                  position: strategy,
                  top: y ?? 0,
                  left: x ?? 0,
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
                      <SelectListItem>{x[textField] as string}</SelectListItem>
                    </Listbox.Option>
                  );
                })}
              </SelectList>
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
};

Select.displayName = "Select";

export default Select;

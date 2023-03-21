import React, { Fragment, useMemo } from "react";
import { Combobox } from "@headlessui/react";
import {
  SelectList,
  SelectListItem,
  useSelectPositioning,
} from "../Select/Select";

const Autocomplete = <
  TKey extends keyof TValue,
  TValue extends Record<string, unknown> & {
    [key in TKey]: string;
  }
>({
  value,
  onChange,
  options,
  query,
  defaultQuery,
  onQueryChange,
  textField,
  inputElProps,
  listElProps,
  listItemProps,
  className = "",
  ...rest
}: Omit<React.ComponentProps<"div">, "value" | "onChange"> & {
  options: Array<TValue>;
  value: TValue;
  onChange: (value: TValue) => void;
  query: string;
  defaultQuery?: string;
  onQueryChange: (query: string, triggeredByOptionSelect: boolean) => void;
  textField: TKey;
  inputElProps?: Omit<
    React.ComponentProps<"input">,
    "value" | "onChange" | "defaultValue"
  >;
  listElProps?: Omit<React.ComponentProps<typeof SelectList>, "children">;
  listItemProps?: Omit<
    React.ComponentProps<typeof SelectListItem>,
    "children"
  > & {
    textAsTitle?: boolean;
  };
}) => {
  const { x, y, strategy, refs } = useSelectPositioning();

  const filteredOptions = useMemo(() => {
    return query
      ? options.filter((option) => option[textField].includes(query))
      : options;
  }, [query, options, textField]);

  return (
    <Combobox
      value={value}
      onChange={(value) => {
        onChange(value);
        onQueryChange(value[textField], true);
      }}
    >
      <div {...rest} className={`relative flex ${className}`}>
        <div ref={refs.setReference}>
          <Combobox.Button as={Fragment}>
            <Combobox.Input
              {...inputElProps}
              value={query}
              defaultValue={defaultQuery}
              onChange={(e) => {
                onQueryChange(e.currentTarget.value, false);
              }}
            />
          </Combobox.Button>
        </div>
        <Combobox.Options as={Fragment}>
          <SelectList
            {...listElProps}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: "max-content",
            }}
            ref={refs.setFloating}
          >
            {filteredOptions.map((option) => (
              <Combobox.Option
                key={option[textField]}
                value={option}
                as={Fragment}
              >
                <SelectListItem
                  {...listItemProps}
                  title={
                    listItemProps?.title
                      ? listItemProps.title
                      : listItemProps?.textAsTitle
                      ? option[textField]
                      : undefined
                  }
                >
                  {option[textField]}
                </SelectListItem>
              </Combobox.Option>
            ))}
          </SelectList>
        </Combobox.Options>
      </div>
    </Combobox>
  );
};

export default Autocomplete;

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
  onQueryChange,
  textField,
  className = "",
  ...rest
}: Omit<React.ComponentProps<"div">, "value" | "onChange"> & {
  options: Array<TValue>;
  value: TValue;
  onChange: (value: TValue) => void;
  query: string;
  onQueryChange: (query: string) => void;
  textField: TKey;
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
        onQueryChange(value[textField]);
      }}
    >
      <div {...rest} className={`relative flex ${className}`}>
        <div ref={refs.setReference}>
          <Combobox.Input
            value={query}
            onChange={(e) => {
              onQueryChange(e.currentTarget.value);
            }}
          />
        </div>
        <Combobox.Options as={Fragment}>
          <SelectList
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
                <SelectListItem>{option[textField]}</SelectListItem>
              </Combobox.Option>
            ))}
          </SelectList>
        </Combobox.Options>
      </div>
    </Combobox>
  );
};

export default Autocomplete;

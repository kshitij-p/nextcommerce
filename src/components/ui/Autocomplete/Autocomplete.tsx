import React, { Fragment, type HTMLProps, useMemo } from "react";
import { Combobox, Transition } from "@headlessui/react";
import {
  SelectList,
  SelectListItem,
  useSelectPositioning,
} from "../Select/Select";
import { getTransitionAnimation } from "../../../utils/animationHelpers";

const Autocomplete = <
  TKey extends keyof TValue,
  TValue extends Record<string, unknown> & {
    [key in TKey]: string;
  }
>({
  value,
  onChange,
  placeholderValue,
  options,
  query,
  defaultQuery,
  onQueryChange,
  textField,
  noOptionsText = "No options to show",
  Opener = <div />,
  inputElProps,
  listElProps,
  listItemProps: passedListItemProps = {},
  className = "",
  ...rest
}: Omit<React.ComponentProps<"div">, "value" | "onChange"> & {
  options: Array<TValue>;
  value: TValue;
  onChange: (value: TValue) => void;
  placeholderValue: TValue;
  query: string;
  defaultQuery?: string;
  onQueryChange: (query: string, triggeredByOptionSelect: boolean) => void;
  textField: TKey;
  noOptionsText?: string;
  Opener?: React.ReactElement<HTMLProps<HTMLElement>>;
  inputElProps?: Omit<
    React.ComponentProps<"input">,
    "value" | "onChange" | "defaultValue"
  >;
  listElProps?: Omit<
    React.ComponentPropsWithRef<typeof SelectList>,
    "children"
  >;
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

  const { textAsTitle, ...listItemProps } = passedListItemProps;

  return (
    <Combobox
      value={value}
      onChange={(value) => {
        onChange(value);
        onQueryChange(value[textField], true);
      }}
    >
      {({ open }) => (
        <div {...rest} className={`relative flex ${className}`}>
          <Combobox.Button as={Fragment}>
            {React.cloneElement(Opener, {
              ...Opener.props,
              ref: refs.setReference,
              children: (
                <>
                  {Opener.props.children}
                  <Combobox.Input
                    autoComplete={"off"}
                    {...inputElProps}
                    value={query}
                    defaultValue={defaultQuery}
                    displayValue={() => query}
                    onChange={(e) => {
                      if (!e.currentTarget.value) {
                        onChange(placeholderValue);
                      }
                      onQueryChange(e.currentTarget.value, false);
                    }}
                  />
                </>
              ),
            })}
          </Combobox.Button>

          <Transition
            show={open}
            appear
            {...getTransitionAnimation({
              hidden: "transform scale-y-90 opacity-0",
              visible: "transform scale-y-100 opacity-100",
            })}
            as={Fragment}
          >
            <Combobox.Options as={Fragment}>
              <SelectList
                {...listElProps}
                style={{
                  position: strategy,
                  top: y ?? 0,
                  left: x ?? 0,
                }}
                ref={refs.setFloating}
              >
                {filteredOptions.length ? (
                  filteredOptions.map((option) => (
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
                            : textAsTitle
                            ? option[textField]
                            : undefined
                        }
                      >
                        {option[textField]}
                      </SelectListItem>
                    </Combobox.Option>
                  ))
                ) : (
                  <div className="p-2">
                    <p
                      className="font-light italic text-neutral-300"
                      title={noOptionsText}
                    >
                      {noOptionsText}
                    </p>
                  </div>
                )}
              </SelectList>
            </Combobox.Options>
          </Transition>
        </div>
      )}
    </Combobox>
  );
};

export default Autocomplete;

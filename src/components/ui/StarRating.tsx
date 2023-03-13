import { StarFilledIcon } from "@radix-ui/react-icons";
import React, { type ForwardedRef, useState, useRef } from "react";
import { useFormContext } from "react-hook-form";

const INDEX_ATTRIBUTE = "data-index";

const Star = ({
  filled = false,
  highlightedIndex,
  index,
  size = "w-4 md:w-8",
  className = "",
  ...rest
}: Omit<React.ComponentProps<"svg">, "children" | "ref"> & {
  filled?: boolean;
  hovered?: boolean;
  index: number;
  highlightedIndex: number;
  size?: string;
}) => {
  const hovered = index <= highlightedIndex;
  const isHighlighted = index === highlightedIndex;

  return (
    <StarFilledIcon
      {...rest}
      className={`h-auto ${size} group-focus:outline-0 ${
        isHighlighted
          ? "stroke-teal-500 text-white"
          : hovered || filled
          ? "stroke-transparent text-white group-focus:stroke-teal-500"
          : "stroke-white text-transparent"
      } ${className}
  `}
    />
  );
};

interface ViewOnlyStarRatingProps {
  maxStars?: number;
  value: string;
  asInput?: false;
  inputProps?: undefined;
  autoFocusActive?: false;
  onRatingChange?: undefined;
  starProps?: Omit<
    React.ComponentProps<typeof Star>,
    "filled" | "index" | "highlightedIndex" | "hovered"
  >;
}

interface EditableStarRatingProps
  extends Omit<
    ViewOnlyStarRatingProps,
    "asInput" | "inputProps" | "autoFocusActive" | "onRatingChange"
  > {
  inputProps: Omit<React.ComponentPropsWithRef<"input">, "value" | "onChange">;
  onRatingChange: (e: React.SyntheticEvent<HTMLInputElement>) => void;
  asInput?: true;
  autoFocusActive?: boolean;
}

type StarRatingProps = ViewOnlyStarRatingProps | EditableStarRatingProps;

const StarRating = React.forwardRef(
  (
    {
      maxStars = 5,
      asInput,
      value,
      inputProps,
      className = "",
      autoFocusActive = false,
      onRatingChange,
      starProps: passedStarProps,
      ...rest
    }: Exclude<React.ComponentProps<"div">, "value" | "onChange"> &
      StarRatingProps,
    passedRef: ForwardedRef<HTMLDivElement>
  ) => {
    const [active, setActive] = useState(parseInt(value));
    const [highlighted, setHighlighted] = useState(-1);

    const starsRef = useRef<Array<HTMLSpanElement | undefined>>(
      new Array(maxStars) as Array<undefined>
    );

    const form = useFormContext();
    const state =
      asInput && form && inputProps?.name
        ? form.getFieldState(inputProps.name, form.formState)
        : undefined;
    const errorMessage = state?.error?.message;

    return (
      <div
        {...rest}
        className={`inline-flex flex-col ${className}`}
        ref={passedRef}
      >
        <div className="flex">
          {Array.from(Array(maxStars), (_, i) => i + 1).map((x, idx) => {
            const spanContainerProps: React.ComponentProps<"span"> & {
              [k: string]: unknown;
            } = {
              className: "group focus:outline-0",
              [INDEX_ATTRIBUTE]: idx,
            };

            const starProps: React.ComponentProps<typeof Star> = {
              ...passedStarProps,
              index: idx,
              highlightedIndex: highlighted,
            };

            return asInput === true ? (
              <label key={x}>
                <span
                  {...spanContainerProps}
                  tabIndex={
                    x === (highlighted >= 0 ? highlighted : active) ? 0 : -1
                  }
                  onMouseOver={(e) => {
                    const idx = parseInt(
                      e.currentTarget.getAttribute(INDEX_ATTRIBUTE) as string
                    );
                    if (isNaN(idx)) {
                      return;
                    }
                    setHighlighted(idx);
                    e.currentTarget.focus();
                  }}
                  onMouseLeave={() => {
                    setHighlighted(-1);
                  }}
                  onKeyDown={(e) => {
                    if (e.code === "Tab") {
                      setHighlighted(-1);
                      return;
                    }

                    let increment =
                      e.code === "ArrowRight"
                        ? 1
                        : e.code === "ArrowLeft"
                        ? -1
                        : 0;
                    if (!increment) {
                      return;
                    }
                    const nextIdx =
                      parseInt(
                        e.currentTarget.getAttribute(INDEX_ATTRIBUTE) as string
                      ) + increment;
                    e.preventDefault();
                    const nextStar = starsRef.current[nextIdx];
                    if (!nextStar) {
                      return;
                    }
                    nextStar.click();
                    nextStar.focus();
                    setHighlighted(nextIdx);
                  }}
                  ref={(e) => {
                    if (!e) {
                      return;
                    }
                    starsRef.current[idx] = e;
                    if (autoFocusActive && active === x) {
                      e.focus();
                    }
                  }}
                >
                  <Star
                    {...starProps}
                    filled={highlighted >= 0 ? false : x <= active}
                  />
                </span>
                <input
                  {...inputProps}
                  tabIndex={-1}
                  onChange={(e) => {
                    onRatingChange(e);
                    setHighlighted(-1);
                    setActive(parseInt(e.currentTarget.value));
                  }}
                  className="sr-only"
                  type={"radio"}
                  value={x}
                  checked={x === active}
                />
                <p className="sr-only">{`${x} stars`}</p>
              </label>
            ) : (
              <span {...spanContainerProps} key={x}>
                <Star {...starProps} filled={x <= parseInt(value)} />
              </span>
            );
          })}
        </div>
        <b className="text-red-500">{errorMessage}</b>
      </div>
    );
  }
);

StarRating.displayName = "StarRating";

export default StarRating;

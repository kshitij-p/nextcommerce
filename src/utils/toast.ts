import { toast as rhtToast, type ToasterProps } from "react-hot-toast";

const DEFAULT_OPTIONS: ToasterProps["toastOptions"] & {
  type: "normal" | "success" | "error";
} = {
  type: "normal",
};

const toast = (
  message: string,
  passedOptions: Partial<typeof DEFAULT_OPTIONS> = DEFAULT_OPTIONS
) => {
  const {
    type,
    style: passedStyle,
    iconTheme: passedIconTheme,
    ...restOptions
  } = { ...DEFAULT_OPTIONS, ...passedOptions };

  let toastId;

  switch (type) {
    case "success":
      toastId = rhtToast.success(message, {
        ...restOptions,
        style: passedStyle,
        iconTheme: passedIconTheme,
      });
      break;

    case "error":
      toastId = rhtToast.error(message, {
        ...restOptions,
        style: {
          background: "rgb(204, 56, 56)",
          ...passedStyle,
        },
        iconTheme: {
          primary: "rgb(255, 233, 233)",
          secondary: "rgb(204, 56, 56)",
          ...passedIconTheme,
        },
      });
      break;

    default:
      toastId = rhtToast(message, {
        ...restOptions,
        style: passedStyle,
        iconTheme: passedIconTheme,
      });

      return toastId;
  }
};

export default toast;

import React, { useRef } from "react";
import { flushSync } from "react-dom";
import ErrorText from "../ui/ErrorText";
import Input from "../ui/Input";
import UnstyledTextarea from "../ui/Textarea/UnstyledTextarea";
import EditableHoverButton from "./EditableHoverButton";
import type useEditableText from "./useEditableText";

type UseEditableTextState = ReturnType<typeof useEditableText>;

const EditableText = ({
  children,
  value,
  text,
  setText,
  editing,
  setEditing,
  setDiagOpen,
  errorMsg,
  setErrorMsg,
  validatorSchema,
  canEdit,
  labelText,
  as = <p />,
  inputElement = "textarea",
  inputContainerProps,
  onChangeComplete,
  className = "",
  ...rest
}: Omit<React.ComponentProps<"p">, "children"> & {
  children: React.ReactNode;
  value: string;
  text: UseEditableTextState["text"];
  setText: UseEditableTextState["setText"];
  editing: UseEditableTextState["editing"];
  setEditing: UseEditableTextState["setEditing"];
  setDiagOpen: UseEditableTextState["setDiagOpen"];
  errorMsg: UseEditableTextState["errorMsg"];
  setErrorMsg: UseEditableTextState["setErrorMsg"];
  validatorSchema: Zod.Schema;
  canEdit: boolean;
  labelText?: string;
  as?: React.ReactElement<Record<string, unknown>>;
  inputElement?: "textarea" | "input";
  inputContainerProps?: React.ComponentProps<"div">;
  onChangeComplete?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const handleBlur = () => {
    if (value.trim() === text.trim()) {
      setEditing(false);
      return;
    }
    setDiagOpen(true);
  };

  const textElProps = {
    className: `w-full resize-none rounded-sm bg-transparent p-2 focus:${
      errorMsg ? "outline-red-500" : "outline-teal-500"
    } outline outline-2 ${
      errorMsg ? "outline-red-200" : "outline-teal-200"
    } transition-colors duration-500`,
    autoFocus: true,
    value: text,
    onChange: (
      e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
      const result = validatorSchema.safeParse(e.currentTarget.value);

      if (!result.success) {
        setErrorMsg(result.error.format()._errors[0] as string);
      } else {
        setErrorMsg("");
      }

      setText(e.currentTarget.value);
      if (onChangeComplete) {
        onChangeComplete(e);
      }
    },
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
    isInvalid: errorMsg ? true : false,
  };

  return (
    <div {...rest} className={`group relative ${className}`} ref={containerRef}>
      {editing ? (
        <div
          {...inputContainerProps}
          className={`flex w-full flex-col ${
            inputContainerProps?.className ?? ""
          }`}
        >
          <label className="flex w-full items-center gap-1">
            {labelText ? <p>{labelText}</p> : null}
            {inputElement === "textarea" ? (
              <UnstyledTextarea
                {...textElProps}
                containerProps={{ className: "w-full" }}
                autoResize
                cursorToTextEndOnFocus
              />
            ) : (
              <Input {...textElProps} />
            )}
          </label>
          <ErrorText className="text-lg" visible={errorMsg.length > 0}>
            {errorMsg}
          </ErrorText>
        </div>
      ) : (
        <div className="flex">
          {labelText ? <p>{labelText}</p> : null}
          {React.cloneElement(as, {
            ...as.props,
            className: `inline ${
              as.props.className && typeof as.props.className === "string"
                ? as.props.className
                : ""
            }`,
            children: value,
          })}
          {canEdit ? (
            <EditableHoverButton
              onClick={() => {
                flushSync(() => setText(value));
                setEditing(true);
              }}
            />
          ) : null}
        </div>
      )}
      {children}
    </div>
  );
};

export default EditableText;

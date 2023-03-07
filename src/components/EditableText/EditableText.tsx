import React, { useRef } from "react";
import { flushSync } from "react-dom";
import Input from "../Input";
import Textarea from "../Textarea";
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
  as = <p />,
  inputElement = "textarea",
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
  as?: React.ReactElement<Record<string, unknown>>;
  inputElement?: "textarea" | "input";
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
    className:
      "w-full resize-none rounded-sm bg-transparent p-2 focus:outline-blue-500 outline outline-2 outline-blue-200",
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
  };

  return (
    <div {...rest} className={`group relative ${className}`} ref={containerRef}>
      {editing ? (
        <div className="flex flex-col">
          {inputElement === "textarea" ? (
            <Textarea {...textElProps} autoResize cursorToTextEndOnFocus />
          ) : (
            <Input {...textElProps} />
          )}
          {errorMsg ? <p className="text-lg text-red-500">{errorMsg}</p> : null}
        </div>
      ) : (
        <>
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
        </>
      )}
      {children}
    </div>
  );
};

export default EditableText;

import React, { useState } from "react";
import useMultipleRefs from "../../hooks/useMultipleRefs";
import Button from "./Button";
import Input from "./Input";

const FileInput = React.forwardRef(
  (
    {
      errorTextProps,
      ...rest
    }: Omit<React.ComponentProps<typeof Input>, "type">,
    passedRef
  ) => {
    const [fileRef, setFileRef] = useState<HTMLInputElement | null>(null);

    const handleRef = useMultipleRefs(passedRef, setFileRef);

    const renderFileName = (file: File) => {
      let fileName = file.name;
      if (fileName.length > 5) {
        let [base, ext] = fileName.split(".");
        //This should not be possible
        if (!base) {
          return null;
        }

        fileName = `${base.slice(0, 20)}...` + (ext ? `.${ext}` : "");
      }

      return fileName;
    };

    return (
      <div className="relative flex flex-col">
        <div className="flex flex-col gap-2">
          <Button
            variants={{ type: "secondary" }}
            onClick={() => {
              fileRef?.click();
            }}
          >
            Choose a file
          </Button>
          {fileRef?.files?.[0] ? (
            <p>{renderFileName(fileRef.files[0])}</p>
          ) : null}
        </div>
        <Input
          {...rest}
          errorTextProps={errorTextProps}
          className="hidden"
          type={"file"}
          ref={handleRef}
        />
      </div>
    );
  }
);

FileInput.displayName = "FileInput";

export default FileInput;

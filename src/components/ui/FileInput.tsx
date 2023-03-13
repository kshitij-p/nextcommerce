import React, { useState } from "react";
import useMultipleRefs from "../../hooks/useMultipleRefs";
import Button from "./Button";
import Input from "./Input";

const FileInput = React.forwardRef(
  (
    { ...rest }: Omit<React.ComponentProps<typeof Input>, "type">,
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
      <>
        <div>
          <Button
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
        <Input {...rest} className="hidden" type={"file"} ref={handleRef} />
      </>
    );
  }
);

FileInput.displayName = "FileInput";

export default FileInput;

import React, { useRef, useState } from "react";
import { api } from "../utils/api";
import Button from "./Button";

const ImageUploader = ({
  onSuccess,
}: {
  onSuccess: (imageKey: string) => void;
}) => {
  const { mutateAsync } = api.image.getPresignedUrl.useMutation({});

  const [file, setFile] = useState<File | undefined>(undefined);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.currentTarget?.files?.[0];
    if (!file) {
      return;
    }
    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image")) {
      return;
    }

    const { presignedUrl, key } = await mutateAsync();

    try {
      await fetch(presignedUrl, {
        method: "PUT",
        body: file,
      });
    } catch (e) {
      return;
    }

    onSuccess(key);
  };

  return (
    <div>
      <input type="file" onChange={handleChange} ref={inputRef} />
      <Button
        variants={{ type: "secondary" }}
        disabled={!file?.type.startsWith("image")}
        onClick={handleUpload}
      >
        Upload
      </Button>
    </div>
  );
};

export default ImageUploader;

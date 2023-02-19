import React, { useRef } from "react";
import { api } from "../utils/api";

const ImageUploader = ({
  onSuccess,
}: {
  onSuccess: (imageKey: string) => void;
}) => {
  const { mutateAsync } = api.image.getPresignedUrl.useMutation({});

  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (
      !inputRef.current ||
      !inputRef.current.files ||
      !inputRef.current.files.length
    ) {
      return;
    }

    const file = inputRef.current.files[0];

    if (!file) {
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
      <input type="file" ref={inputRef} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default ImageUploader;

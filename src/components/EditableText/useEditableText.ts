import { useState } from "react";

const useEditableText = () => {
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);

  const [diagOpen, setDiagOpen] = useState(false);

  const handleStopEditing = () => {
    setEditing(false);
    setDiagOpen(false);
  };

  return {
    text,
    setText,
    editing,
    setEditing,
    diagOpen,
    setDiagOpen,
    onStopEditing: handleStopEditing,
  };
};

export default useEditableText;

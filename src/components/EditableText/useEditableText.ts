import { useState } from "react";

const useEditableText = () => {
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);

  const [diagOpen, setDiagOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleStopEditing = () => {
    setEditing(false);
    setDiagOpen(false);
    setErrorMsg("");
  };

  return {
    text,
    setText,
    editing,
    setEditing,
    diagOpen,
    setDiagOpen,
    errorMsg,
    setErrorMsg,
    onStopEditing: handleStopEditing,
  };
};

export default useEditableText;

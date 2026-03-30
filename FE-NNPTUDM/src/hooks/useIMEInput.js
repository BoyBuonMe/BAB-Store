// hooks/useIMEInput.js
import { useRef, useState } from "react";

export function useIMEInput(initialValue = "") {
  const [value, setValue] = useState(initialValue);
  const isComposing = useRef(false);

  const inputProps = {
    value,
    onCompositionStart: () => { isComposing.current = true; },
    onCompositionEnd: (e) => {
      isComposing.current = false;
      setValue(e.target.value);
    },
    onChange: (e) => {
      if (!isComposing.current) setValue(e.target.value);
    },
  };

  return [value, setValue, inputProps];
}
import { useState } from "react";
import { ChatInput } from "../../../shared/input";
import { ChatOutput } from "../../../shared/output";
import { generate } from "../../../features/artificial intelligence";

export default function Chat() {
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");

  function handleChange(event) {
    setInputValue(event.target.value);
  };

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
        console.log(inputValue)
        generate(inputValue, setOutputValue)
        setInputValue('')
    }
  }

  return (
    <div>
      {ChatInput(inputValue, handleChange, handleKeyDown) }
      {ChatOutput(outputValue)}
    </div>
  );
}

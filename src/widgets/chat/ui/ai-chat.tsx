import { ChatInput } from "../../../shared/input";
import { ChatOutput } from "../../../shared/output";
import { generate } from "../../../features/artificial intelligence";
import React, { useCallback } from "react";

export default function Chat([inputValueRef, setInputValue], [outputValue, setOutputValue]) {

  function handleChange(event) {
    setInputValue(event.target.value);
    console.log(inputValueRef.current)
  };

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
        clearAndGenerate()
    }
  }

  const clearAndGenerate = useCallback(() => {
    if(inputValueRef.current.length > 5){
      setInputValue('')
      return generate(inputValueRef.current, setOutputValue)
    }
  }, [inputValueRef, setOutputValue, setInputValue]); 
  
  return {
    content: {
        inputValue: inputValueRef.current,
        setInputValue,
        outputValue,
        setOutputValue,
        clearAndGenerate
    },
    ui: (
    <div>
      {ChatInput(inputValueRef.current, handleChange, handleKeyDown) }
      {ChatOutput(outputValue)}
    </div>
  )};
}

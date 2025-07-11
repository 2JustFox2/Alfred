import { useEffect, useState, useCallback, useRef } from "react";
import { Chat } from "../../../widgets/chat/";
import { VoiceButton } from "../../../widgets/voice-button/";
import React from "react";

export default function MainPage() {
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");
  const inputValueRef = useRef(inputValue);
  const chat = Chat([inputValueRef, setInputValue], [outputValue, setOutputValue]);

  const handleClap = useCallback(() => {
    console.log(inputValueRef.current); // will always be the latest value
    console.log("Clap detected! 👏");
    chat.content.clearAndGenerate();
  }, [inputValueRef, chat]);

  const voiceButton = VoiceButton(handleClap, setInputValue);
  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  return (
    <>
      {voiceButton.ui}
      {chat.ui}
    </>
  );
}

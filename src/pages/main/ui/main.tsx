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
    Notification.requestPermission().then(function(permission) {
      if (permission === 'granted') {
           new Notification('Clap detected! 👏', {
               body: inputValueRef.current,
               icon: 'icon.png'
           });
       }
    })

    chat.content.clearAndGenerate()?.then((value) => {
      Notification.requestPermission().then(function(permission) {
         if (permission === 'granted') {
              new Notification(inputValueRef.current, {
                  body: value,
                  icon: 'icon.png'
              });
          }
       })
    });
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

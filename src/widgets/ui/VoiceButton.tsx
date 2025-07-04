import { Button } from "../../shared/button";
import { VoiceToText } from "../../features/speech-recognition";
import { startClapDetectorListening, stopClapDetectorListening } from "../../features/clap-detection/model/clap-detector.service";
import { useState } from "react";
import React from "react";

export default function VoiceButton() {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const stream = React.useRef<MediaStream | null>(null);
  const mediaRecorder = React.useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const recognitionRef = VoiceToText({
    setIsListening,
    setText,
    setError,
  });

  recognitionRef.current?.stop();

  async function startListening() {
    console.log("startListening called");
    try {
      // start clap detctor
      await startClapDetectorListening({stream, mediaRecorder, isRecording, setIsRecording});
      // start voice to text
      // recognitionRef.current?.start();

      setIsListening(true);
    } catch (error) {
      console.error("startListening error:", error);
    }
  }

  async function stopListening() {
    console.log("stopListening called");
    try {
      // start clap detctor
      await stopClapDetectorListening({stream, mediaRecorder, isRecording, setIsRecording});
      // start voice to text
      // recognitionRef.current?.stop();

      setIsListening(false);
    } catch (error) {
      console.error("stopListening error:", error);
    }
  }

  function toggleListening() {
    console.log("toggleListening called, isListening:", isListening);
    if (!isListening) {
      startListening();
    } else {
      stopListening();
    }
  }

  return Button({
    toggleListening,
    isListening,
    text,
    error,
  });
}

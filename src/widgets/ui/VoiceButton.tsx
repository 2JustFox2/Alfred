import { Button } from "../../shared/button";
import { Circle } from "../../shared/circle";
import { VoiceToText } from "../../features/speech-recognition";
import {
  startClapDetector,
  stopClapDetector,
} from "../../features/clap-detection/";
import { useState } from "react";
import React from "react";

export default function VoiceButton() {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const stream = React.useRef<MediaStream | null>(null);
  const mediaRecorder = React.useRef<MediaRecorder | null>(null);
  const audioContext = React.useRef<AudioContext | null>(null);
  const [stopUpdateVolume, setStopUpdateVolume] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0);
  const clapDetectorComponent = {
    stream,
    mediaRecorder,
    isRecording,
    setIsRecording,
    audioContext,
    stopUpdateVolume,
    setStopUpdateVolume,
    volume,
    setVolume,
  };

  const recognitionRef = VoiceToText({
    setIsListening,
    setText,
    setError,
  });

  async function startListening() {
    console.log("startListening called");
    try {
      // start clap detctor
      await startClapDetector(clapDetectorComponent);
      // start voice to text
      recognitionRef.current?.start();

      setIsListening(true);
    } catch (error) {
      console.error("startListening error:", error);
    }
  }

  async function stopListening() {
    console.log("stopListening called");
    try {
      // start clap detctor
      await stopClapDetector(clapDetectorComponent);
      // start voice to text
      recognitionRef.current?.stop();

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

  return (
    <>
      {Circle(volume)}
      {Button({
        toggleListening,
        isListening,
        text,
        error,
      })}
    </>
  );
}

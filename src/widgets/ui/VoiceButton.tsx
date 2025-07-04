import { Button } from "../../shared/button";
import { VoiceToText } from "../../features/speech-recognition";
import { ClapDetector } from "../../features/clap-detection/model/clap-detector.service";
import { useState } from "react";

export default function VoiceButton() {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = VoiceToText({
    setIsListening,
    setText,
    setError,
  });

  const clapDetector = new ClapDetector()

  async function startListening() {
    console.log("startListening called");
    try {
      // start clap detctor
      await clapDetector.startListening()
      // start voice to text
      // recognitionRef.current?.start();
      
      setIsListening(true);
    } catch (error) {
      console.error("startListening error:", error);
    }
  }

  function stopListening() {
    console.log("stopListening called");
    try {
      // start clap detctor
      clapDetector.stopListening()
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
    error
  })
}
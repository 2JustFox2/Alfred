import { Button } from "../../shared/button";
import { VoiceToText } from "../../features/speech-recognition";
import { useState } from "react";

export default function VoiceButton() {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const toggleListening = VoiceToText({
    isListening,
    setIsListening,
    setText,
    setError,
  });
  
  return Button({ toggleListening, isListening, text, error });
}

import React, { useEffect } from "react";

const VoiceToText = ({setIsListening, setInputValue, setError}) => {

  // Создаем распознаватель речи
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Проверяем поддержку браузером
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setError("Ваш браузер не поддерживает распознавание речи!");
      return;
    }

    // Инициализация
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    // Настройки
    recognition.continuous = true; // Постоянное распознавание
    recognition.interimResults = true; // Промежуточные результаты
    // recognition.lang = "ru-RU"; // Язык (можно менять)

    // Обработчики событий
    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";
  
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
  
      setInputValue(finalTranscript || interimTranscript);
  };

    // recognition.onerror = (event) => {
    //   setError(`Ошибка распознавания: ${event.error}`);
    //   setIsListening(false);
    // };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [setError, setIsListening, setInputValue]);

  return recognitionRef
};

export default VoiceToText
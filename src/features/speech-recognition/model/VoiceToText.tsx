import React, { useState, useEffect } from "react";

const VoiceToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

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
    recognition.lang = "ru-RU"; // Язык (можно менять)

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

      setText(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event) => {
      setError(`Ошибка распознавания: ${event.error}`);
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setError(null);
    }
  };

  return (
    <div>
      <h2>Голос в текст</h2>
      <button onClick={toggleListening}>
        {isListening ? "Остановить" : "Начать запись"}
      </button>
      <div>
        <p>{text}</p>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
};

export default VoiceToText;

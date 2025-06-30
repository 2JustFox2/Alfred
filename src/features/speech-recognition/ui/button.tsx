
import React, { useState, useEffect, useRef } from 'react';

const MicrophoneAccess = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Запрос доступа к микрофону
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setIsRecording(true);
      console.log(stream)

      // Если нужно прослушивать микрофон в реальном времени
      if (audioRef.current) {
        audioRef.current.srcObject = stream;
      }

    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error);
    }
  };

  // Остановка записи
  const stopRecording = () => {
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
      setIsRecording(false);
    }
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioStream]);

  return (
    <div>
      <h3>Доступ к микрофону</h3>
      {!isRecording ? (
        <button onClick={startRecording}>Включить микрофон</button>
      ) : (
        <button onClick={stopRecording}>Выключить микрофон</button>
      )}

      {/* Для прослушивания микрофона в реальном времени */}
      <audio ref={audioRef} autoPlay muted={true} />

      {isRecording && <p>Идёт запись...</p>}
    </div>
  );
};

const VoiceToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Создаем распознаватель речи
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Проверяем поддержку браузером
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Ваш браузер не поддерживает распознавание речи!');
      return;
    }

    // Инициализация
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    // Настройки
    recognition.continuous = true; // Постоянное распознавание
    recognition.interimResults = true; // Промежуточные результаты
    recognition.lang = 'ru-RU'; // Язык (можно менять)

    // Обработчики событий
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

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
        {isListening ? 'Остановить' : 'Начать запись'}
      </button>
      <div>
        <p>{text}</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export  { VoiceToText, MicrophoneAccess };
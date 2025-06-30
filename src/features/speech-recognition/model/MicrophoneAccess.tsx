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

export default MicrophoneAccess
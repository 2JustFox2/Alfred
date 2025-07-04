function handleDataAvailable(event: BlobEvent) {
  // console.log("Data available", event);
  return event;
}

function handleError(this: MediaRecorder, error: ErrorEvent) {
  console.error("MediaRecorder error:", error);
  return error;
}

async function initMicrophone({
  stream,
  mediaRecorder,
  isRecording,
  setIsRecording,
  audioContext,
}) {
  if (isRecording) return;

  try {
    stream.current = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    mediaRecorder.current = new MediaRecorder(stream.current);
    mediaRecorder.current.ondataavailable = handleDataAvailable;
    mediaRecorder.current.onerror = handleError;

    audioContext.current = new AudioContext();
    const source = audioContext.current.createMediaStreamSource(stream.current);
    const analyser = audioContext.current.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(analyser);
    analyser.connect(audioContext.current.destination);
    const dataArray = new Float32Array(analyser.fftSize);
    analyser.getFloatFrequencyData(dataArray);

    mediaRecorder.current.onstop = () => {
      console.log("MediaRecorder stopped");
      cleanup({ stream, mediaRecorder, isRecording, setIsRecording });
    };

    return analyser;
  } catch (error) {
    console.error("Error initializing microphone:", error);
    cleanup({ stream, mediaRecorder, isRecording, setIsRecording });
    throw error;
  }
}

async function startClapDetector({
  stream,
  mediaRecorder,
  isRecording,
  setIsRecording,
  audioContext,
  setStopUpdateVolume,
  // volume,
  setVolume,
}) {
  if (isRecording) return;
  setIsRecording(true);

  try {
    const analyser = await initMicrophone({
      stream,
      mediaRecorder,
      isRecording,
      setIsRecording,
      audioContext,
    });

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function updateVolume() {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const volume = average / 256;
      setVolume(volume)

      if (volume > 0.2) {
        // console.log('Хлопок')
      }
      console.log("Громкость: " + volume);

      setStopUpdateVolume(window.requestAnimationFrame(updateVolume))
    }

    updateVolume()

    if (!mediaRecorder.current) {
      throw new Error("MediaRecorder not initialized");
    }

    mediaRecorder.current.start(100); // Записываем 100мс чанки
    console.log("Recording started", mediaRecorder.current.state);
  } catch (error) {
    console.error("Failed to start listening:", error);
    cleanup({ stream, mediaRecorder, isRecording, setIsRecording });
  }
}

async function stopClapDetector({
  stream,
  mediaRecorder,
  isRecording,
  setIsRecording,
  stopUpdateVolume,
  setStopUpdateVolume,
}) {
  if (!isRecording) return;

  try {
    if (stopUpdateVolume) {
      console.log(`stopUpdateVolume ${stopUpdateVolume}`)
      window.cancelAnimationFrame(stopUpdateVolume);
      setStopUpdateVolume(null);
    }

    if (!mediaRecorder.current || !stream.current) {
      throw new Error("MediaRecorder or Stream not initialized");
    }

    console.log("Stopping with state:", mediaRecorder.current.state);

    if (mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }

    stream.current.getTracks().forEach((track) => track.stop());
  } catch (error) {
    console.error("Failed to stop listening:", error);
  } finally {
    cleanup({ stream, mediaRecorder, isRecording, setIsRecording });
  }
}

function cleanup({ stream, mediaRecorder, isRecording, setIsRecording }) {
  if (isRecording) setIsRecording(false);

  if (mediaRecorder.current) {
    // Удаляем все обработчики
    mediaRecorder.current.ondataavailable = null;
    mediaRecorder.current.onerror = null;
    mediaRecorder.current.onstop = null;

    if (mediaRecorder.current.state !== "inactive") {
      try {
        mediaRecorder.current.stop();
      } catch (e) {
        console.warn("Error while stopping mediaRecorder:", e);
      }
    }
  }

  if (stream.current) {
    stream.current.getTracks().forEach((track) => track.stop());
  }

  stream.current = null;
  mediaRecorder.current = null;

  console.log("Cleanup complete");
}

export { startClapDetector, stopClapDetector };

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
    analyser.fftSize = 512;

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
  setVolume,
  setDataArray,
  lastClapTime,
  setLastClapTime,
  soundCache: soundsCache,
  setSoundCache,
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

      soundsCache.push(volume);
      soundsCache.shift();
      setSoundCache(soundsCache);

      const soundDifference = new Array(soundsCache.length);
      const averageSound =
        soundsCache.reduce(function (a, b) {
          return a + b;
        }, 0) / soundsCache.length;

      for (let i = 0; i < soundsCache.length; i++) {
        soundDifference[i] = soundsCache[i] - averageSound;
      }

      const CLAP_COOLDOWN_MS = 500;

      if (
        Date.now() - lastClapTime > CLAP_COOLDOWN_MS &&
        Math.round(soundDifference[0] * 100) <= -4 &&
        Math.round(soundDifference[1] * 100) >= 6 &&
        Math.round(soundDifference[9] * 100) <= -2
      ) {
        console.log("Хлопок обнаружен! 👏");
        lastClapTime = Date.now();
        setLastClapTime(lastClapTime);
      }

      setVolume(volume);
      setDataArray(dataArray);
    }

    const stopUpdateVolume = setInterval(updateVolume, 100);
    setStopUpdateVolume(stopUpdateVolume);

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
      console.log(`stopUpdateVolume ${stopUpdateVolume}`);
      clearInterval(stopUpdateVolume);
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

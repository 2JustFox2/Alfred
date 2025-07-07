async function initMicrophone({
  stream,
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

    audioContext.current = new AudioContext();
    const source = audioContext.current.createMediaStreamSource(stream.current);
    const analyser = audioContext.current.createAnalyser();
    analyser.fftSize = 512;

    source.connect(analyser);
    analyser.connect(audioContext.current.destination);
    const dataArray = new Float32Array(analyser.fftSize);
    analyser.getFloatFrequencyData(dataArray);

    return analyser;
  } catch (error) {
    console.error("Error initializing microphone:", error);
    cleanup({ stream, isRecording, setIsRecording });
    throw error;
  }
}

async function startClapDetector({
  stream,
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
  } catch (error) {
    console.error("Failed to start listening:", error);
    cleanup({ stream, isRecording, setIsRecording });
  }
}

async function stopClapDetector({
  stream,
  isRecording,
  setIsRecording,
  stopUpdateVolume,
  setStopUpdateVolume,
}) {
  if (!isRecording) return;

  try {
    if (stopUpdateVolume) {
      clearInterval(stopUpdateVolume);
      setStopUpdateVolume(null);
    }

    stream.current.getTracks().forEach((track) => track.stop());
  } catch (error) {
    console.error("Failed to stop listening:", error);
  } finally {
    cleanup({ stream, isRecording, setIsRecording });
  }
}

function cleanup({ stream, isRecording, setIsRecording }) {
  if (isRecording) setIsRecording(false);

  if (stream.current) {
    stream.current.getTracks().forEach((track) => track.stop());
  }

  stream.current = null;

  console.log("Cleanup complete");
}

export { startClapDetector, stopClapDetector };

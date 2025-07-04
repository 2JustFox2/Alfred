
function handleDataAvailable(event: BlobEvent) {
  console.log('Data available', event);
  return event;
}

function handleError(this: MediaRecorder, error: ErrorEvent) {
  console.error("MediaRecorder error:", error);
  return error;
}

async function initMicrophone({stream, mediaRecorder, isRecording, setIsRecording}) {
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

    mediaRecorder.current.onstop = () => {
      console.log("MediaRecorder stopped");
      cleanup({stream, mediaRecorder, isRecording, setIsRecording});
    };
  } catch (error) {
    console.error("Error initializing microphone:", error);
    cleanup({stream, mediaRecorder, isRecording, setIsRecording});
    throw error;
  }
}

async function startClapDetectorListening({stream, mediaRecorder, isRecording, setIsRecording}) {
  if (isRecording) return;

  try {
    await initMicrophone({stream, mediaRecorder, isRecording, setIsRecording});
    setIsRecording(true);

    if (!mediaRecorder.current) {
      throw new Error("MediaRecorder not initialized");
    }

    mediaRecorder.current.start(100); // Записываем 100мс чанки
    console.log("Recording started", mediaRecorder.current.state);
  } catch (error) {
    console.error("Failed to start listening:", error);
    cleanup({stream, mediaRecorder, isRecording, setIsRecording});
  }
}

async function stopClapDetectorListening({stream, mediaRecorder, isRecording, setIsRecording}) {
  console.log(isRecording);
  if (!isRecording) return;

  try {
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
    cleanup({stream, mediaRecorder, isRecording, setIsRecording});
  }
}

function cleanup({stream, mediaRecorder, isRecording, setIsRecording}) {
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

export {startClapDetectorListening, stopClapDetectorListening};

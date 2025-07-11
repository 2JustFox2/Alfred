class ClapDetector {
  stream: React.RefObject<MediaStream | null>;
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  stopUpdateVolume: number | null;
  setStopUpdateVolume: React.Dispatch<React.SetStateAction<number | null>>;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  setDataArray: React.Dispatch<React.SetStateAction<number[]>>;
  lastClapTime: number;
  setLastClapTime: React.Dispatch<React.SetStateAction<number>>;
  soundCache: number[];
  setSoundCache: React.Dispatch<React.SetStateAction<number[]>>;
  audioContext: React.RefObject<AudioContext | null>;

  constructor({
    stream,
    isRecording,
    setIsRecording,
    stopUpdateVolume,
    setStopUpdateVolume,
    setVolume,
    setDataArray,
    lastClapTime,
    setLastClapTime,
    soundCache,
    setSoundCache,
    audioContext,
  }) {
    this.stream = stream;
    this.isRecording = isRecording;
    this.setIsRecording = setIsRecording;
    this.stopUpdateVolume = stopUpdateVolume;
    this.setStopUpdateVolume = setStopUpdateVolume;
    this.setVolume = setVolume;
    this.setDataArray = setDataArray;
    this.lastClapTime = lastClapTime;
    this.setLastClapTime = setLastClapTime;
    this.soundCache = soundCache;
    this.setSoundCache = setSoundCache;
    this.audioContext = audioContext;
  }

  async initMicrophone() {
    if (this.isRecording) return;

    try {
      this.stream.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      this.audioContext.current = new AudioContext();
      const source = this.audioContext.current.createMediaStreamSource(
        this.stream.current
      );
      const analyser = this.audioContext.current.createAnalyser();
      analyser.fftSize = 512;

      source.connect(analyser);
      // analyser.connect(this.audioContext.current.destination);
      const dataArray = new Float32Array(analyser.fftSize);
      analyser.getFloatFrequencyData(dataArray);

      return analyser;
    } catch (error) {
      console.error("Error initializing microphone:", error);
      this.cleanup();
      throw error;
    }
  }

  async start(handleClap) {
    if (this.isRecording) return;
    this.setIsRecording(true);

    try {
      const analyser = await this.initMicrophone();
      if (!analyser) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const volume = average / 256;

        this.soundCache.push(volume);
        this.soundCache.shift();
        this.setSoundCache([...this.soundCache]);

        const soundDifference = new Array(this.soundCache.length);
        const averageSound =
          this.soundCache.reduce((a, b) => a + b, 0) / this.soundCache.length;

        for (let i = 0; i < this.soundCache.length; i++) {
          soundDifference[i] = this.soundCache[i] - averageSound;
        }

        const CLAP_COOLDOWN_MS = 500;

        if (
          Date.now() - this.lastClapTime > CLAP_COOLDOWN_MS &&
          Math.round(soundDifference[0] * 100) <= -4 &&
          Math.round(soundDifference[1] * 100) >= 6 &&
          Math.round(soundDifference[9] * 100) <= -2
        ) {
          handleClap()
          this.lastClapTime = Date.now();
          this.setLastClapTime(this.lastClapTime);
        }

        this.setVolume(volume);
        this.setDataArray([...dataArray]);
      };

      const stopUpdateVolume = setInterval(updateVolume, 100);
      this.setStopUpdateVolume(stopUpdateVolume);
    } catch (error) {
      console.error("Failed to start listening:", error);
      this.cleanup();
    }
  }

  async stop() {
    if (!this.isRecording) return;

    try {
      if (this.stopUpdateVolume) {
        clearInterval(this.stopUpdateVolume);
        this.setStopUpdateVolume(null);
      }

      if (this.stream.current) {
        this.stream.current.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error("Failed to stop listening:", error);
    } finally {
      this.cleanup();
    }
  }

  cleanup() {
    if (this.isRecording) this.setIsRecording(false);

    if (this.stream.current) {
      this.stream.current.getTracks().forEach((track) => track.stop());
    }

    this.stream.current = null;

    console.log("Cleanup complete");
  }
}

export default ClapDetector;

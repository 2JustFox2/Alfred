import { ClapDetectorConfig } from "../../config/clap-detector.config";

export class ClapDetector {
    private audioContext: AudioContext;
    private analyser: AnalyserNode;
    private microphone: MediaStreamAudioSourceNode;
    private isListening = false;
    private lastClapTime = 0;

    private readonly CLAP_THRESHOLD = ClapDetectorConfig.CLAP_THRESHOLD;
    private readonly CLAP_INTERVAL = ClapDetectorConfig.CLAP_INTERVAL;
    private readonly CLAP_COOLDOWN = ClapDetectorConfig.CLAP_COOLDOWN;
    private readonly FFT_SIZE = ClapDetectorConfig.FFT_SIZE;
    private readonly MIN_CLAP_DURATION = ClapDetectorConfig.MIN_CLAP_DURATION;
    private readonly DEBUG = ClapDetectorConfig.DEBUG;

    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.microphone = this.audioContext.createMediaStreamSource(null as any);
    }

    private async initMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.microphone = this.audioContext.createMediaStreamSource(stream);
        } catch (error) {
            console.error("Error initializing microphone:", error);
        }
    }

    private async startListening() {
        if (!this.isListening) {
            await this.initMicrophone();
            this.microphone.connect(this.analyser);
            this.isListening = true;
        }
    }

    private async stopListening() {
        if (this.isListening) {
            this.microphone.disconnect();
            this.isListening = false;
        }
    }
    
    private async detectClap() {
        if (!this.isListening) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        this.analyser.getByteFrequencyData(dataArray);

        const maxValue = Math.max(...dataArray); // исполнение через максимальное значение
        const isClap = maxValue > this.CLAP_THRESHOLD; // сравнение с порогом

        if (isClap) {
            const currentTime = Date.now();
            const timeSinceLastClap = currentTime - this.lastClapTime;

            if (timeSinceLastClap < this.CLAP_INTERVAL) {
                this.lastClapTime = currentTime;
                return true;
            }
        }

        return false;
    }

}
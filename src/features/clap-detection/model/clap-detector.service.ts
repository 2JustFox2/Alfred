import { ClapDetectorConfig } from "../../../config/clap-detector.config";
// import { IClapDetector } from "./clap-detector.interface";

export class ClapDetector {
    private audioContext: AudioContext;
    private analyser: AnalyserNode;
    private microphone: MediaStreamAudioSourceNode | null;
    private stream: MediaStream | null;
    private lastClapTime = 0;

    private readonly CLAP_THRESHOLD = ClapDetectorConfig.CLAP_THRESHOLD;
    private readonly CLAP_INTERVAL = ClapDetectorConfig.CLAP_INTERVAL;
    private readonly CLAP_COOLDOWN = ClapDetectorConfig.CLAP_COOLDOWN;
    private readonly FFT_SIZE = ClapDetectorConfig.FFT_SIZE;
    private readonly MIN_CLAP_DURATION = ClapDetectorConfig.MIN_CLAP_DURATION;
    private readonly DEBUG = ClapDetectorConfig.DEBUG;

    constructor() {
        this.audioContext = new window.AudioContext();
        this.analyser = this.audioContext.createAnalyser();
    }
    
    private async initMicrophone() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.microphone = this.audioContext.createMediaStreamSource(this.stream);
            this.microphone.connect(this.analyser);
            console.log(this.microphone)
        } catch (error) {
            console.error("Error initializing microphone:", error);
            throw error
        }
    }
    
    private async startListening() {
        try {
            await this.initMicrophone();
        } catch (error) {
            console.error("Failed to start listening:", error);
        }
    }
    
    private async stopListening() {
        if (this.microphone) {
            this.microphone.disconnect(this.analyser);
            this.microphone = null;
        }
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }
    
    private async detectClap() {
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
    
    async start(next: (promt: string) => void): Promise<void> {
        try {
            next('clapDetector')
            console.log('clapDetector')
            await this.startListening()
        } catch(error) {
            console.error(error)
            throw error
        }
    }
    
    async stop() {
        try {
            await this.stopListening()
            return 'stop'
        } catch(error) {
            console.error(error)
            throw error
        }
    }
}
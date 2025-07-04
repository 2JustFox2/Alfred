// import { ClapDetectorConfig } from "../../../config/clap-detector.config";
// import { IClapDetector } from "./clap-detector.interface";

export class ClapDetector {
  stream: MediaStream | null;
  mediaRecorder: MediaRecorder;

  constructor() {
    
  }

  async initMicrophone() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
    } catch (error) {
      console.error("Error initializing microphone:", error);
      throw error;
    }
  }

  async startListening() {
    try {
      await this.initMicrophone();
      this.mediaRecorder.start();
      console.log(this.mediaRecorder)
      this.stopListening();
      console.log(this.mediaRecorder)
      console.log(this.stream)
    } catch (error) {
      console.error("Failed to start listening:", error);
    }
  }

  stopListening() {
    try {
      this.mediaRecorder.stop();
    } catch (error) {
      console.error("Failed to stop listening:", error);
    } finally {
      this.stream = null;
    }
  }
}

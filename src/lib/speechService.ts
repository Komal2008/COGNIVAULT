// Client-side Web Speech API service for Voice Journaling & Gemini Text-to-Speech

export interface SpeechRecognitionCallbacks {
  onTranscriptChange: (finalTranscript: string, interimTranscript: string) => void;
  onError: (error: string) => void;
  onStateChange: (listening: boolean) => void;
}

export class VoiceJournalService {
  private recognition: any = null;
  private isListening = false;
  private callbacks: SpeechRecognitionCallbacks | null = null;
  private currentTranscript = "";

  public isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    );
  }

  public startListening(callbacks: SpeechRecognitionCallbacks): boolean {
    if (!this.isSupported()) {
      callbacks.onError("Speech recognition is not supported in this browser. Please use text input.");
      return false;
    }

    try {
      this.stopListening();
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      this.recognition = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      this.callbacks = callbacks;
      this.currentTranscript = "";

      recognition.onstart = () => {
        if (this.recognition !== recognition) return;
        this.isListening = true;
        this.callbacks?.onStateChange(true);
      };

      recognition.onresult = (event: any) => {
        if (this.recognition !== recognition) return;
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          this.currentTranscript += finalTranscript;
        }

        const fullText = (this.currentTranscript + interimTranscript).trim();
        this.callbacks?.onTranscriptChange(this.currentTranscript.trim(), interimTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        if (this.recognition !== recognition) return;
        let msg = "Microphone error encountered.";
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          msg = "Microphone permission was denied. Please allow microphone access in your browser or type your journal entry.";
        } else if (event.error === "no-speech") {
          msg = "No speech detected. Listening continues...";
        } else if (event.error === "network") {
          msg = "Network issue during speech recognition.";
        }
        this.callbacks?.onError(msg);
      };

      recognition.onend = () => {
        if (this.recognition !== recognition) return;
        this.isListening = false;
        this.recognition = null;
        this.callbacks?.onStateChange(false);
      };

      recognition.start();
      return true;
    } catch (err: any) {
      console.error("SpeechRecognition start error:", err);
      callbacks.onError("Could not start voice recording. Please use text input.");
      return false;
    }
  }

  public stopListening() {
    const recognition = this.recognition;
    this.recognition = null;
    this.callbacks?.onTranscriptChange(this.currentTranscript.trim(), "");
    this.callbacks = null;
    if (recognition) {
      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.stop();
      } catch (_) {
        try {
          recognition.abort();
        } catch {}
      }
    }
    this.isListening = false;
  }

  public resetTranscript() {
    this.currentTranscript = "";
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

// Client-side Text-to-Speech service for reading Gemini reflection responses
export class GeminiVoiceResponseService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private isPaused = false;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return Boolean(this.synth);
  }

  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (!this.synth) return;
    this.stop();

    // Clean markdown symbols for natural speech reading
    const cleanText = text
      .replace(/[*#_`~>]/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .trim();

    if (!cleanText) return;

    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance.rate = 0.95; // slightly slower, calm reflection cadence
    this.currentUtterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Natural") ||
          v.name.includes("Premium") ||
          v.name.includes("Google") ||
          v.name.includes("Samantha"))
    );
    if (naturalVoice) {
      this.currentUtterance.voice = naturalVoice;
    }

    this.currentUtterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      onStart?.();
    };

    this.currentUtterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      onEnd?.();
    };

    this.currentUtterance.onerror = (e) => {
      this.isSpeaking = false;
      this.isPaused = false;
      onError?.(e);
    };

    this.synth.speak(this.currentUtterance);
  }

  public pause() {
    if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  public resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
    }
  }

  public getStatus(): { isSpeaking: boolean; isPaused: boolean } {
    return { isSpeaking: this.isSpeaking, isPaused: this.isPaused };
  }
}

export const voiceJournalService = new VoiceJournalService();
export const geminiVoiceResponse = new GeminiVoiceResponseService();

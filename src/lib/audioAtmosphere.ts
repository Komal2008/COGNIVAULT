import { MoodMeta, MoodType } from "../types";

export const MOODS_CONFIG: Record<MoodType, MoodMeta> = {
  happy: {
    id: "happy",
    label: "Happy",
    emoji: "😊",
    shortDescription: "Bright & energized",
    visualAtmosphere: "Warm ivory + honey glow",
    audioAtmosphere: "Uplifting ambience",
    color: "text-[#6B4938]",
    accentBg: "bg-[#E8B84A]/15",
    borderColor: "border-[#E8B84A]/60",
    soundName: "Sunlit Harmony",
    soundDescription: "Uplifting warm acoustic resonance and sunlit major fifths",
    prompt: "Celebrate your momentum and gratitude today.",
  },
  calm: {
    id: "calm",
    label: "Calm",
    emoji: "😌",
    shortDescription: "Slow & peaceful",
    visualAtmosphere: "Cream + muted sage",
    audioAtmosphere: "Soft relaxing ambience",
    color: "text-[#3B2922]",
    accentBg: "bg-[#A8B29A]/20",
    borderColor: "border-[#A8B29A]/70",
    soundName: "Morning Sage Theta",
    soundDescription: "Soft minimal theta waves and filtered calming air",
    prompt: "Savor this stillness. What feels peaceful in this moment?",
  },
  reflective: {
    id: "reflective",
    label: "Reflective",
    emoji: "😔",
    shortDescription: "Quiet & thoughtful",
    visualAtmosphere: "Cocoa + latte",
    audioAtmosphere: "Gentle reflective ambience",
    color: "text-[#6B4938]",
    accentBg: "bg-[#E8D6C3]/50",
    borderColor: "border-[#6B4938]/30",
    soundName: "Deep Solitude",
    soundDescription: "Deep elegant resonant harmonics and gentle mellow piano tones",
    prompt: "Unpack what feels heavy or complex. You are safe here.",
  },
  stressed: {
    id: "stressed",
    label: "Stressed",
    emoji: "😤",
    shortDescription: "Let's slow things down",
    visualAtmosphere: "Muted cocoa + soft cream",
    audioAtmosphere: "Slow calming ambience",
    color: "text-[#3B2922]",
    accentBg: "bg-[#E8D6C3]/30",
    borderColor: "border-[#6B4938]/40",
    soundName: "Grounding Anchor",
    soundDescription: "Slow soothing de-escalation drone and grounding earth frequencies",
    prompt: "Release the pressure. What can wait until tomorrow?",
  },
  curious: {
    id: "curious",
    label: "Curious",
    emoji: "🤔",
    shortDescription: "Explore the thought",
    visualAtmosphere: "Latte + honey",
    audioAtmosphere: "Subtle futuristic ambience",
    color: "text-[#6B4938]",
    accentBg: "bg-[#E8B84A]/20",
    borderColor: "border-[#E8B84A]/70",
    soundName: "Warm Horizon",
    soundDescription: "Subtle acoustic shimmering pulses and airy morning overtones",
    prompt: "Explore the idea at the edge of your mind. What if?",
  },
  focused: {
    id: "focused",
    label: "Focused",
    emoji: "🎯",
    shortDescription: "Deep attention",
    visualAtmosphere: "Deep cocoa + ivory",
    audioAtmosphere: "Focus ambience",
    color: "text-[#3B2922]",
    accentBg: "bg-[#E8D6C3]/60",
    borderColor: "border-[#3B2922]/50",
    soundName: "Gamma Clarity",
    soundDescription: "Minimal rhythmic gamma focus pulse and warm brown acoustic noise",
    prompt: "Define your singular priority. What needs your direct energy?",
  },
};

// Web Audio API Procedural Synthesizer for 100% royalty-free, offline-safe ambience
class WebAudioAtmosphereEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private activeNodes: Array<{ stop: () => void; disconnect: () => void }> = [];
  private isPlaying = false;
  private currentMood: MoodType = "reflective";
  private volume = 0.4;
  private isMuted = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public play(mood: MoodType) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stopActiveNodes();
    this.currentMood = mood;
    this.isPlaying = true;

    // Apply master volume
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);

    switch (mood) {
      case "happy":
        this.createHappyAmbience();
        break;
      case "calm":
        this.createCalmAmbience();
        break;
      case "reflective":
        this.createReflectiveAmbience();
        break;
      case "stressed":
        this.createStressedAmbience();
        break;
      case "curious":
        this.createCuriousAmbience();
        break;
      case "focused":
        this.createFocusedAmbience();
        break;
    }
  }

  public pause() {
    if (this.ctx && this.ctx.state === "running") {
      this.ctx.suspend();
      this.isPlaying = false;
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
      this.isPlaying = true;
    } else if (!this.isPlaying) {
      this.play(this.currentMood);
    }
  }

  public stop() {
    this.stopActiveNodes();
    this.isPlaying = false;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getFrequencyData(dataArray: Uint8Array): void {
    if (this.analyser && this.isPlaying) {
      this.analyser.getByteFrequencyData(dataArray);
    } else {
      dataArray.fill(0);
    }
  }

  private stopActiveNodes() {
    for (const node of this.activeNodes) {
      try {
        node.stop();
      } catch (_) {}
      try {
        node.disconnect();
      } catch (_) {}
    }
    this.activeNodes = [];
  }

  // Ambience generators
  private createCalmAmbience() {
    if (!this.ctx || !this.masterGain) return;
    const baseFreq = 136.1; // OM frequency

    // Primary soothing drone
    const osc1 = this.ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    const gain1 = this.ctx.createGain();
    gain1.gain.setValueAtTime(0.12, this.ctx.currentTime);

    // Subtle binaural theta offset (+6 Hz)
    const osc2 = this.ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(baseFreq + 6, this.ctx.currentTime);

    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0.08, this.ctx.currentTime);

    // Filtered pink noise for ocean breath
    const noise = this.createPinkNoiseNode();
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    osc1.connect(gain1).connect(this.masterGain);
    osc2.connect(gain2).connect(this.masterGain);
    noise.connect(filter).connect(noiseGain).connect(this.masterGain);

    osc1.start();
    osc2.start();

    this.activeNodes.push(osc1, osc2, noise);
  }

  private createReflectiveAmbience() {
    if (!this.ctx || !this.masterGain) return;
    // Deep piano-like mellow resonance (A2 = 110Hz, E3 = 164.8Hz, C#4 = 277.2Hz)
    const freqs = [110, 164.81, 220, 277.18];

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.06 / (idx + 1), this.ctx.currentTime);

      // Gentle LFO tremolo
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.15 + idx * 0.05, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      lfo.connect(lfoGain).connect(gain.gain);
      lfo.start();

      osc.connect(gain).connect(this.masterGain);
      osc.start();
      this.activeNodes.push(osc, lfo);
    });
  }

  private createHappyAmbience() {
    if (!this.ctx || !this.masterGain) return;
    // Uplifting warm major pentatonic chords (D major: D3, F#3, A3, D4)
    const freqs = [146.83, 185.0, 220.0, 293.66];

    freqs.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.07, this.ctx.currentTime);

      // Subtle vibrato
      const vibrato = this.ctx.createOscillator();
      vibrato.frequency.setValueAtTime(4 + i, this.ctx.currentTime);
      const vibratoGain = this.ctx.createGain();
      vibratoGain.gain.setValueAtTime(1.5, this.ctx.currentTime);
      vibrato.connect(vibratoGain).connect(osc.frequency);
      vibrato.start();

      osc.connect(gain).connect(this.masterGain);
      osc.start();
      this.activeNodes.push(osc, vibrato);
    });
  }

  private createStressedAmbience() {
    if (!this.ctx || !this.masterGain) return;
    // Slow grounding low drone (72Hz & 108Hz) with soft low-pass filter
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(72, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.14, this.ctx.currentTime);

    osc.connect(filter).connect(gain).connect(this.masterGain);
    osc.start();
    this.activeNodes.push(osc);
  }

  private createCuriousAmbience() {
    if (!this.ctx || !this.masterGain) return;
    // Shimmering airy fifths with subtle bandpass motion
    const freqs = [174.61, 261.63, 392.0];
    freqs.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(freq * 1.5, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);

      osc.connect(filter).connect(gain).connect(this.masterGain);
      osc.start();
      this.activeNodes.push(osc);
    });
  }

  private createFocusedAmbience() {
    if (!this.ctx || !this.masterGain) return;
    // Minimal gamma wave entrainment (40Hz) + warm filtered noise
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);

    // 40Hz amplitude modulation (Gamma wave for active focus)
    const amOsc = this.ctx.createOscillator();
    amOsc.frequency.setValueAtTime(40, this.ctx.currentTime);
    const amGain = this.ctx.createGain();
    amGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    amOsc.connect(amGain);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    amGain.connect(oscGain.gain);

    osc.connect(oscGain).connect(this.masterGain);
    osc.start();
    amOsc.start();
    this.activeNodes.push(osc, amOsc);
  }

  private createPinkNoiseNode(): AudioBufferSourceNode {
    const bufferSize = 2 * (this.ctx?.sampleRate || 44100);
    const noiseBuffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx!.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.start();
    return whiteNoise;
  }
}

export const atmosphereEngine = new WebAudioAtmosphereEngine();

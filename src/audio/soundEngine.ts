/**
 * Procedural Web Audio API sound synthesizer
 * Zero 404 external dependencies. Generates authentic physics, biomedical, and electrical audio.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private turbineOsc: OscillatorNode | null = null;
  private turbineGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.turbineGain && this.ctx) {
      this.turbineGain.gain.setValueAtTime(muted ? 0 : 0.05, this.ctx.currentTime);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public playBounce(velocity: number = 3.0, pitchMod: number = 1.0) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const intensity = Math.min(1.0, Math.max(0.1, velocity / 6.0));
      const baseFreq = (110 + Math.random() * 20) * pitchMod;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * 1.5, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.12);

      gain.gain.setValueAtTime(0.3 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // AudioContext safe fail
    }
  }

  public playHeartbeat() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // First beat: "Lub"
      this.createThump(now, 55, 0.12, 0.35);
      // Second beat: "Dub" slightly higher & crisper 140ms later
      this.createThump(now + 0.15, 75, 0.09, 0.28);
    } catch {
      // AudioContext safe fail
    }
  }

  private createThump(time: number, freq: number, duration: number, volume: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.3, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, time + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  public playSwitch(isOn: boolean) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isOn ? 1200 : 700, now);
      osc.frequency.exponentialRampToValueAtTime(isOn ? 1800 : 400, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  public playAvatarChime() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freqs = [587.33, 880, 1174.66]; // D5, A5, D6 harmonic chime

      freqs.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.05);

        gain.gain.setValueAtTime(0.001, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.4);
      });
    } catch {}
  }

  public startTurbineLoop(rpmRatio: number = 0.5) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      if (!this.turbineOsc) {
        this.turbineOsc = this.ctx.createOscillator();
        this.turbineGain = this.ctx.createGain();

        this.turbineOsc.type = 'sawtooth';
        this.turbineOsc.frequency.setValueAtTime(80 + rpmRatio * 400, this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(320, this.ctx.currentTime);
        filter.Q.setValueAtTime(3, this.ctx.currentTime);

        this.turbineGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

        this.turbineOsc.connect(filter);
        filter.connect(this.turbineGain);
        this.turbineGain.connect(this.ctx.destination);

        this.turbineOsc.start();
      } else {
        const targetFreq = 80 + rpmRatio * 450;
        this.turbineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
      }
    } catch {}
  }

  public stopTurbineLoop() {
    if (this.turbineGain && this.ctx) {
      this.turbineGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.2);
      setTimeout(() => {
        if (this.turbineOsc) {
          try {
            this.turbineOsc.stop();
            this.turbineOsc.disconnect();
          } catch {}
          this.turbineOsc = null;
          this.turbineGain = null;
        }
      }, 300);
    }
  }
}

export const soundEngine = new SoundEngine();

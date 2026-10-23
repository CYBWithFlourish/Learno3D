/**
 * Procedural Web Audio API sound synthesizer with 3D Spatial Audio (HRTF Positional Sound)
 * Zero 404 external dependencies. Generates authentic physics, biomedical, and electrical audio
 * with real-time positional distance attenuation and stereo binaural panning.
 */

export interface Vector3Like {
  x: number;
  y: number;
  z: number;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // Turbofan continuous audio
  private turbineOsc: OscillatorNode | null = null;
  private turbineGain: GainNode | null = null;
  private turbinePanner: PannerNode | null = null;

  // Avatar voice spatial node
  private avatarVoicePanner: PannerNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAudioContext(): AudioContext | null {
    this.initCtx();
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 1.0, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  /**
   * Update 3D listener position and orientation from the active camera / VR HMD
   */
  public updateListener(position: Vector3Like, forward: Vector3Like, up: Vector3Like) {
    if (!this.ctx) return;
    try {
      const l = this.ctx.listener;
      const now = this.ctx.currentTime;

      if (l.positionX) {
        l.positionX.setTargetAtTime(position.x, now, 0.02);
        l.positionY.setTargetAtTime(position.y, now, 0.02);
        l.positionZ.setTargetAtTime(position.z, now, 0.02);

        l.forwardX.setTargetAtTime(forward.x, now, 0.02);
        l.forwardY.setTargetAtTime(forward.y, now, 0.02);
        l.forwardZ.setTargetAtTime(forward.z, now, 0.02);

        l.upX.setTargetAtTime(up.x, now, 0.02);
        l.upY.setTargetAtTime(up.y, now, 0.02);
        l.upZ.setTargetAtTime(up.z, now, 0.02);
      } else if ((l as any).setPosition) {
        (l as any).setPosition(position.x, position.y, position.z);
        (l as any).setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
      }
    } catch {
      // AudioListener fallback
    }
  }

  /**
   * Create HRTF 3D PannerNode positioned at the 3D source coordinates
   */
  private createPanner(pos?: Vector3Like, refDist = 1.5, maxDist = 28, rolloff = 1.3): PannerNode | null {
    if (!this.ctx || !this.masterGain) return null;
    try {
      const panner = this.ctx.createPanner();
      panner.panningModel = 'HRTF'; // Realistic binaural 3D panning
      panner.distanceModel = 'inverse';
      panner.refDistance = refDist;
      panner.maxDistance = maxDist;
      panner.rolloffFactor = rolloff;
      panner.coneInnerAngle = 360;

      if (pos) {
        const now = this.ctx.currentTime;
        if (panner.positionX) {
          panner.positionX.setValueAtTime(pos.x, now);
          panner.positionY.setValueAtTime(pos.y, now);
          panner.positionZ.setValueAtTime(pos.z, now);
        } else if ((panner as any).setPosition) {
          (panner as any).setPosition(pos.x, pos.y, pos.z);
        }
      }

      panner.connect(this.masterGain);
      return panner;
    } catch {
      return null;
    }
  }

  /**
   * Play 3D positional impact bounce (frequency and volume decay based on velocity & mass)
   */
  public playSpatialBounce(position: Vector3Like, velocity: number = 3.0, pitchMod: number = 1.0) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const panner = this.createPanner(position, 1.2, 25, 1.4);

      const intensity = Math.min(1.0, Math.max(0.12, velocity / 6.0));
      const baseFreq = (110 + Math.random() * 20) * pitchMod;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * 1.5, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.12);

      gain.gain.setValueAtTime(0.35 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      if (panner) {
        gain.connect(panner);
      } else {
        gain.connect(this.masterGain);
      }

      osc.start(now);
      osc.stop(now + 0.16);

      setTimeout(() => {
        if (panner) panner.disconnect();
      }, 250);
    } catch {}
  }

  /**
   * Backward-compatible bounce without coordinates
   */
  public playBounce(velocity: number = 3.0, pitchMod: number = 1.0) {
    this.playSpatialBounce({ x: 0, y: 0.32, z: 0 }, velocity, pitchMod);
  }

  /**
   * Play 3D positional heartbeat (Systolic & Diastolic lub-dub)
   */
  public playSpatialHeartbeat(position: Vector3Like = { x: 0, y: 1.4, z: 0 }) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const panner = this.createPanner(position, 1.8, 20, 1.2);

      // First beat: "Lub"
      this.createSpatialThump(now, 55, 0.12, 0.38, panner);
      // Second beat: "Dub" slightly higher & crisper 150ms later
      this.createSpatialThump(now + 0.15, 75, 0.09, 0.30, panner);

      setTimeout(() => {
        if (panner) panner.disconnect();
      }, 400);
    } catch {}
  }

  public playHeartbeat() {
    this.playSpatialHeartbeat({ x: 0, y: 1.4, z: 0 });
  }

  private createSpatialThump(time: number, freq: number, duration: number, volume: number, panner: PannerNode | null) {
    if (!this.ctx || !this.masterGain) return;
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

    if (panner) {
      gain.connect(panner);
    } else {
      gain.connect(this.masterGain);
    }

    osc.start(time);
    osc.stop(time + duration);
  }

  /**
   * Play 3D positional knife switch toggle click
   */
  public playSpatialSwitch(position: Vector3Like, isOn: boolean) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const panner = this.createPanner(position, 1.0, 18, 1.5);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isOn ? 1300 : 700, now);
      osc.frequency.exponentialRampToValueAtTime(isOn ? 1900 : 400, now + 0.04);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      if (panner) {
        gain.connect(panner);
      } else {
        gain.connect(this.masterGain);
      }

      osc.start(now);
      osc.stop(now + 0.05);

      setTimeout(() => {
        if (panner) panner.disconnect();
      }, 150);
    } catch {}
  }

  public playSwitch(isOn: boolean) {
    this.playSpatialSwitch({ x: -0.2, y: 0.4, z: -0.6 }, isOn);
  }

  /**
   * Play 3D positional Avatar prompt chime coming from Dr. Nova's position
   */
  public playSpatialAvatarChime(position: Vector3Like = { x: -2.8, y: 1.4, z: 0.2 }) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const freqs = [587.33, 880, 1174.66]; // D5, A5, D6 harmonic chime
      const panner = this.createPanner(position, 2.0, 25, 1.1);

      freqs.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.05);

        gain.gain.setValueAtTime(0.001, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.35);

        osc.connect(gain);
        if (panner) {
          gain.connect(panner);
        } else {
          gain.connect(this.masterGain!);
        }

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.4);
      });

      setTimeout(() => {
        if (panner) panner.disconnect();
      }, 600);
    } catch {}
  }

  public playAvatarChime() {
    this.playSpatialAvatarChime({ x: -2.8, y: 1.4, z: 0.2 });
  }

  /**
   * Start 3D positional continuous turbofan hum at the engine's 3D coordinates
   */
  public startTurbineLoop(rpmRatio: number = 0.5, position: Vector3Like = { x: 0, y: 1.2, z: 0 }) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      if (!this.turbineOsc) {
        this.turbineOsc = this.ctx.createOscillator();
        this.turbineGain = this.ctx.createGain();
        this.turbinePanner = this.createPanner(position, 1.8, 30, 1.2);

        this.turbineOsc.type = 'sawtooth';
        this.turbineOsc.frequency.setValueAtTime(80 + rpmRatio * 420, this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(320, this.ctx.currentTime);
        filter.Q.setValueAtTime(3, this.ctx.currentTime);

        this.turbineGain.gain.setValueAtTime(0.05, this.ctx.currentTime);

        this.turbineOsc.connect(filter);
        filter.connect(this.turbineGain);

        if (this.turbinePanner) {
          this.turbineGain.connect(this.turbinePanner);
        } else {
          this.turbineGain.connect(this.masterGain);
        }

        this.turbineOsc.start();
      } else {
        const targetFreq = 80 + rpmRatio * 450;
        this.turbineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);

        if (this.turbinePanner && this.turbinePanner.positionX) {
          this.turbinePanner.positionX.setTargetAtTime(position.x, this.ctx.currentTime, 0.05);
          this.turbinePanner.positionY.setTargetAtTime(position.y, this.ctx.currentTime, 0.05);
          this.turbinePanner.positionZ.setTargetAtTime(position.z, this.ctx.currentTime, 0.05);
        }
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
        if (this.turbinePanner) {
          this.turbinePanner.disconnect();
          this.turbinePanner = null;
        }
      }, 300);
    }
  }

  /**
   * Spatial Audio Player for Dr. Nova voice playback (WAV audio buffer)
   */
  public playSpatialVoice(audioBuffer: AudioBuffer, position: Vector3Like = { x: -2.8, y: 1.4, z: 0.2 }): AudioBufferSourceNode | null {
    if (this.isMuted) return null;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return null;

      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;

      const panner = this.createPanner(position, 2.0, 25, 1.2);
      if (panner) {
        source.connect(panner);
      } else {
        source.connect(this.masterGain);
      }

      source.start(this.ctx.currentTime);

      source.onended = () => {
        if (panner) panner.disconnect();
      };

      return source;
    } catch {
      return null;
    }
  }
}

export const soundEngine = new SoundEngine();

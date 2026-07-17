import type { SoundType } from "@/types/game";

/**
 * Procedural Web Audio engine.
 * Every sound effect is synthesized in real time — no audio files are used.
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  public muted = true;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      const AudioCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtor();
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (!this.muted) this.getCtx();
    return this.muted;
  }

  private makeNoise(ctx: AudioContext, dur: number): AudioBufferSourceNode {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    return source;
  }

  play(type: SoundType, speed = 1): void {
    if (this.muted) return;
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    const out = ctx.destination;

    if (type === "hit") {
      const n = this.makeNoise(ctx, 0.07);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 900 + speed * 180 + Math.random() * 400;
      bp.Q.value = 2 + Math.random() * 3;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5 + Math.min(speed / 18, 0.35), t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      n.connect(bp);
      bp.connect(g);
      g.connect(out);
      n.start(t);
      n.stop(t + 0.07);
    }

    if (type === "wall") {
      const n = this.makeNoise(ctx, 0.04);
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1400 + Math.random() * 600;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.28, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      n.connect(hp);
      hp.connect(g);
      g.connect(out);
      n.start(t);
      n.stop(t + 0.04);
    }

    if (type === "goal") {
      const sub = ctx.createOscillator();
      const sg = ctx.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(60, t);
      sub.frequency.exponentialRampToValueAtTime(28, t + 0.25);
      sg.gain.setValueAtTime(0.6, t);
      sg.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      sub.connect(sg);
      sg.connect(out);
      sub.start(t);
      sub.stop(t + 0.3);

      const notes: Array<[number, OscillatorType, number]> = [
        [0, "sawtooth", 233],
        [0.01, "sawtooth", 220],
        [0.02, "sawtooth", 246],
      ];
      notes.forEach(([dt, wv, f]) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = wv;
        o.frequency.value = f;
        g.gain.setValueAtTime(0.15, t + dt);
        g.gain.setValueAtTime(0.15, t + 0.5);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
        o.connect(g);
        g.connect(out);
        o.start(t + dt);
        o.stop(t + 0.71);
      });
    }

    if (type === "victory") {
      const notes: Array<[number, number, number]> = [
        [0, 392, 0.12],
        [0.13, 392, 0.12],
        [0.26, 392, 0.12],
        [0.39, 523, 0.45],
        [0.58, 494, 0.18],
        [0.77, 440, 0.18],
        [0.96, 523, 0.6],
      ];
      notes.forEach(([dt, f, dur]) => {
        [-4, 0, 4].forEach((cents) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sawtooth";
          o.frequency.value = f * Math.pow(2, cents / 1200);
          const lp = ctx.createBiquadFilter();
          lp.type = "lowpass";
          lp.frequency.value = 1800;
          g.gain.setValueAtTime(0, t + dt);
          g.gain.linearRampToValueAtTime(0.08, t + dt + 0.02);
          g.gain.setValueAtTime(0.08, t + dt + dur - 0.03);
          g.gain.exponentialRampToValueAtTime(0.001, t + dt + dur);
          o.connect(lp);
          lp.connect(g);
          g.connect(out);
          o.start(t + dt);
          o.stop(t + dt + dur + 0.01);
        });
      });
    }

    if (type === "speedup") {
      const n = this.makeNoise(ctx, 0.4);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.Q.value = 5;
      bp.frequency.setValueAtTime(300, t);
      bp.frequency.exponentialRampToValueAtTime(3000, t + 0.38);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      n.connect(bp);
      bp.connect(g);
      g.connect(out);
      n.start(t);
      n.stop(t + 0.4);
    }

    if (type === "slomo_in") {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(100, t);
      o.frequency.exponentialRampToValueAtTime(36, t + 0.65);
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      o.connect(g);
      g.connect(out);
      o.start(t);
      o.stop(t + 0.7);
    }
  }
}

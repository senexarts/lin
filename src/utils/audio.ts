// Synthetic + Custom Audio Engine using Web Audio API & HTMLAudioElement for Linmax
import { LinmaxSettings } from '../types';

export const RINGTONE_CATALOG: Array<{
  id: LinmaxSettings['notifications']['callRingtone'];
  label: string;
  vibe: string;
}> = [
  { id: 'Linmax Pulse', label: 'Linmax Pulse', vibe: 'Signature Neon' },
  { id: 'Quantum Ring', label: 'Quantum Ring', vibe: 'Sci-Fi Shimmer' },
  { id: 'Afrobeat Groove', label: 'Afrobeat Groove', vibe: 'Warm Percussive' },
  { id: 'Cyberpunk Synth', label: 'Cyberpunk Synth', vibe: 'Retro Future' },
  { id: 'Marimba Tropics', label: 'Marimba Tropics', vibe: 'Crisp Island' },
  { id: 'Royal Fanfare', label: 'Royal Fanfare', vibe: 'Golden Chord' },
  { id: 'Midnight Lo-Fi', label: 'Midnight Lo-Fi', vibe: 'Chill Velvet' },
  { id: 'Classic', label: 'Classic Ring', vibe: 'Timeless Phone' },
];

export const MESSAGE_TONE_CATALOG: Array<{
  id: LinmaxSettings['notifications']['messageTone'];
  label: string;
}> = [
  { id: 'Cyber Chime', label: 'Cyber Chime (Default)' },
  { id: 'Crystal Ping', label: 'Crystal Ping' },
  { id: 'Aurora Bell', label: 'Aurora Bell' },
  { id: 'Pop Bubble', label: 'Pop Bubble' },
  { id: 'Neon Pluck', label: 'Neon Pluck' },
  { id: 'Silent', label: 'Silent' },
];

class LinmaxAudioEngine {
  private ctx: AudioContext | null = null;
  private ringtoneInterval: number | null = null;
  private customRingAudio: HTMLAudioElement | null = null;
  private enabled = true;
  private messageTone: LinmaxSettings['notifications']['messageTone'] = 'Cyber Chime';
  private customMessageToneUrl?: string;
  private callRingtone: LinmaxSettings['notifications']['callRingtone'] = 'Linmax Pulse';
  private customRingtoneUrl?: string;

  setEnabled(value: boolean) {
    this.enabled = value;
  }

  configure(opts: {
    enabled?: boolean;
    messageTone?: LinmaxSettings['notifications']['messageTone'];
    customMessageToneUrl?: string;
    callRingtone?: LinmaxSettings['notifications']['callRingtone'];
    customRingtoneUrl?: string;
  }) {
    if (typeof opts.enabled === 'boolean') this.enabled = opts.enabled;
    if (opts.messageTone) this.messageTone = opts.messageTone;
    if (opts.customMessageToneUrl !== undefined) this.customMessageToneUrl = opts.customMessageToneUrl;
    if (opts.callRingtone) this.callRingtone = opts.callRingtone;
    if (opts.customRingtoneUrl !== undefined) this.customRingtoneUrl = opts.customRingtoneUrl;
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private playSynthNote(
    freq: number,
    delaySec: number,
    durSec: number,
    type: OscillatorType = 'sine',
    volume = 0.14
  ) {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + delaySec;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0008, start + durSec);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + durSec + 0.02);
  }

  playMessageSent() {
    if (!this.enabled || this.messageTone === 'Silent') return;
    try {
      this.playSynthNote(587.33, 0, 0.1, 'sine', 0.1);
      this.playSynthNote(880, 0.05, 0.12, 'sine', 0.09);
    } catch {
      // ignore if user has not interacted yet
    }
  }

  playMessageReceived(
    overrideTone?: LinmaxSettings['notifications']['messageTone'],
    overrideCustomUrl?: string
  ) {
    if (!this.enabled) return;
    const tone = overrideTone || this.messageTone;
    const customUrl = overrideCustomUrl ?? this.customMessageToneUrl;

    if (tone === 'Silent') return;

    if (tone === 'Custom Tone' && customUrl) {
      try {
        const audio = new Audio(customUrl);
        audio.volume = 0.75;
        audio.play().catch(() => {});
        return;
      } catch {
        // fallback to synth
      }
    }

    try {
      if (tone === 'Crystal Ping') {
        this.playSynthNote(1318.5, 0, 0.18, 'sine', 0.15);
        this.playSynthNote(1760, 0.07, 0.22, 'sine', 0.12);
      } else if (tone === 'Aurora Bell') {
        this.playSynthNote(659.25, 0, 0.2, 'triangle', 0.14);
        this.playSynthNote(987.77, 0.09, 0.25, 'sine', 0.14);
        this.playSynthNote(1318.5, 0.18, 0.3, 'sine', 0.11);
      } else if (tone === 'Pop Bubble') {
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(980, ctx.currentTime + 0.09);
        gain.gain.setValueAtTime(0.16, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.13);
      } else if (tone === 'Neon Pluck') {
        this.playSynthNote(523.25, 0, 0.12, 'sawtooth', 0.08);
        this.playSynthNote(783.99, 0.07, 0.18, 'triangle', 0.12);
      } else {
        // Cyber Chime default
        this.playSynthNote(880, 0, 0.12, 'sine', 0.14);
        this.playSynthNote(1174.66, 0.08, 0.18, 'sine', 0.14);
      }
    } catch {
      // ignore
    }
  }

  private playRingPattern(ringtone: LinmaxSettings['notifications']['callRingtone']) {
    try {
      switch (ringtone) {
        case 'Quantum Ring':
          [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach((f, idx) =>
            this.playSynthNote(f, idx * 0.11, 0.2, 'sine', 0.13)
          );
          break;
        case 'Afrobeat Groove':
          [392, 440, 523.25, 440, 587.33, 523.25, 659.25].forEach((f, idx) =>
            this.playSynthNote(f, idx * 0.14, 0.16, 'triangle', 0.16)
          );
          break;
        case 'Cyberpunk Synth':
          [220, 329.63, 440, 659.25, 587.33, 440].forEach((f, idx) =>
            this.playSynthNote(f, idx * 0.13, 0.22, 'sawtooth', 0.08)
          );
          break;
        case 'Marimba Tropics':
          [659.25, 783.99, 987.77, 1318.51, 987.77, 1174.66].forEach((f, idx) =>
            this.playSynthNote(f, idx * 0.12, 0.18, 'sine', 0.16)
          );
          break;
        case 'Royal Fanfare':
          this.playSynthNote(523.25, 0, 0.18, 'triangle', 0.15);
          this.playSynthNote(659.25, 0.16, 0.18, 'triangle', 0.15);
          this.playSynthNote(783.99, 0.32, 0.2, 'triangle', 0.16);
          this.playSynthNote(1046.5, 0.48, 0.45, 'sine', 0.18);
          break;
        case 'Midnight Lo-Fi':
          this.playSynthNote(349.23, 0, 0.35, 'sine', 0.12);
          this.playSynthNote(440, 0.2, 0.35, 'sine', 0.11);
          this.playSynthNote(523.25, 0.4, 0.45, 'sine', 0.12);
          break;
        case 'Classic':
          this.playSynthNote(440, 0, 0.9, 'sine', 0.1);
          this.playSynthNote(480, 0, 0.9, 'sine', 0.1);
          break;
        case 'Linmax Pulse':
        default:
          this.playSynthNote(587.33, 0, 0.16, 'sine', 0.14);
          this.playSynthNote(783.99, 0.15, 0.16, 'sine', 0.14);
          this.playSynthNote(1174.66, 0.3, 0.28, 'sine', 0.16);
          this.playSynthNote(987.77, 0.55, 0.32, 'triangle', 0.12);
          break;
      }
    } catch {
      // ignore
    }
  }

  startRinging(
    overrideRingtone?: LinmaxSettings['notifications']['callRingtone'],
    overrideCustomUrl?: string
  ) {
    this.stopRinging();
    const ringtone = overrideRingtone || this.callRingtone;
    const customUrl = overrideCustomUrl ?? this.customRingtoneUrl;

    if (ringtone === 'Custom Ringtone' && customUrl) {
      try {
        const audio = new Audio(customUrl);
        audio.loop = true;
        audio.volume = 0.8;
        audio.play().catch(() => {
          this.playRingPattern('Linmax Pulse');
        });
        this.customRingAudio = audio;
        return;
      } catch {
        // fallback below
      }
    }

    this.playRingPattern(ringtone);
    this.ringtoneInterval = window.setInterval(() => {
      this.playRingPattern(ringtone);
    }, 2200);
  }

  previewRingtone(
    ringtone: LinmaxSettings['notifications']['callRingtone'],
    customUrl?: string
  ) {
    this.stopRinging();
    if (ringtone === 'Custom Ringtone' && customUrl) {
      try {
        const audio = new Audio(customUrl);
        audio.volume = 0.8;
        audio.play().catch(() => {});
        this.customRingAudio = audio;
        window.setTimeout(() => this.stopRinging(), 4500);
        return;
      } catch {
        // fallback
      }
    }
    this.playRingPattern(ringtone);
  }

  stopRinging() {
    if (this.ringtoneInterval !== null) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
    if (this.customRingAudio) {
      try {
        this.customRingAudio.pause();
        this.customRingAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.customRingAudio = null;
    }
  }

  playCallEnd() {
    this.stopRinging();
    try {
      this.playSynthNote(440, 0, 0.12, 'triangle', 0.1);
      this.playSynthNote(330, 0.1, 0.22, 'triangle', 0.09);
    } catch {
      // ignore
    }
  }
}

export const soundEngine = new LinmaxAudioEngine();

let cachedSampleVoiceUrl: string | null = null;

/**
 * Generates a real playable 16-bit PCM WAV Data URL (gentle warm chord arpeggio)
 * so pre-seeded sample voice notes without a recorded blob still play real audio
 * through HTMLAudioElement with accurate duration and scrubbing.
 */
export function generateSampleVoiceBriefingWavUrl(): string {
  if (cachedSampleVoiceUrl) return cachedSampleVoiceUrl;

  const sampleRate = 16000;
  const durationSec = 4.2;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  const notes = [261.63, 329.63, 392.0, 523.25, 392.0, 440.0, 523.25];
  const noteLen = numSamples / notes.length;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const noteIdx = Math.min(notes.length - 1, Math.floor(i / noteLen));
    const localPos = (i - noteIdx * noteLen) / noteLen;
    const envelope = Math.sin(Math.PI * Math.min(1, localPos));
    const freq = notes[noteIdx];
    const sample =
      (Math.sin(2 * Math.PI * freq * t) * 0.65 +
        Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.25) *
      envelope *
      0.28;
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, Math.round(clamped * 32767), true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  cachedSampleVoiceUrl = `data:audio/wav;base64,${btoa(binary)}`;
  return cachedSampleVoiceUrl;
}


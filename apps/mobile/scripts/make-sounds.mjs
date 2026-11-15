// Synthesises the four life UI sounds (DESIGN.md §9) as 44.1kHz mono 16-bit WAVs.
// Run: node scripts/make-sounds.mjs   (writes to assets/sounds/)
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100;
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');
mkdirSync(outDir, { recursive: true });

function buffer(seconds) {
  return new Float32Array(Math.ceil(seconds * SR));
}

/** Adds one partial with a 5ms attack and exponential decay. */
function partial(buf, { f, start = 0, dur, vol, wave = 'sine', attack = 0.005 }) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(dur * SR);
  const k = Math.log(1000) / dur; // decays to -60dB by the end
  for (let i = 0; i < n && s0 + i < buf.length; i++) {
    const t = i / SR;
    const env = (t < attack ? t / attack : 1) * Math.exp(-k * t);
    const ph = 2 * Math.PI * f * t;
    let v = Math.sin(ph);
    if (wave === 'triangle') v = (2 / Math.PI) * Math.asin(Math.sin(ph));
    buf[s0 + i] += v * env * vol;
  }
}

/** Soft marimba: fundamental, a quick 4th-harmonic "knock", and a little octave. */
function marimba(buf, f, start, vol) {
  partial(buf, { f, start, dur: 0.45, vol });
  partial(buf, { f: f * 4, start, dur: 0.07, vol: vol * 0.22 });
  partial(buf, { f: f * 2, start, dur: 0.18, vol: vol * 0.12, wave: 'triangle' });
}

/** Normalises to a -14 dBFS peak and writes a WAV. */
function write(name, buf) {
  let peak = 0;
  for (const v of buf) peak = Math.max(peak, Math.abs(v));
  const target = Math.pow(10, -14 / 20);
  const gain = peak > 0 ? target / peak : 1;
  const data = Buffer.alloc(buf.length * 2);
  for (let i = 0; i < buf.length; i++) {
    const v = Math.max(-1, Math.min(1, buf[i] * gain));
    data.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  writeFileSync(join(outDir, `${name}.wav`), Buffer.concat([h, data]));
  console.log(`wrote ${name}.wav (${(buf.length / SR).toFixed(2)}s)`);
}

// tap: ≤60ms soft felt "tock"
{
  const b = buffer(0.06);
  partial(b, { f: 190, dur: 0.06, vol: 1, wave: 'triangle', attack: 0.002 });
  partial(b, { f: 95, dur: 0.05, vol: 0.5, attack: 0.002 });
  write('tap', b);
}

// complete: two notes rising a fifth (C5 → G5)
{
  const b = buffer(0.5);
  marimba(b, 523.25, 0, 1);
  marimba(b, 783.99, 0.11, 0.9);
  write('complete', b);
}

// cleared: three-note arpeggio (C5 E5 G5) with a glass shimmer
{
  const b = buffer(0.9);
  marimba(b, 523.25, 0, 0.9);
  marimba(b, 659.25, 0.09, 0.85);
  marimba(b, 783.99, 0.18, 0.85);
  partial(b, { f: 2093, start: 0.26, dur: 0.6, vol: 0.12, attack: 0.02 });
  partial(b, { f: 3136, start: 0.3, dur: 0.5, vol: 0.07, attack: 0.02 });
  write('cleared', b);
}

// brief: airy pad swell (C4 G4 E5), slow attack, quiet
{
  const b = buffer(1.5);
  const notes = [261.63, 392.0, 659.25];
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const env = t < 0.5 ? t / 0.5 : Math.exp(-(t - 0.5) * 4.6);
    let v = 0;
    notes.forEach((f, j) => {
      v += Math.sin(2 * Math.PI * f * t + j) * (0.5 - j * 0.1) * (1 + 0.04 * Math.sin(2 * Math.PI * 0.8 * t));
    });
    b[i] = v * env;
  }
  write('brief', b);
}

// file: ≤120ms, two soft high sine blips (DESIGN.md §23), quieter than the rest
{
  const b = buffer(0.17);
  partial(b, { f: 880, dur: 0.09, vol: 1 });
  partial(b, { f: 1320, start: 0.05, dur: 0.12, vol: 0.8 });
  write('file', b);
}

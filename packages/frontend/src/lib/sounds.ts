// Web Audio API sound effects for poker game — no external files needed

let audioCtx: AudioContext | null = null;
let _enabled = true;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  return _enabled;
}

export function setSoundEnabled(on: boolean): void {
  _enabled = on;
}

export function toggleSound(): boolean {
  _enabled = !_enabled;
  return _enabled;
}

// --- Sound generators ---

/** Short percussive click — for check, generic tap */
function playClick(freq = 800, duration = 0.04) {
  if (!_enabled) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

/** Chip stack sound — layered clicks for call/raise/bet */
function playChips() {
  if (!_enabled) return;
  const ctx = getCtx();
  // Layer 3 quick clicks with slight delay for "chip stack" effect
  for (let i = 0; i < 3; i++) {
    const t = ctx.currentTime + i * 0.035;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1200 + Math.random() * 400;
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }
}

/** Card deal whoosh — filtered noise burst */
function playCardDeal() {
  if (!_enabled) return;
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 3000;
  filter.Q.value = 1.5;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
}

/** Fold swoosh — descending noise */
function playFold() {
  if (!_enabled) return;
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.5;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(4000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
}

/** All-in dramatic tone — rising chord */
function playAllIn() {
  if (!_enabled) return;
  const ctx = getCtx();
  const freqs = [400, 500, 600];
  for (const freq of freqs) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  }
}

/** Win fanfare — ascending arpeggio */
function playWin() {
  if (!_enabled) return;
  const ctx = getCtx();
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  for (let i = 0; i < notes.length; i++) {
    const t = ctx.currentTime + i * 0.1;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = notes[i];
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }
}

/** Lose sound — descending minor */
function playLose() {
  if (!_enabled) return;
  const ctx = getCtx();
  const notes = [440, 370, 330]; // A4, F#4, E4
  for (let i = 0; i < notes.length; i++) {
    const t = ctx.currentTime + i * 0.15;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = notes[i];
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }
}

/** New street — soft chime */
function playNewStreet() {
  if (!_enabled) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

// --- Public API matching game actions ---

export const sounds = {
  deal: playCardDeal,
  check: () => playClick(900, 0.04),
  call: playChips,
  raise: playChips,
  fold: playFold,
  allIn: playAllIn,
  win: playWin,
  lose: playLose,
  newStreet: playNewStreet,
  blind: () => playClick(600, 0.03),
};

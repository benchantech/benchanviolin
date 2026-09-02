import { PitchDetector } from "pitchy";

export type PitchEstimate = {
  frequency: number;
  clarity: number;
  rms: number;
};

export type PitchSummary = {
  frequency: number;
  note: string;
  noteName: string;
  octave: number;
  midi: number;
  targetFrequency: number;
  cents: number;
  clarity: number;
  spreadCents: number;
  acceptedFrames: number;
  totalFrames: number;
};

const NOTE_NAMES = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];

const detectorCache = new Map<number, PitchDetector<Float32Array>>();

/** McLeod Pitch Method detection for one mono PCM frame. */
export function detectPitch(
  samples: Float32Array,
  sampleRate: number,
  minFrequency = 65,
  maxFrequency = 1200,
): PitchEstimate | null {
  if (samples.length < 1024 || sampleRate <= 0) return null;

  let mean = 0;
  for (let i = 0; i < samples.length; i += 1) mean += samples[i];
  mean /= samples.length;

  let energy = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const centered = samples[i] - mean;
    energy += centered * centered;
  }
  const rms = Math.sqrt(energy / samples.length);
  if (rms < 0.002) return null;

  let detector = detectorCache.get(samples.length);
  if (!detector) {
    detector = PitchDetector.forFloat32Array(samples.length);
    detector.clarityThreshold = 0.84;
    detector.minVolumeAbsolute = 0.002;
    detectorCache.set(samples.length, detector);
  }

  const centered = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) centered[i] = samples[i] - mean;
  const [frequency, clarity] = detector.findPitch(centered, sampleRate);
  if (!Number.isFinite(frequency) || frequency < minFrequency || frequency > maxFrequency) return null;
  return { frequency, clarity, rms };
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

export function frequencyToNote(frequency: number) {
  const midiFloat = 69 + 12 * Math.log2(frequency / 440);
  const midi = Math.round(midiFloat);
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const targetFrequency = 440 * 2 ** ((midi - 69) / 12);
  const cents = 1200 * Math.log2(frequency / targetFrequency);
  return { midi, noteName: NOTE_NAMES[noteIndex], octave, note: `${NOTE_NAMES[noteIndex]}${octave}`, targetFrequency, cents };
}

/** Aggregate on a logarithmic scale and reject an unstable series. */
export function summarizePitches(
  estimates: PitchEstimate[],
  totalFrames = estimates.length,
): PitchSummary | null {
  const reliable = estimates.filter((estimate) => estimate.clarity >= 0.58 && estimate.rms >= 0.002);
  if (reliable.length < 4) return null;

  const midiValues = reliable.map((estimate) => 69 + 12 * Math.log2(estimate.frequency / 440));
  const noteCounts = new Map<number, number>();
  for (const value of midiValues) {
    const note = Math.round(value);
    noteCounts.set(note, (noteCounts.get(note) ?? 0) + 1);
  }
  const dominantNote = [...noteCounts].sort((a, b) => b[1] - a[1])[0];
  if (!dominantNote || dominantNote[1] < 4 || dominantNote[1] / reliable.length < 0.35) return null;

  const inliers = reliable.filter((estimate) => {
    const midi = 69 + 12 * Math.log2(estimate.frequency / 440);
    return Math.abs(midi - dominantNote[0]) <= 0.7;
  });
  if (inliers.length < 4 || inliers.length / reliable.length < 0.35) return null;

  const inlierMidi = inliers.map((estimate) => 69 + 12 * Math.log2(estimate.frequency / 440));
  const centerMidi = median(inlierMidi);
  const spreadCents = median(inlierMidi.map((value) => Math.abs(value - centerMidi) * 100));
  if (spreadCents > 38) return null;

  const stableMidi = centerMidi;
  const frequency = 440 * 2 ** ((stableMidi - 69) / 12);
  const note = frequencyToNote(frequency);
  return {
    frequency,
    ...note,
    cents: Math.max(-50, Math.min(50, note.cents)),
    clarity: median(inliers.map((estimate) => estimate.clarity)),
    spreadCents,
    acceptedFrames: inliers.length,
    totalFrames,
  };
}

/**
 * Find the strongest short, contiguous region of stable pitch. This keeps a
 * clean sustain from being invalidated by vocal onset, release, or a breath.
 */
export function summarizePitchFrames(
  frames: Array<PitchEstimate | null>,
): PitchSummary | null {
  if (frames.length < 4) return null;

  const windowSizes = [5, 7, 9, 12, 16, frames.length]
    .filter((size, index, values) => size <= frames.length && values.indexOf(size) === index);
  let best: PitchSummary | null = null;
  let bestScore = -Infinity;

  for (const size of windowSizes) {
    for (let start = 0; start + size <= frames.length; start += 1) {
      const estimates = frames
        .slice(start, start + size)
        .filter((estimate): estimate is PitchEstimate => estimate !== null);
      const candidate = summarizePitches(estimates, frames.length);
      if (!candidate) continue;
      if (candidate.acceptedFrames / size < 0.5) continue;

      const score = candidate.acceptedFrames * 100
        + candidate.clarity * 20
        - candidate.spreadCents;
      if (score > bestScore) {
        best = candidate;
        bestScore = score;
      }
    }
  }

  return best;
}

export type PitchSequenceEvent = PitchSummary & { lockedAt: number };

export type PitchSequenceUpdate = {
  active: PitchSummary | null;
  isChanging: boolean;
  locked: PitchSequenceEvent | null;
};

/** Stateful monophonic note segmentation with pitch and silence hysteresis. */
export class PitchSequenceTracker {
  private candidateFrames: Array<PitchEstimate | null> = [];
  private active: PitchSummary | null = null;
  private silenceFrames = 0;
  private divergentFrames = 0;

  reset() {
    this.candidateFrames = [];
    this.active = null;
    this.silenceFrames = 0;
    this.divergentFrames = 0;
  }

  addFrame(
    estimate: PitchEstimate | null,
    rms: number,
    elapsedSeconds: number,
  ): PitchSequenceUpdate {
    if (!this.active) {
      this.pushCandidate(estimate);
      const candidate = summarizePitchFrames(this.candidateFrames);
      if (candidate) return this.lock(candidate, elapsedSeconds);
      return { active: null, isChanging: false, locked: null };
    }

    if (rms < 0.0025) {
      this.silenceFrames += 1;
      if (this.silenceFrames >= 2) {
        this.active = null;
        this.candidateFrames = [];
        this.divergentFrames = 0;
      }
      return { active: this.active, isChanging: false, locked: null };
    }

    this.silenceFrames = 0;
    if (!estimate || estimate.clarity < 0.58) {
      return { active: this.active, isChanging: false, locked: null };
    }

    const estimateMidi = 69 + 12 * Math.log2(estimate.frequency / 440);
    const distanceFromLock = Math.abs(estimateMidi - this.active.midi) * 100;
    if (distanceFromLock <= 65) {
      this.divergentFrames = 0;
      this.candidateFrames = [];
      return { active: this.active, isChanging: false, locked: null };
    }

    this.divergentFrames += 1;
    this.pushCandidate(estimate);
    const next = summarizePitchFrames(this.candidateFrames);
    if (next && Math.abs(next.midi - this.active.midi) >= 1) {
      return this.lock(next, elapsedSeconds);
    }
    return {
      active: this.active,
      isChanging: this.divergentFrames >= 2,
      locked: null,
    };
  }

  private pushCandidate(estimate: PitchEstimate | null) {
    this.candidateFrames.push(estimate);
    this.candidateFrames = this.candidateFrames.slice(-7);
  }

  private lock(result: PitchSummary, elapsedSeconds: number): PitchSequenceUpdate {
    const locked: PitchSequenceEvent = {
      ...result,
      lockedAt: Math.max(0, elapsedSeconds),
    };
    this.active = result;
    this.candidateFrames = [];
    this.silenceFrames = 0;
    this.divergentFrames = 0;
    return { active: result, isChanging: false, locked };
  }
}

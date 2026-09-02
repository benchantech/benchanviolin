export type BeatUnit = "eighth" | "quarter" | "dotted-quarter" | "half";

export type DurationOption = {
  label: string;
  ratio: number;
  symbol: string;
};

export type QuantizedRhythm = DurationOption & {
  confidence: number;
  rawSeconds: number;
  relativeError: number;
};

export const BEAT_UNIT_QUARTERS: Record<BeatUnit, number> = {
  eighth: 0.5,
  quarter: 1,
  "dotted-quarter": 1.5,
  half: 2,
};

export const DURATION_OPTIONS: DurationOption[] = [
  { label: "Sixteenth", ratio: 0.25, symbol: "♬" },
  { label: "Eighth", ratio: 0.5, symbol: "♪" },
  { label: "Dotted eighth", ratio: 0.75, symbol: "♪·" },
  { label: "Quarter", ratio: 1, symbol: "♩" },
  { label: "Dotted quarter", ratio: 1.5, symbol: "♩·" },
  { label: "Half", ratio: 2, symbol: "𝅗𝅥" },
  { label: "Dotted half", ratio: 3, symbol: "𝅗𝅥·" },
  { label: "Whole", ratio: 4, symbol: "𝅝" },
];

export function quarterDurationSeconds(beatUnit: BeatUnit, bpm: number) {
  return 60 / (bpm * BEAT_UNIT_QUARTERS[beatUnit]);
}

export function quantizeDuration(
  rawSeconds: number,
  quarterSeconds: number,
): QuantizedRhythm {
  const measuredRatio = rawSeconds / quarterSeconds;
  const nearest = DURATION_OPTIONS.reduce((best, option) => {
    const bestDistance = Math.abs(measuredRatio - best.ratio);
    const optionDistance = Math.abs(measuredRatio - option.ratio);
    return optionDistance < bestDistance ? option : best;
  });
  const relativeError = Math.abs(measuredRatio - nearest.ratio) / nearest.ratio;
  return {
    ...nearest,
    rawSeconds,
    relativeError,
    confidence: Math.max(0, Math.min(1, 1 - relativeError / 0.2)),
  };
}

export function quantizeClapSequence(
  clapTimes: number[],
  stopTime: number,
  quarterSeconds: number,
): QuantizedRhythm[] {
  if (!clapTimes.length || stopTime <= clapTimes[0]) return [];
  return clapTimes.map((start, index) => {
    const end = clapTimes[index + 1] ?? stopTime;
    return quantizeDuration(Math.max(0.04, end - start), quarterSeconds);
  });
}

/** Adaptive transient detector for short, broadband clap onsets. */
export class ClapOnsetDetector {
  private noiseFloor = 0.002;
  private previousPeak = 0;
  private lastOnset = -Infinity;
  private knownClickLeakPeak = 0;

  reset() {
    this.noiseFloor = 0.002;
    this.previousPeak = 0;
    this.lastOnset = -Infinity;
    this.knownClickLeakPeak = 0;
  }

  calibrateSample(rms: number, peak: number) {
    this.knownClickLeakPeak = Math.max(this.knownClickLeakPeak * 0.995, peak);
    if (rms < this.noiseFloor * 3) {
      this.noiseFloor = this.noiseFloor * 0.98 + rms * 0.02;
    }
    this.previousPeak = this.previousPeak * 0.55 + peak * 0.45;
  }

  addSample(rms: number, peak: number, time: number) {
    const threshold = Math.max(
      0.018,
      this.noiseFloor * 5,
      this.knownClickLeakPeak * 1.3,
    );
    const rising = peak >= threshold
      && peak >= Math.max(0.018, this.previousPeak * 1.45)
      && rms >= this.noiseFloor * 1.8;
    const outsideRefractory = time - this.lastOnset >= 0.12;
    const onset = rising && outsideRefractory;

    if (onset) {
      this.lastOnset = time;
    } else if (rms < this.noiseFloor * 3) {
      this.noiseFloor = this.noiseFloor * 0.98 + rms * 0.02;
    }
    this.previousPeak = this.previousPeak * 0.55 + peak * 0.45;
    return onset;
  }
}

import { DURATION_OPTIONS, type DurationOption } from "./rhythm-detector";

export type Clef = "treble" | "alto" | "bass";
export type TimeSignatureBottom = 2 | 4 | 8;

export type SequenceNote = {
  pitch: string | null;
  midi: number | null;
  duration: DurationOption;
};

export type SequenceParseResult = {
  notes: SequenceNote[];
  error: string | null;
};

export type NotationSegment = SequenceNote & {
  measureIndex: number;
  offsetQuarters: number;
  tieFromPrevious: boolean;
  tieToNext: boolean;
};

const DURATION_BY_TOKEN = new Map(
  DURATION_OPTIONS.map((duration) => [duration.label.toLowerCase().replaceAll(" ", "-"), duration]),
);

const NOTE_PATTERN = /([A-Ga-g](?:[#♯b♭])?-?\d+|\?)\s*:\s*(dotted(?:[-_ ]+)(?:eighth|quarter|half)|sixteenth|eighth|quarter|half|whole)\b/g;
const NOTE_BASES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const CANONICAL_PITCH_CLASSES = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];

function parsePitch(token: string) {
  if (token === "?") return { pitch: null, midi: null };
  const match = /^([A-Ga-g])([#♯b♭]?)(-?\d+)$/.exec(token);
  if (!match) return null;
  const letter = match[1].toUpperCase();
  const accidental = match[2];
  const octave = Number(match[3]);
  const offset = accidental === "#" || accidental === "♯" ? 1 : accidental === "b" || accidental === "♭" ? -1 : 0;
  const midi = (octave + 1) * 12 + NOTE_BASES[letter] + offset;
  if (!Number.isInteger(midi) || midi < 0 || midi > 127) return null;
  const pitchClass = ((midi % 12) + 12) % 12;
  const canonicalOctave = Math.floor(midi / 12) - 1;
  return { pitch: `${CANONICAL_PITCH_CLASSES[pitchClass]}${canonicalOctave}`, midi };
}

export function parseSequence(text: string): SequenceParseResult {
  if (!text.trim()) return { notes: [], error: "Paste at least one note and duration." };

  const notes: SequenceNote[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(NOTE_PATTERN)) {
    const gap = text.slice(lastIndex, match.index).replace(/[\s,;|]+/g, "");
    if (gap) return { notes: [], error: `Could not read “${gap}”. Use a sequence such as G3:quarter A3:eighth.` };

    const parsedPitch = parsePitch(match[1]);
    const durationToken = match[2].toLowerCase().replace(/[_ ]+/g, "-");
    const duration = DURATION_BY_TOKEN.get(durationToken);
    if (!parsedPitch || !duration) {
      return { notes: [], error: `Could not read “${match[0]}”.` };
    }
    notes.push({ ...parsedPitch, duration });
    lastIndex = (match.index ?? 0) + match[0].length;
  }

  const tail = text.slice(lastIndex).replace(/[\s,;|]+/g, "");
  if (tail || !notes.length) {
    return { notes: [], error: `Could not read “${tail || text.trim()}”. Use a sequence such as G3:quarter A3:eighth.` };
  }
  return { notes, error: null };
}

export function formatSequence(notes: SequenceNote[]) {
  return notes
    .map((note) => `${note.pitch ?? "?"}:${note.duration.label.toLowerCase().replaceAll(" ", "-")}`)
    .join(" ");
}

export function measureCapacity(top: number, bottom: TimeSignatureBottom) {
  return top * (4 / bottom);
}

export function buildNotationSegments(
  notes: SequenceNote[],
  top: number,
  bottom: TimeSignatureBottom,
): NotationSegment[] {
  const capacity = measureCapacity(top, bottom);
  if (!Number.isFinite(capacity) || capacity <= 0) return [];

  const durations = [...DURATION_OPTIONS].sort((a, b) => b.ratio - a.ratio);
  const segments: NotationSegment[] = [];
  let measureIndex = 0;
  let measureRemaining = capacity;
  let offsetQuarters = 0;

  for (const note of notes) {
    let noteRemaining = note.duration.ratio;
    let hasPreviousPiece = false;
    while (noteRemaining > 0.0001) {
      if (measureRemaining <= 0.0001) {
        measureIndex += 1;
        measureRemaining = capacity;
        offsetQuarters = 0;
      }

      const maximumPiece = Math.min(noteRemaining, measureRemaining);
      const duration = durations.find((candidate) => candidate.ratio <= maximumPiece + 0.0001);
      if (!duration) break;

      noteRemaining -= duration.ratio;
      measureRemaining -= duration.ratio;
      segments.push({
        ...note,
        duration,
        measureIndex,
        offsetQuarters,
        tieFromPrevious: hasPreviousPiece,
        tieToNext: noteRemaining > 0.0001,
      });
      hasPreviousPiece = true;
      offsetQuarters += duration.ratio;
    }
  }
  return segments;
}

function diatonicIndex(pitch: string) {
  const match = /^([A-G])[♯♭]?(-?\d+)$/.exec(pitch);
  if (!match) return null;
  const letters: Record<string, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  return Number(match[2]) * 7 + letters[match[1]];
}

export function noteYForClef(pitch: string, clef: Clef) {
  const index = diatonicIndex(pitch);
  if (index === null) return 60;
  if (clef === "treble") return 80 - (index - diatonicIndex("E4")!) * 5;
  if (clef === "alto") return 60 - (index - diatonicIndex("C4")!) * 5;
  return 80 - (index - diatonicIndex("G2")!) * 5;
}


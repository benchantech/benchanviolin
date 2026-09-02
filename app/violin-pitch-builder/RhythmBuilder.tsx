"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Copy, FileInput, Hand, Mic, Music2, RotateCcw, Square } from "lucide-react";
import StaffNotation from "./StaffNotation";
import { formatSequence, parseSequence, type SequenceNote } from "./_lib/music-notation";
import { detectPitch, frequencyToNote, summarizePitchFrames, type PitchEstimate, type PitchSummary } from "./_lib/pitch-detector";
import {
  BEAT_UNIT_QUARTERS,
  ClapOnsetDetector,
  DURATION_OPTIONS,
  quarterDurationSeconds,
  quantizeClapSequence,
  type BeatUnit,
  type QuantizedRhythm,
} from "./_lib/rhythm-detector";

type Phase = "setup" | "countin" | "recording" | "review" | "pitch" | "complete" | "error";
type RhythmSlot = QuantizedRhythm & {
  id: string;
  pitch: PitchSummary | null;
  skipped?: boolean;
};

const MAX_RHYTHM_SECONDS = 30;
const PITCH_TIMEOUT_MS = 10000;

const BEAT_UNIT_LABELS: Array<{ label: string; value: BeatUnit }> = [
  { label: "Eighth", value: "eighth" },
  { label: "Quarter", value: "quarter" },
  { label: "Dotted quarter", value: "dotted-quarter" },
  { label: "Half", value: "half" },
];

function slotsToSequence(slots: RhythmSlot[]): SequenceNote[] {
  return slots.map((slot) => ({
    pitch: slot.pitch?.note ?? null,
    midi: slot.pitch?.midi ?? null,
    duration: { label: slot.label, ratio: slot.ratio, symbol: slot.symbol },
  }));
}

function pitchSummaryFromMidi(midi: number): PitchSummary {
  const frequency = 440 * 2 ** ((midi - 69) / 12);
  return {
    frequency,
    ...frequencyToNote(frequency),
    clarity: 1,
    spreadCents: 0,
    acceptedFrames: 1,
    totalFrames: 1,
  };
}

export default function RhythmBuilder() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [beatUnit, setBeatUnit] = useState<BeatUnit>("quarter");
  const [bpm, setBpm] = useState(100);
  const [audioClick, setAudioClick] = useState(true);
  const [countIn, setCountIn] = useState(4);
  const [beatPulse, setBeatPulse] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [clapTimes, setClapTimes] = useState<number[]>([]);
  const [slots, setSlots] = useState<RhythmSlot[]>([]);
  const [pitchIndex, setPitchIndex] = useState(0);
  const [pitchListening, setPitchListening] = useState(false);
  const [pitchLiveNote, setPitchLiveNote] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [sequenceText, setSequenceText] = useState("");
  const [sequenceError, setSequenceError] = useState("");
  const [showStaff, setShowStaff] = useState(false);

  const phaseRef = useRef<Phase>("setup");
  const contextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRefs = useRef<number[]>([]);
  const timeoutRefs = useRef<number[]>([]);
  const rhythmStartRef = useRef(0);
  const clapTimesRef = useRef<number[]>([]);
  const clapDetectorRef = useRef(new ClapOnsetDetector());
  const slotsRef = useRef<RhythmSlot[]>([]);
  const pitchFramesRef = useRef<Array<PitchEstimate | null>>([]);
  const pitchSettledRef = useRef(false);

  const updatePhase = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const cleanupAudio = () => {
    intervalRefs.current.forEach((id) => window.clearInterval(id));
    timeoutRefs.current.forEach((id) => window.clearTimeout(id));
    intervalRefs.current = [];
    timeoutRefs.current = [];
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void contextRef.current?.close();
    contextRef.current = null;
  };

  useEffect(() => cleanupAudio, []);

  const scheduleClick = (context: AudioContext, time: number, accent: boolean) => {
    if (!audioClick) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = accent ? 1500 : 1050;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(accent ? 0.16 : 0.1, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(time);
    oscillator.stop(time + 0.04);
  };

  const finishRhythm = () => {
    const context = contextRef.current;
    if (!context || (phaseRef.current !== "recording" && phaseRef.current !== "countin")) return;
    const stopTime = Math.min(
      MAX_RHYTHM_SECONDS,
      Math.max(0, context.currentTime - rhythmStartRef.current),
    );
    const quarterSeconds = quarterDurationSeconds(beatUnit, bpm);
    const quantized = quantizeClapSequence(
      clapTimesRef.current,
      stopTime,
      quarterSeconds,
    );
    cleanupAudio();

    if (!quantized.length) {
      setMessage("No clap sequence was captured. Clap firmly after the count-in, then stop after the final note length.");
      updatePhase("error");
      return;
    }

    const nextSlots = quantized.map((slot, index) => ({
      ...slot,
      id: `slot-${index}`,
      pitch: null,
    }));
    slotsRef.current = nextSlots;
    setSlots(nextSlots);
    updatePhase("review");
  };

  const startRhythm = async () => {
    cleanupAudio();
    setMessage("");
    setClapTimes([]);
    clapTimesRef.current = [];
    clapDetectorRef.current.reset();
    setSlots([]);
    slotsRef.current = [];
    setSequenceText("");
    setSequenceError("");
    setShowStaff(false);
    setElapsed(0);
    setCountIn(4);
    setCopied(false);
    updatePhase("countin");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          echoCancellation: audioClick,
          noiseSuppression: false,
          channelCount: 1,
        },
        video: false,
      });
      const context = new AudioContext({ latencyHint: "interactive" });
      await context.resume();
      await context.audioWorklet.addModule("/clap-processor.js?v=1");
      const source = context.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(context, "clap-processor");
      const silentOutput = context.createGain();
      silentOutput.gain.value = 0;
      source.connect(worklet).connect(silentOutput).connect(context.destination);

      contextRef.current = context;
      streamRef.current = stream;

      const beatSeconds = 60 / bpm;
      const firstBeat = context.currentTime + 0.45;
      const rhythmStart = firstBeat + 4 * beatSeconds;
      rhythmStartRef.current = rhythmStart;
      const finalTime = rhythmStart + MAX_RHYTHM_SECONDS;

      for (let time = firstBeat, index = 0; time <= finalTime; time += beatSeconds, index += 1) {
        scheduleClick(context, time, index % 4 === 0);
      }

      worklet.port.onmessage = (event: MessageEvent<{ peak: number; rms: number; time: number }>) => {
        const { peak, rms, time } = event.data;
        if (time < rhythmStart) {
          clapDetectorRef.current.calibrateSample(rms, peak);
          return;
        }
        if (time > finalTime) return;
        if (!clapDetectorRef.current.addSample(rms, peak, time)) return;
        const relative = time - rhythmStart;
        clapTimesRef.current = [...clapTimesRef.current, relative];
        setClapTimes(clapTimesRef.current);
      };

      let previousBeat = -1;
      const visualTimer = window.setInterval(() => {
        const now = context.currentTime;
        const beatIndex = Math.floor((now - firstBeat) / beatSeconds);
        if (beatIndex !== previousBeat && beatIndex >= 0) {
          previousBeat = beatIndex;
          setBeatPulse((value) => value + 1);
          if (beatIndex < 4) setCountIn(4 - beatIndex);
        }
        if (now >= rhythmStart && phaseRef.current === "countin") updatePhase("recording");
        if (now >= rhythmStart) setElapsed(Math.min(MAX_RHYTHM_SECONDS, now - rhythmStart));
      }, 20);
      intervalRefs.current.push(visualTimer);

      const stopTimer = window.setTimeout(
        finishRhythm,
        (finalTime - context.currentTime) * 1000,
      );
      timeoutRefs.current.push(stopTimer);
    } catch (error) {
      cleanupAudio();
      setMessage(error instanceof Error ? error.message : "The rhythm recorder could not start.");
      updatePhase("error");
    }
  };

  const cycleDuration = (index: number) => {
    const current = slotsRef.current[index];
    const optionIndex = DURATION_OPTIONS.findIndex((option) => option.ratio === current.ratio);
    const next = DURATION_OPTIONS[(optionIndex + 1) % DURATION_OPTIONS.length];
    const updated = slotsRef.current.map((slot, slotIndex) => (
      slotIndex === index
        ? { ...slot, ...next, confidence: 1, relativeError: 0 }
        : slot
    ));
    slotsRef.current = updated;
    setSlots(updated);
  };

  const advancePitch = (pitch: PitchSummary | null, skipped = false) => {
    const updated = slotsRef.current.map((slot, index) => (
      index === pitchIndex ? { ...slot, pitch, skipped } : slot
    ));
    slotsRef.current = updated;
    setSlots(updated);
    setPitchListening(false);
    setPitchLiveNote(null);
    setMessage("");
    if (pitchIndex + 1 >= updated.length) {
      setSequenceText(formatSequence(slotsToSequence(updated)));
      setSequenceError("");
      setShowStaff(false);
      updatePhase("complete");
    } else {
      setPitchIndex((index) => index + 1);
    }
  };

  const startPitchCapture = async () => {
    cleanupAudio();
    pitchFramesRef.current = [];
    pitchSettledRef.current = false;
    setPitchListening(true);
    setPitchLiveNote(null);
    setMessage("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          echoCancellation: false,
          noiseSuppression: false,
          channelCount: 1,
        },
        video: false,
      });
      const context = new AudioContext({ latencyHint: "interactive" });
      await context.resume();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 8192;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);
      streamRef.current = stream;
      contextRef.current = context;

      const detectorTimer = window.setInterval(() => {
        if (pitchSettledRef.current) return;
        const frame = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(frame);
        const estimate = detectPitch(frame, context.sampleRate);
        pitchFramesRef.current.push(estimate);
        const result = summarizePitchFrames(pitchFramesRef.current.slice(-7));
        setPitchLiveNote(result?.note ?? null);
        if (!result) return;

        pitchSettledRef.current = true;
        cleanupAudio();
        window.setTimeout(() => advancePitch(result), 160);
      }, 100);
      intervalRefs.current.push(detectorTimer);

      const pitchTimeout = window.setTimeout(() => {
        if (pitchSettledRef.current) return;
        pitchSettledRef.current = true;
        cleanupAudio();
        setPitchListening(false);
        setPitchLiveNote(null);
        setMessage("No pitch locked within ten seconds. Retry this slot or leave it blank.");
      }, PITCH_TIMEOUT_MS);
      timeoutRefs.current.push(pitchTimeout);
    } catch (error) {
      cleanupAudio();
      setPitchListening(false);
      setMessage(error instanceof Error ? error.message : "The pitch recorder could not start.");
    }
  };

  const beginPitchPhase = () => {
    setPitchIndex(0);
    setMessage("");
    updatePhase("pitch");
  };

  const restart = () => {
    cleanupAudio();
    clapTimesRef.current = [];
    slotsRef.current = [];
    setClapTimes([]);
    setSlots([]);
    setPitchIndex(0);
    setPitchListening(false);
    setPitchLiveNote(null);
    setMessage("");
    setCopied(false);
    setSequenceError("");
    setShowStaff(false);
    updatePhase("setup");
  };

  const copyResult = async () => {
    const text = formatSequence(slotsToSequence(slots));
    await navigator.clipboard.writeText(text);
    setSequenceText(text);
    setCopied(true);
  };

  const loadSequence = () => {
    const result = parseSequence(sequenceText);
    if (result.error) {
      setSequenceError(result.error);
      return;
    }
    const quarterSeconds = quarterDurationSeconds(beatUnit, bpm);
    const nextSlots: RhythmSlot[] = result.notes.map((note, index) => ({
      ...note.duration,
      id: `slot-${index}`,
      pitch: note.midi === null ? null : pitchSummaryFromMidi(note.midi),
      skipped: note.midi === null,
      confidence: 1,
      relativeError: 0,
      rawSeconds: note.duration.ratio * quarterSeconds,
    }));
    slotsRef.current = nextSlots;
    setSlots(nextSlots);
    setSequenceText(formatSequence(result.notes));
    setSequenceError("");
    setCopied(false);
    setShowStaff(false);
    updatePhase("complete");
  };

  if (phase === "setup") {
    return (
      <div className="builder-panel">
        <div className="builder-grid">
          <label>
            <span>Metronome beat</span>
            <select value={beatUnit} onChange={(event) => setBeatUnit(event.target.value as BeatUnit)}>
              {BEAT_UNIT_LABELS.map((unit) => <option key={unit.value} value={unit.value}>{unit.label} note</option>)}
            </select>
          </label>
          <label>
            <span>Beats per minute</span>
            <input type="number" min="40" max="220" value={bpm} onChange={(event) => setBpm(Math.max(40, Math.min(220, Number(event.target.value))))} />
          </label>
        </div>
        <p className="tempo-equivalence">
          Quarter-note pulse: {Math.round(bpm * BEAT_UNIT_QUARTERS[beatUnit])} BPM · {quarterDurationSeconds(beatUnit, bpm).toFixed(3)} sec
        </p>
        <label className="audio-toggle">
          <input type="checkbox" checked={audioClick} onChange={(event) => setAudioClick(event.target.checked)} />
          <span>Audible metronome</span>
        </label>
        <button className="builder-primary" type="button" onClick={startRhythm}><Hand aria-hidden="true" /> Start count-in</button>
        <p className="builder-help">Headphones give the cleanest clap detection. Clap once per note; press Finish after the final note has lasted its full value.</p>
        <div className="sequence-import">
          <span>Or paste a sequence</span>
          <textarea aria-label="Pasted pitch and rhythm sequence" value={sequenceText} onChange={(event) => setSequenceText(event.target.value)} placeholder="G3:quarter A3:eighth B♭3:dotted-quarter" />
          {sequenceError && <p className="builder-warning">{sequenceError}</p>}
          <button className="secondary-button" type="button" onClick={loadSequence}><FileInput aria-hidden="true" /> Load sequence</button>
        </div>
      </div>
    );
  }

  if (phase === "countin" || phase === "recording") {
    return (
      <div className="builder-panel rhythm-live">
        <div key={beatPulse} className="metronome-pulse">{phase === "countin" ? countIn : "●"}</div>
        <p className="builder-title">{phase === "countin" ? "Get ready…" : "Clap each note onset"}</p>
        <p className="builder-readout">{phase === "recording" ? `${elapsed.toFixed(1)}s · ${clapTimes.length} claps` : "Four-beat count-in"}</p>
        <div className="clap-row">{clapTimes.map((time, index) => <span key={`${time}-${index}`}>{index + 1}</span>)}</div>
        {phase === "recording" && <button className="stop-button" type="button" onClick={finishRhythm}><Square aria-hidden="true" /> Finish rhythm</button>}
      </div>
    );
  }

  if (phase === "review") {
    return (
      <div className="builder-panel">
        <p className="builder-kicker">Rhythm detected</p>
        <h2 className="builder-title">Check the note lengths.</h2>
        <p className="builder-help">Click any slot to cycle its value. Amber slots fell outside the strong timing tolerance.</p>
        <div className="rhythm-slots">
          {slots.map((slot, index) => (
            <button className={slot.relativeError > 0.18 ? "is-uncertain" : ""} type="button" key={slot.id} onClick={() => cycleDuration(index)}>
              <span>{slot.symbol}</span><strong>{slot.label}</strong><small>{slot.rawSeconds.toFixed(2)}s</small>
            </button>
          ))}
        </div>
        <button className="builder-primary" type="button" onClick={beginPitchPhase}>Add pitches <ChevronRight aria-hidden="true" /></button>
      </div>
    );
  }

  if (phase === "pitch") {
    const current = slots[pitchIndex];
    return (
      <div className="builder-panel pitch-step">
        <p className="builder-kicker">Pitch {pitchIndex + 1} of {slots.length}</p>
        <div className="current-rhythm">{current.symbol}<span>{current.label}</span></div>
        <p className="builder-title">{pitchListening ? (pitchLiveNote ? `Locked: ${pitchLiveNote}` : "Hold one pitch…") : "Define this note’s pitch."}</p>
        <div className="filled-pitches">
          {slots.map((slot, index) => <span className={index === pitchIndex ? "is-current" : ""} key={slot.id}>{slot.pitch?.note ?? (slot.skipped ? "?" : "—")}</span>)}
        </div>
        {message && <p className="builder-warning">{message}</p>}
        {!pitchListening && <button className="builder-primary" type="button" onClick={startPitchCapture}><Mic aria-hidden="true" /> Listen for pitch</button>}
        {!pitchListening && <button className="builder-link" type="button" onClick={() => advancePitch(null, true)}>Leave blank</button>}
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="builder-panel">
        <p className="builder-kicker">Rhythm and pitch</p>
        <h2 className="builder-title">Sequence complete</h2>
        <div className="merged-sequence">
          {slots.map((slot) => <div key={slot.id}><span>{slot.symbol}</span><strong>{slot.pitch?.note ?? "?"}</strong><small>{slot.label}</small></div>)}
        </div>
        <div className="sequence-editor">
          <label htmlFor="sequence-text">Editable sequence</label>
          <textarea id="sequence-text" value={sequenceText} onChange={(event) => setSequenceText(event.target.value)} />
          {sequenceError && <p className="builder-warning">{sequenceError}</p>}
          <button className="builder-link" type="button" onClick={loadSequence}>Apply pasted sequence</button>
        </div>
        <div className="result-actions">
          <button className="secondary-button" type="button" onClick={copyResult}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? "Copied" : "Copy sequence"}</button>
          <button className="secondary-button" type="button" onClick={() => setShowStaff((value) => !value)}><Music2 aria-hidden="true" />{showStaff ? "Hide staff" : "Draw on staff"}</button>
          <button className="secondary-button" type="button" onClick={restart}><RotateCcw aria-hidden="true" /> Start over</button>
        </div>
        {showStaff && <StaffNotation notes={slotsToSequence(slots)} />}
      </div>
    );
  }

  return (
    <div className="builder-panel">
      <div className="unclear-icon">?</div>
      <p className="builder-title">Rhythm capture failed.</p>
      <p className="builder-warning">{message}</p>
      <button className="secondary-button" type="button" onClick={restart}><RotateCcw aria-hidden="true" /> Try again</button>
    </div>
  );
}

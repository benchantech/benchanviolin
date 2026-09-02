"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, LockKeyhole, Mic, RotateCcw, ShieldCheck, Square } from "lucide-react";
import { detectPitch, PitchSequenceTracker, summarizePitchFrames, type PitchEstimate, type PitchSequenceEvent, type PitchSummary } from "./_lib/pitch-detector";
import RhythmBuilder from "./RhythmBuilder";

type Status = "idle" | "requesting" | "recording" | "analysing" | "result" | "unclear" | "error";
type Mode = "single" | "sequence" | "builder";
type LockedPitch = PitchSequenceEvent;

const SINGLE_RECORDING_MS = 10000;
const SEQUENCE_RECORDING_MS = 30000;
const FRAME_INTERVAL_MS = 100;

function errorMessage(error: unknown) {
  if (!window.isSecureContext) return "Microphone access needs a secure HTTPS page.";
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") return "Microphone permission was denied. Allow access in your browser settings, then try again.";
    if (error.name === "NotFoundError") return "No microphone was found on this device.";
    if (error.name === "NotReadableError") return "Your microphone is busy in another app. Close it there and try again.";
  }
  return "The microphone could not start. Check browser permissions and try again.";
}

export default function PitchLab() {
  const [mode, setMode] = useState<Mode>("single");
  const [status, setStatus] = useState<Status>("idle");
  const [summary, setSummary] = useState<PitchSummary | null>(null);
  const [lockedPitches, setLockedPitches] = useState<LockedPitch[]>([]);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState(0);
  const [liveNote, setLiveNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const progressRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const pitchFramesRef = useRef<Array<PitchEstimate | null>>([]);
  const frameLevelsRef = useRef<number[]>([]);
  const lockedPitchesRef = useRef<LockedPitch[]>([]);
  const sequenceTrackerRef = useRef(new PitchSequenceTracker());
  const startedAtRef = useRef(0);
  const durationRef = useRef(SINGLE_RECORDING_MS);
  const modeRef = useRef<Exclude<Mode, "builder">>("single");
  const statusRef = useRef<Status>("idle");

  const updateStatus = (next: Status) => {
    statusRef.current = next;
    setStatus(next);
  };

  const releaseAudio = () => {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    if (progressRef.current !== null) window.clearInterval(progressRef.current);
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    progressRef.current = null;
    timeoutRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void contextRef.current?.close();
    contextRef.current = null;
  };

  useEffect(() => releaseAudio, []);

  const clearAnalysisRefs = () => {
    pitchFramesRef.current = [];
    frameLevelsRef.current = [];
    sequenceTrackerRef.current.reset();
  };

  const processSequenceFrame = (estimate: PitchEstimate | null, rms: number) => {
    const elapsed = Math.max(0, (performance.now() - startedAtRef.current) / 1000);
    const update = sequenceTrackerRef.current.addFrame(estimate, rms, elapsed);
    if (update.locked) {
      lockedPitchesRef.current = [...lockedPitchesRef.current, update.locked];
      setLockedPitches(lockedPitchesRef.current);
    }
    setLiveNote(update.isChanging ? null : update.active?.note ?? null);
  };

  const finishRecording = () => {
    const context = contextRef.current;
    const pitchFrames = pitchFramesRef.current;
    const frameLevels = frameLevelsRef.current;
    const recordingMode = modeRef.current;
    if (!context || statusRef.current !== "recording") return;

    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    if (progressRef.current !== null) window.clearInterval(progressRef.current);
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    progressRef.current = null;
    timeoutRef.current = null;
    updateStatus("analysing");
    setProgress(1);

    window.setTimeout(() => {
      const result = recordingMode === "single" ? summarizePitchFrames(pitchFrames) : null;
      const sequence = lockedPitchesRef.current;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      void context.close();
      contextRef.current = null;

      if (recordingMode === "sequence" && sequence.length > 0) {
        setSummary(sequence.at(-1) ?? null);
        clearAnalysisRefs();
        updateStatus("result");
        return;
      }

      if (recordingMode === "single" && result) {
        setSummary(result);
        clearAnalysisRefs();
        updateStatus("result");
        return;
      }

      setSummary(null);
      const audibleFrames = frameLevels.filter((rms) => rms >= 0.002).length;
      const clearFrames = pitchFrames.filter((estimate) => estimate && estimate.clarity >= 0.58).length;
      if (audibleFrames < 4) {
        setMessage("The microphone opened, but the signal was extremely quiet. Move closer or raise your input level.");
      } else if (clearFrames < 4 && recordingMode === "single") {
        setMessage("We heard sound, but it didn’t contain enough repeating pitch signal. Try a steadier sustained note.");
      } else if (recordingMode === "sequence") {
        setMessage("We heard sound, but no pitch stayed stable long enough to lock. Hold each note a little longer.");
      } else {
        setMessage("We heard several pitches, but they didn’t agree on one note. Start the note first, then hold it without sliding.");
      }
      clearAnalysisRefs();
      updateStatus("unclear");
    }, 50);
  };

  const startRecording = async () => {
    releaseAudio();
    clearAnalysisRefs();
    lockedPitchesRef.current = [];
    setLockedPitches([]);
    setSummary(null);
    setMessage("");
    setProgress(0);
    setLevel(0);
    setLiveNote(null);
    setCopied(false);
    if (mode === "builder") return;
    modeRef.current = mode;
    durationRef.current = mode === "sequence" ? SEQUENCE_RECORDING_MS : SINGLE_RECORDING_MS;
    updateStatus("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { autoGainControl: true, echoCancellation: false, noiseSuppression: false, channelCount: 1 },
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
      startedAtRef.current = performance.now();
      updateStatus("recording");

      const collectFrame = () => {
        const frame = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(frame);
        let energy = 0;
        for (let i = 0; i < frame.length; i += 1) energy += frame[i] * frame[i];
        const rms = Math.sqrt(energy / frame.length);
        frameLevelsRef.current.push(rms);
        setLevel(Math.min(1, rms / 0.08));

        const estimate = detectPitch(frame, context.sampleRate);
        pitchFramesRef.current.push(estimate);

        if (modeRef.current === "sequence") {
          processSequenceFrame(estimate, rms);
          return;
        }

        const liveResult = summarizePitchFrames(pitchFramesRef.current.slice(-7));
        setLiveNote(liveResult?.note ?? null);
        if (liveResult) window.setTimeout(finishRecording, 120);
      };

      collectFrame();
      intervalRef.current = window.setInterval(collectFrame, FRAME_INTERVAL_MS);
      progressRef.current = window.setInterval(() => {
        setProgress(Math.min(1, (performance.now() - startedAtRef.current) / durationRef.current));
      }, 50);
      timeoutRef.current = window.setTimeout(finishRecording, durationRef.current);
    } catch (error) {
      releaseAudio();
      setMessage(errorMessage(error));
      updateStatus("error");
    }
  };

  const reset = () => {
    releaseAudio();
    clearAnalysisRefs();
    lockedPitchesRef.current = [];
    setLockedPitches([]);
    setSummary(null);
    setMessage("");
    setProgress(0);
    setLevel(0);
    setLiveNote(null);
    setCopied(false);
    updateStatus("idle");
  };

  const copySequence = async () => {
    await navigator.clipboard.writeText(lockedPitches.map((pitch) => pitch.note).join(" "));
    setCopied(true);
  };

  const isBusy = status === "requesting" || status === "recording" || status === "analysing";
  const durationSeconds = mode === "sequence" ? 30 : 10;
  const cents = summary?.cents ?? 0;
  const centsLabel = Math.abs(cents) < 1 ? "in tune" : `${Math.abs(cents).toFixed(0)}¢ ${cents < 0 ? "flat" : "sharp"}`;
  const sequenceText = lockedPitches.map((pitch) => pitch.note).join(" → ");

  return (
    <main className="site-shell">
      <section className="hero">
        <div className="discontinued-note">
          <strong>Violin Pitch Builder has been discontinued as a product.</strong>
          <span>
            This page remains available as a client-only test implementation of pitch detection, possible rhythm
            capture, and notation drawing. Microphone audio is processed locally in your browser.
          </span>
        </div>
        <p className="eyebrow">A tiny experiment in listening</p>
        <h1>{mode === "builder" ? "Build rhythm, then pitch." : mode === "sequence" ? "Play a pitch sequence." : "Play one steady note."}</h1>
        <p className="lede">
          {mode === "builder"
            ? "Clap the note lengths against a metronome, correct the rhythm, then define each pitch individually."
            : mode === "sequence"
            ? "Hold each pitch until it locks, then move to the next. We’ll write the sequence for thirty seconds."
            : "Hold a comfortable pitch until it locks. We’ll identify the note—right here in your browser."}
        </p>
      </section>

      <section className="pitch-card" aria-live="polite">
        <div className="card-topline">
          <span>{status === "recording" ? "Listening now" : status === "analysing" ? "Checking the signal" : status === "result" ? (mode === "sequence" ? "Pitch sequence" : "Your pitch") : "Microphone test"}</span>
          <span className={`status-dot ${status === "recording" ? "is-live" : ""}`} />
        </div>

        {(status === "idle" || status === "requesting") && (
          <div className="main-state idle-state">
            <div className="mode-switch" aria-label="Detection mode">
              <button className={mode === "single" ? "is-selected" : ""} type="button" onClick={() => setMode("single")}>Single note</button>
              <button className={mode === "sequence" ? "is-selected" : ""} type="button" onClick={() => setMode("sequence")}>30-second sequence</button>
              <button className={mode === "builder" ? "is-selected" : ""} type="button" onClick={() => setMode("builder")}>Rhythm → pitch</button>
            </div>
            {mode === "builder" ? <RhythmBuilder /> : (
              <>
                <button className="record-button" type="button" onClick={startRecording} disabled={status === "requesting"}>
                  <Mic aria-hidden="true" /><span>{status === "requesting" ? "Opening mic…" : "Start"}</span>
                </button>
                <p className="state-instruction">
                  {mode === "sequence"
                    ? "Use one note at a time. A short gap is required to write the same pitch twice."
                    : "Hold one steady note. We’ll stop automatically when it locks."}
                </p>
              </>
            )}
          </div>
        )}

        {status === "recording" && (
          <div className="main-state recording-state">
            <div className="listening-orbit" style={{ "--level": level } as React.CSSProperties}><Mic aria-hidden="true" /></div>
            <p className="state-title">
              {liveNote ? `Locked: ${liveNote}` : mode === "sequence" && lockedPitches.length ? "Detecting the next note…" : "Keep holding that note…"}
            </p>
            {mode === "sequence" && (
              <div className="live-sequence" aria-label="Locked pitch sequence">
                {lockedPitches.length ? lockedPitches.map((pitch, index) => <span key={`${pitch.lockedAt}-${index}`}>{pitch.note}</span>) : <em>No notes locked yet</em>}
              </div>
            )}
            <div className="level-track" aria-label="Microphone level"><span style={{ width: `${Math.max(3, level * 100)}%` }} /></div>
            <div className="progress-row">
              <span>{Math.max(0, Math.ceil(durationSeconds * (1 - progress)))} sec max</span>
              <span>{liveNote ? "Pitch locked" : level < 0.04 ? "Signal is quiet" : "Finding pitch…"}</span>
            </div>
            <button className="stop-button" type="button" onClick={finishRecording}><Square aria-hidden="true" /> Finish now</button>
          </div>
        )}

        {status === "analysing" && (
          <div className="main-state analysing-state">
            <span className="spinner" aria-hidden="true" />
            <p className="state-title">{mode === "sequence" ? "Writing the sequence…" : "Finding the most stable pitch…"}</p>
            <p className="state-instruction">Only pitches supported by repeated agreeing samples are retained.</p>
          </div>
        )}

        {status === "result" && mode === "single" && summary && (
          <div className="main-state result-state">
            <div className="note-lockup"><span className="note-name">{summary.noteName}</span><span className="octave">{summary.octave}</span></div>
            <p className="frequency">{summary.frequency.toFixed(1)} Hz</p>
            <div className="tuner" aria-label={`Pitch is ${centsLabel}`}>
              <div className="tuner-labels"><span>flat</span><span>in tune</span><span>sharp</span></div>
              <div className="tuner-rail"><span className="tuner-center" /><span className="tuner-needle" style={{ left: `${50 + cents}%` }} /></div>
              <strong>{centsLabel}</strong>
            </div>
            <div className="confidence-row"><ShieldCheck aria-hidden="true" /><span>{Math.round(summary.clarity * 100)}% periodic clarity · {summary.acceptedFrames} agreeing samples</span></div>
            <button className="secondary-button" type="button" onClick={reset}><RotateCcw aria-hidden="true" /> Try another note</button>
          </div>
        )}

        {status === "result" && mode === "sequence" && lockedPitches.length > 0 && (
          <div className="main-state sequence-result-state">
            <p className="sequence-count">{lockedPitches.length} locked {lockedPitches.length === 1 ? "pitch" : "pitches"}</p>
            <p className="sequence-output">{sequenceText}</p>
            <div className="sequence-details">
              {lockedPitches.map((pitch, index) => (
                <div key={`result-${pitch.lockedAt}-${index}`}>
                  <span>{index + 1}</span>
                  <strong>{pitch.note}</strong>
                  <small>{pitch.frequency.toFixed(1)} Hz · {pitch.lockedAt.toFixed(1)}s</small>
                </div>
              ))}
            </div>
            <div className="result-actions">
              <button className="secondary-button" type="button" onClick={copySequence}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? "Copied" : "Copy pitches"}</button>
              <button className="secondary-button" type="button" onClick={reset}><RotateCcw aria-hidden="true" /> New sequence</button>
            </div>
          </div>
        )}

        {(status === "unclear" || status === "error") && (
          <div className="main-state unclear-state">
            <div className="unclear-icon">?</div>
            <p className="state-title">{status === "error" ? "We couldn’t open the microphone." : "No stable pitch locked."}</p>
            <p className="state-instruction">{message || "Try a quieter room, play a little louder, and hold each note without sliding."}</p>
            <button className="secondary-button" type="button" onClick={startRecording}><RotateCcw aria-hidden="true" /> Try again</button>
          </div>
        )}
        {isBusy && <div className="record-progress" style={{ width: `${progress * 100}%` }} />}
      </section>

      <section className="tips" aria-label="Recording tips">
        {mode === "builder" ? (
          <>
            <div><span>1</span><p><strong>Clap note attacks</strong><br />The metronome supplies the absolute timing grid.</p></div>
            <div><span>2</span><p><strong>Correct the rhythm</strong><br />Click any duration that was bucketed incorrectly.</p></div>
            <div><span>3</span><p><strong>Add pitch afterward</strong><br />Each rhythmic slot receives one locked pitch.</p></div>
          </>
        ) : (
          <>
            <div><span>1</span><p><strong>One pitch at a time</strong><br />Polyphonic sound remains intentionally unsupported.</p></div>
            <div><span>2</span><p><strong>Wait for the lock</strong><br />Then change cleanly to the next note.</p></div>
            <div><span>3</span><p><strong>Gap repeated notes</strong><br />Pitch alone can’t separate A4 from another A4.</p></div>
          </>
        )}
      </section>

      <footer>
        <p><LockKeyhole aria-hidden="true" /> Microphone audio is processed locally in your browser. Nothing is uploaded, saved, or reviewed.</p>
        <p>Experimental pitch detector · 65–1,200 Hz · A4 = 440 Hz</p>
      </footer>
    </main>
  );
}

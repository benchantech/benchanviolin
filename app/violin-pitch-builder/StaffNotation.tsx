"use client";

import { useMemo, useState } from "react";
import {
  buildNotationSegments,
  noteYForClef,
  type Clef,
  type SequenceNote,
  type TimeSignatureBottom,
} from "./_lib/music-notation";

const CLEFS: Array<{ value: Clef; symbol: string; label: string }> = [
  { value: "treble", symbol: "𝄞", label: "Treble" },
  { value: "alto", symbol: "𝄡", label: "Alto" },
  { value: "bass", symbol: "𝄢", label: "Bass" },
];
const BOTTOMS: TimeSignatureBottom[] = [2, 4, 8];

function ledgerLines(y: number) {
  const lines: number[] = [];
  for (let line = 30; line >= y; line -= 10) lines.push(line);
  for (let line = 90; line <= y; line += 10) lines.push(line);
  return lines;
}

function accidentalFor(pitch: string) {
  if (pitch.includes("♯")) return "♯";
  if (pitch.includes("♭")) return "♭";
  return "";
}

export default function StaffNotation({ notes }: { notes: SequenceNote[] }) {
  const [clef, setClef] = useState<Clef>("treble");
  const [topText, setTopText] = useState("4");
  const [bottom, setBottom] = useState<TimeSignatureBottom>(4);
  const top = Math.max(1, Math.min(32, Number.parseInt(topText, 10) || 4));
  const segments = useMemo(() => buildNotationSegments(notes, top, bottom), [notes, top, bottom]);
  const width = Math.max(620, 142 + segments.length * 66);
  const activeClef = CLEFS.find((item) => item.value === clef)!;
  const pitchYs = segments.flatMap((segment) => segment.pitch ? [noteYForClef(segment.pitch, clef)] : []);
  const minimumY = pitchYs.length ? Math.min(...pitchYs) : 40;
  const maximumY = pitchYs.length ? Math.max(...pitchYs) : 80;
  const verticalOffset = Math.max(0, 24 - minimumY);
  const height = Math.max(138 + verticalOffset, maximumY + verticalOffset + 34);

  const cycleClef = () => {
    const index = CLEFS.findIndex((item) => item.value === clef);
    setClef(CLEFS[(index + 1) % CLEFS.length].value);
  };

  const cycleBottom = () => {
    const index = BOTTOMS.indexOf(bottom);
    setBottom(BOTTOMS[(index + 1) % BOTTOMS.length]);
  };

  return (
    <section className="notation-panel" aria-label="Staff notation">
      <div className="staff-controls">
        <button type="button" onClick={cycleClef} aria-label={`Change clef. Current clef: ${activeClef.label}`}>
          <span aria-hidden="true">{activeClef.symbol}</span>{activeClef.label} clef
        </button>
        <div className="time-control" aria-label={`Time signature ${top}/${bottom}`}>
          <label>
            <span>Beats</span>
            <input
              inputMode="numeric"
              aria-label="Time signature top number"
              value={topText}
              onChange={(event) => setTopText(event.target.value.replace(/\D/g, "").slice(0, 2))}
              onBlur={() => setTopText(String(top))}
            />
          </label>
          <span aria-hidden="true">/</span>
          <button type="button" onClick={cycleBottom} aria-label={`Change time signature denominator. Current value: ${bottom}`}>{bottom}</button>
        </div>
        <p>Click the clef to cycle treble, alto, and bass. Click {bottom} to cycle 2, 4, and 8.</p>
      </div>
      <div className="staff-scroll" tabIndex={0} aria-label="Scrollable music staff">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${activeClef.label} clef notation in ${top}/${bottom}`}>
          <rect x="0" y="0" width={width} height={height} fill="#fffdf8" />
          <g transform={`translate(0 ${verticalOffset})`}>
          {[40, 50, 60, 70, 80].map((y) => <line key={y} x1="18" x2={width - 18} y1={y} y2={y} className="staff-line" />)}
          <text x="29" y="79" className={`clef-glyph clef-${clef}`}>{activeClef.symbol}</text>
          <text x="91" y="58" className="signature-number">{top}</text>
          <text x="91" y="79" className="signature-number">{bottom}</text>
          <line x1="18" x2="18" y1="40" y2="80" className="bar-line" />
          {segments.map((segment, index) => {
            const x = 132 + index * 66;
            const y = segment.pitch ? noteYForClef(segment.pitch, clef) : 60;
            const ratio = segment.duration.ratio;
            const open = ratio >= 2;
            const hasStem = ratio < 4;
            const stemDown = y < 60;
            const stemX = x + (stemDown ? -7 : 7);
            const stemEnd = y + (stemDown ? 34 : -34);
            const flagCount = ratio === 0.25 ? 2 : ratio === 0.5 || ratio === 0.75 ? 1 : 0;
            const dotted = ratio === 0.75 || ratio === 1.5 || ratio === 3;
            const nextX = x + 66;
            const nextSegment = segments[index + 1];
            const endsMeasure = !nextSegment || nextSegment.measureIndex !== segment.measureIndex;
            const tieY = y + (stemDown ? -12 : 14);

            return (
              <g key={`${segment.measureIndex}-${index}`}>
                {segment.pitch ? (
                  <>
                    {ledgerLines(y).map((lineY) => <line key={lineY} x1={x - 12} x2={x + 12} y1={lineY} y2={lineY} className="ledger-line" />)}
                    {accidentalFor(segment.pitch) && !segment.tieFromPrevious && <text x={x - 23} y={y + 5} className="accidental">{accidentalFor(segment.pitch)}</text>}
                    <ellipse cx={x} cy={y} rx="8" ry="5.4" transform={`rotate(-18 ${x} ${y})`} className={open ? "note-head open" : "note-head"} />
                    {hasStem && <line x1={stemX} x2={stemX} y1={y} y2={stemEnd} className="note-stem" />}
                    {Array.from({ length: flagCount }).map((_, flagIndex) => {
                      const startY = stemEnd + (stemDown ? -flagIndex * 8 : flagIndex * 8);
                      const curveY = startY + (stemDown ? 15 : -15);
                      return <path key={flagIndex} d={`M ${stemX} ${startY} Q ${stemX + 15} ${curveY} ${stemX + 6} ${curveY + (stemDown ? 9 : -9)}`} className="note-flag" />;
                    })}
                    {dotted && <circle cx={x + 15} cy={y - (y % 10 === 0 ? 3 : 0)} r="2.1" className="note-dot" />}
                    {segment.tieToNext && nextSegment?.pitch && <path d={`M ${x + 8} ${tieY} Q ${(x + nextX) / 2} ${tieY + (stemDown ? -10 : 10)} ${nextX - 8} ${tieY}`} className="note-tie" />}
                  </>
                ) : (
                  <text x={x} y="67" textAnchor="middle" className="unknown-note">?</text>
                )}
                {endsMeasure && <line x1={x + 32} x2={x + 32} y1="40" y2="80" className="bar-line" />}
              </g>
            );
          })}
          {!segments.length && <text x="132" y="66" className="empty-staff">No notes to draw</text>}
          </g>
        </svg>
      </div>
    </section>
  );
}

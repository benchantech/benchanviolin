import type { Metadata } from "next";
import PitchLab from "./PitchLab";
import styles from "./violinPitchBuilder.module.css";

export const metadata: Metadata = {
  title: "Violin Pitch Builder - Ben Chan Violin",
  description:
    "A browser-based Ben Chan Violin pitch and rhythm practice tool that detects single notes, pitch sequences, and rhythm-to-pitch notation.",
  alternates: {
    canonical: "https://benchanviolin.com/violin-pitch-builder",
  },
  openGraph: {
    title: "Violin Pitch Builder",
    description:
      "Detect violin pitches, build pitch sequences, clap rhythms, assign notes, and draw the result on a staff in your browser.",
    url: "https://benchanviolin.com/violin-pitch-builder",
    siteName: "Ben Chan Violin",
    type: "website",
  },
};

export default function ViolinPitchBuilderPage() {
  return (
    <div className={`${styles.scope} violin-pitch-builder-app`}>
      <PitchLab />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type Route = {
  id: string;
  entry: string;
  need: string;
  time: string;
  title: string;
  videoId: string;
  start: number;
  watchIf: string;
  why: string;
  notice: string;
  tryThis: string;
  tags: string[];
  notFor: string;
};

const ROUTES: Route[] = [
  {
    id: "returning-restart-short",
    entry: "returning",
    need: "restart",
    time: "short",
    title: "Rebuilding Contact After Time Away",
    videoId: "",
    start: 252,
    watchIf: "You are returning after time away and want a small, non-punishing place to begin.",
    why: "A short reset is often more useful than trying to recover everything at once.",
    notice: "Watch for what returns before deciding what needs fixing.",
    tryThis: "Play one open string slowly. Reset contact before adding speed or repertoire.",
    tags: ["returning", "restart", "5-10 minutes"],
    notFor: "Not for sharp pain, injury-related concerns, or a situation that needs a teacher who can see you.",
  },
  {
    id: "starting-practice-short",
    entry: "starting",
    need: "practice",
    time: "short",
    title: "A Realistic First Step",
    videoId: "",
    start: 0,
    watchIf: "You are new and want a grounded first page rather than a giant checklist.",
    why: "Starting small protects curiosity and gives you something real to notice.",
    notice: "Notice what you can understand before worrying about doing it perfectly.",
    tryThis: "Choose one question to carry into your first lesson or first practice session.",
    tags: ["starting fresh", "practice", "5-10 minutes"],
    notFor: "A teacher can help with instrument setup and early physical habits.",
  },
  {
    id: "stuck-problem-medium",
    entry: "stuck",
    need: "problem",
    time: "medium",
    title: "Stop Trying to Fix the Whole Problem",
    videoId: "",
    start: 0,
    watchIf: "You have a real problem but cannot yet tell which part matters most.",
    why: "Separating observation from correction can keep one issue from becoming five imagined ones.",
    notice: "Watch for the smallest observable change before assigning a cause.",
    tryThis: "Name one thing you can hear or feel without trying to correct it yet.",
    tags: ["stuck", "problem", "15-30 minutes"],
    notFor: "Use a teacher or qualified clinician for injury, persistent pain, or safety concerns.",
  },
  {
    id: "stuck-reading-medium",
    entry: "stuck",
    need: "reading",
    time: "medium",
    title: "Reading New Music Without Chasing Every Note",
    videoId: "",
    start: 0,
    watchIf: "Reading unfamiliar music feels like a flood of details.",
    why: "Reading becomes more workable when you decide what to notice first.",
    notice: "Watch how the eye and body are given fewer jobs at one time.",
    tryThis: "Read one short line while prioritizing only pulse and direction.",
    tags: ["reading", "stuck", "15-30 minutes"],
    notFor: "This is one route into reading, not a full sight-reading curriculum.",
  },
  {
    id: "helper-help-any",
    entry: "helper",
    need: "help",
    time: "any",
    title: "Helping Without Taking Over",
    videoId: "",
    start: 0,
    watchIf: "You are supporting a player without becoming their teacher or practice police.",
    why: "A useful helper protects agency before offering solutions.",
    notice: "Watch for the difference between noticing and correcting.",
    tryThis: "Ask one open question before offering a suggestion.",
    tags: ["parent", "teacher", "helper"],
    notFor: "This does not replace a player’s teacher or address family conflict.",
  },
  {
    id: "exploring-understand-long",
    entry: "exploring",
    need: "understand",
    time: "long",
    title: "Choose a Thread and Follow It",
    videoId: "",
    start: 0,
    watchIf: "You want to explore Ben’s teaching without needing a problem solved first.",
    why: "The archive is more useful when you enter through a live question rather than trying to consume it all.",
    notice: "Notice which idea keeps pulling your attention.",
    tryThis: "Choose one related resource to open next, then stop.",
    tags: ["exploring", "more time"],
    notFor: "Choose another route if you need a concrete next action.",
  },
];

const E = [
  ["returning", "Returning after time away", "Restart without trying to recover everything at once."],
  ["stuck", "Stuck on something", "Name the next useful observation before fixing too much."],
  ["starting", "Starting fresh", "Begin with one clear page, not a giant checklist."],
  ["helper", "Helping someone else", "Support a player without taking over."],
] as const;
const L = [
  ["never", "Never played"],
  ["beginner", "Beginner"],
  ["returning-player", "Returning player"],
  ["active", "Active player"],
  ["helper-level", "Teacher / parent / helper"],
] as const;
const N = [
  ["practice", "Know what to practice"],
  ["restart", "Restart well"],
  ["problem", "Solve a problem"],
  ["reading", "Read better"],
  ["understand", "Understand a piece / technique"],
  ["help", "Help someone else"],
] as const;
const T = [
  ["short", "5-10 minutes"],
  ["medium", "15-30 minutes"],
  ["long", "Longer"],
  ["any", "It varies"],
] as const;

type View = "home" | "level" | "need" | "time" | "scope" | "route" | "ask" | "resource" | "unavailable" | "check" | "nope" | "studio";

function timecode(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function hasVideo(route: Route) {
  return /^[A-Za-z0-9_-]{6,}$/.test(route.videoId || "");
}

function ChoiceList({
  items,
  onChoose,
}: {
  items: readonly (readonly [string, string] | readonly [string, string, string])[];
  onChoose: (value: string) => void;
}) {
  return (
    <div className="choices">
      {items.map(([value, label, description]) => (
        <button className="choice" data-choice={value} key={value} onClick={() => onChoose(value)}>
          <b>{label}</b>
          {description ? <small>{description}</small> : null}
        </button>
      ))}
    </div>
  );
}

function Bars({ n }: { n: number }) {
  return (
    <p className="step">
      {[1, 2, 3, 4].map((i) => (
        <i className={`bar ${i <= n ? "on" : ""}`} key={i} />
      ))}{" "}
      {String(n).padStart(2, "0")} / First Turn
    </p>
  );
}

export default function StandPartnerApp() {
  const [view, setView] = useState<View>("home");
  const [entry, setEntry] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [need, setNeed] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    document.querySelector<HTMLElement>("#app h1,#app h2")?.focus();
  }, [view]);

  function reset() {
    setEntry(null);
    setLevel(null);
    setNeed(null);
    setTime(null);
    setView("home");
  }

  function pick() {
    return (
      ROUTES.find((r) => r.entry === entry && r.need === need && (r.time === time || r.time === "any")) ||
      ROUTES.find((r) => r.entry === entry && r.need === need) ||
      ROUTES.find((r) => r.need === need) ||
      ROUTES.find((r) => r.entry === entry) ||
      ROUTES[0]
    );
  }

  function routeAction() {
    const route = pick();
    setView(hasVideo(route) ? "resource" : "unavailable");
  }

  if (view === "home") {
    return (
      <article className="card">
        <p className="eyebrow">01 / First Turn</p>
        <h2 tabIndex={-1}>Where are you today?</h2>
        <p className="helper">
          Choose the closest starting point. The same choices lead to the same route, and routing choices are not stored.
        </p>
        <p className="meta-line">No account. No AI. Routing choices are not stored.</p>
        <ChoiceList
          items={E}
          onChoose={(value) => {
            setEntry(value);
            setView("level");
          }}
        />
      </article>
    );
  }

  if (view === "level") {
    return (
      <article className="card">
        <Bars n={2} />
        <h2 tabIndex={-1}>Where are you now?</h2>
        <ChoiceList
          items={L}
          onChoose={(value) => {
            setLevel(value);
            setView("need");
          }}
        />
      </article>
    );
  }

  if (view === "need") {
    return (
      <article className="card">
        <Bars n={3} />
        <h2 tabIndex={-1}>What would help most right now?</h2>
        <ChoiceList
          items={N}
          onChoose={(value) => {
            setNeed(value);
            setView("time");
          }}
        />
      </article>
    );
  }

  if (view === "time") {
    return (
      <article className="card">
        <Bars n={4} />
        <h2 tabIndex={-1}>How much room do you have today?</h2>
        <ChoiceList
          items={T}
          onChoose={(value) => {
            setTime(value);
            setView("scope");
          }}
        />
        <p className="notice">This changes only the size of the first suggestion. Nothing is saved.</p>
      </article>
    );
  }

  if (view === "scope") {
    return (
      <article className="card">
        <p className="eyebrow">01 / First Turn</p>
        <h2 tabIndex={-1}>What this guide does and does not do</h2>
        <p className="lede">
          It turns you toward a useful page from Ben Chan Violin’s teaching. It does not diagnose your playing, replace a
          teacher, or tell you there is one correct answer.
        </p>
        <div className="buttons">
          <button className="btn" onClick={() => setView("route")}>
            Build my starting page
          </button>
          <button className="btn secondary" onClick={reset}>
            Back
          </button>
        </div>
      </article>
    );
  }

  if (view === "route") {
    const route = pick();
    const clip = hasVideo(route);
    return (
      <article className="card">
        <p className="eyebrow">02 / Your Next Page</p>
        <h2 tabIndex={-1}>Here is your next page</h2>
        <p className="helper">{route.watchIf}</p>
        <div className="tags">
          {route.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <h3>
          {clip ? `${timecode(route.start)} / ` : ""}
          {route.title}
        </h3>
        <div className="panel">
          <b>Why this page</b>
          {route.why}
        </div>
        <div className="panel">
          <b>Try this first</b>
          {route.tryThis}
        </div>
        <div className="buttons">
          <button className="btn" onClick={routeAction}>
            {clip ? "Open clip" : "Preview route"}
          </button>
          <button className="btn secondary" onClick={() => setView("ask")}>
            Turn again
          </button>
        </div>
      </article>
    );
  }

  if (view === "ask") {
    return (
      <article className="card">
        <p className="eyebrow">04 / Turn Again</p>
        <h2 tabIndex={-1}>What is going on?</h2>
        <p className="helper">Choose another route. Nothing from the prior turn is stored.</p>
        <ChoiceList
          items={N}
          onChoose={(value) => {
            setNeed(value);
            setTime(time || "any");
            setView("route");
          }}
        />
        <div className="buttons">
          <button className="btn subtle" onClick={reset}>
            Start over
          </button>
        </div>
      </article>
    );
  }

  if (view === "resource") {
    const route = pick();
    const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(route.videoId)}?start=${Number(
      route.start || 0,
    )}&rel=0`;
    return (
      <article className="card">
        <p className="eyebrow">02 / Your Next Page</p>
        <p className="helper">{route.why}</p>
        <h2 tabIndex={-1}>
          {timecode(route.start)} / {route.title}
        </h2>
        <div className="video">
          <iframe title={route.title} src={src} allowFullScreen />
        </div>
        <div className="panel">
          <b>Why this page</b>
          {route.why}
        </div>
        <div className="panel">
          <b>Try this first</b>
          {route.tryThis}
        </div>
        <p className="helper">
          <b>Boundary:</b> {route.notFor}
        </p>
        <div className="buttons">
          <button className="btn" onClick={() => setView("check")}>
            This helped
          </button>
          <button className="btn secondary" onClick={() => setView("nope")}>
            Not my issue
          </button>
          <button className="btn subtle" onClick={() => setView("ask")}>
            Turn again
          </button>
        </div>
      </article>
    );
  }

  if (view === "unavailable") {
    const route = pick();
    return (
      <article className="card">
        <p className="eyebrow">02 / Your Next Page</p>
        <p className="helper">{route.why}</p>
        <h2 tabIndex={-1}>{route.title}</h2>
        <p className="notice">
          <b>This route is not published yet.</b>
          <br />
          The recommendation text is ready, but the destination video has not been attached.
        </p>
        <div className="panel">
          <b>Why this page</b>
          {route.why}
        </div>
        <div className="panel">
          <b>Try this first</b>
          {route.tryThis}
        </div>
        <div className="buttons">
          <button className="btn" onClick={() => setView("check")}>
            This helped
          </button>
          <button className="btn secondary" onClick={() => setView("nope")}>
            Not my issue
          </button>
          <button className="btn subtle" onClick={() => setView("ask")}>
            Turn again
          </button>
        </div>
      </article>
    );
  }

  if (view === "check") {
    return (
      <article className="card">
        <p className="eyebrow">03 / Try It</p>
        <h2 tabIndex={-1}>Did this give you a useful next step?</h2>
        <ChoiceList
          items={[
            ["yes", "Yes, this helped"],
            ["somewhat", "Somewhat"],
            ["no", "No - turn again"],
          ]}
          onChoose={(value) => setView(value === "yes" ? "studio" : "ask")}
        />
        <div className="buttons">
          <button className="btn subtle" onClick={() => setView("studio")}>
            What does Stand Partner add?
          </button>
        </div>
      </article>
    );
  }

  if (view === "nope") {
    return (
      <article className="card">
        <p className="eyebrow">04 / Turn Again</p>
        <h2 tabIndex={-1}>This may not be the right page.</h2>
        <p className="lede">A wrong turn is not a failed session.</p>
        <div className="buttons">
          <button className="btn" onClick={() => setView("ask")}>
            Tell me more
          </button>
          <button className="btn secondary" onClick={reset}>
            Start over
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="card">
      <p className="eyebrow">Stand Partner</p>
      <h2 tabIndex={-1}>One page can be enough. Your playing is longer than one page.</h2>
      <p className="lede">
        The fuller tool is for ongoing routes, saved pages, personal notes, and a working playbook built from what helps
        you.
      </p>
      <div className="panel">
        <b>This free guide</b>
        One local, private route. Nothing remembered.
      </div>
      <div className="buttons">
        <button className="btn" onClick={reset}>
          Start over
        </button>
      </div>
    </article>
  );
}

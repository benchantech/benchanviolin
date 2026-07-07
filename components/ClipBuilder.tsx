"use client";

import { useState } from "react";

type ClipRecord = {
  id?: string;
  title?: string;
  videoId?: string;
  start?: number;
  entry?: string;
  need?: string;
  time?: string;
  watchIf?: string;
  why?: string;
  notice?: string;
  tryThis?: string;
  tags?: string[];
  notFor?: string;
};

export default function ClipBuilder() {
  const [output, setOutput] = useState("{}");

  function build(form: HTMLFormElement) {
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const record: ClipRecord = {
      ...values,
      start: Number(values.start || 0),
      tags: values.tags
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    };
    const json = JSON.stringify(record, null, 2);
    setOutput(json);
    return json;
  }

  return (
    <>
      <form id="f">
        <label>
          Internal ID
          <input name="id" required placeholder="bow-contact-returning-01" />
        </label>
        <label>
          Title
          <input name="title" required />
        </label>
        <label>
          YouTube video ID
          <input name="videoId" required />
        </label>
        <label>
          Start seconds
          <input name="start" type="number" min="0" defaultValue="0" />
        </label>
        <label>
          Entry
          <select name="entry" defaultValue="starting">
            <option value="starting">Starting fresh</option>
            <option value="returning">Returning</option>
            <option value="stuck">Stuck</option>
            <option value="helper">Helping someone</option>
            <option value="exploring">Exploring</option>
          </select>
        </label>
        <label>
          Need
          <select name="need" defaultValue="practice">
            <option value="practice">Practice</option>
            <option value="restart">Restart</option>
            <option value="problem">Problem</option>
            <option value="reading">Reading</option>
            <option value="understand">Understand</option>
            <option value="help">Help</option>
          </select>
        </label>
        <label>
          Time
          <select name="time" defaultValue="short">
            <option value="short">5–10 min</option>
            <option value="medium">15–30 min</option>
            <option value="long">Longer</option>
            <option value="any">Any</option>
          </select>
        </label>
        <label>
          Watch if
          <textarea name="watchIf" required />
        </label>
        <label>
          Why
          <textarea name="why" required />
        </label>
        <label>
          What to notice
          <textarea name="notice" required />
        </label>
        <label>
          Try this
          <textarea name="tryThis" required />
        </label>
        <label>
          Tags (comma-separated)
          <input name="tags" />
        </label>
        <label>
          Not for / boundary
          <textarea name="notFor" required />
        </label>
      </form>
      <div className="buttons">
        <button
          className="btn"
          id="gen"
          onClick={() => {
            const form = document.querySelector<HTMLFormElement>("#f");
            if (form) build(form);
          }}
        >
          Generate JSON
        </button>
        <button
          className="btn secondary"
          id="copy"
          onClick={async () => {
            const form = document.querySelector<HTMLFormElement>("#f");
            if (form) {
              const json = build(form);
              await navigator.clipboard.writeText(json);
            }
          }}
        >
          Copy JSON
        </button>
        <button
          className="btn subtle"
          id="dl"
          onClick={() => {
            const form = document.querySelector<HTMLFormElement>("#f");
            if (!form) return;
            const json = build(form);
            const record = JSON.parse(json) as ClipRecord;
            const anchor = document.createElement("a");
            anchor.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
            anchor.download = `${record.id || "clip"}.json`;
            anchor.click();
          }}
        >
          Download JSON
        </button>
      </div>
      <h3>Output</h3>
      <pre id="out">{output}</pre>
    </>
  );
}

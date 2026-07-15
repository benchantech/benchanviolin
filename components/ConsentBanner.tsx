"use client";

import { useEffect, useState } from "react";

type ConsentChoice = "granted" | "denied";

const storageKey = "bcv_analytics_consent";

function updateConsent(choice: ConsentChoice) {
  window.gtag?.("consent", "update", {
    analytics_storage: choice,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export function ConsentBanner() {
  const [choice, setChoice] = useState<ConsentChoice | null | "unknown">("unknown");

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "granted" || stored === "denied") {
      setChoice(stored);
      updateConsent(stored);
      return;
    }

    setChoice(null);
  }, []);

  function choose(nextChoice: ConsentChoice) {
    window.localStorage.setItem(storageKey, nextChoice);
    updateConsent(nextChoice);
    setChoice(nextChoice);
  }

  if (choice !== null || !process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return null;

  return (
    <section className="consent-banner" aria-label="Analytics cookie notice">
      <p>
        BenChanViolin.com uses Google Analytics to understand aggregate library use. Analytics cookies are optional.
      </p>
      <div>
        <button className="btn secondary" type="button" onClick={() => choose("denied")}>
          Decline
        </button>
        <button className="btn" type="button" onClick={() => choose("granted")}>
          Allow analytics
        </button>
      </div>
    </section>
  );
}

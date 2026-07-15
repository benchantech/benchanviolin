/**
 * BenChanViolin deterministic technical router
 *
 * Governing rule:
 *   Outsource retrieval; do not outsource judgment.
 *
 * This file performs deterministic routing BEFORE any database query.
 * It uses only:
 *   - text normalization
 *   - exact phrase matches
 *   - token-group matches
 *   - explicit exclusions
 *   - fixed precedence
 *   - fixed branch questions
 *
 * It does NOT use:
 *   - an LLM
 *   - embeddings
 *   - semantic similarity
 *   - database ranking
 *   - probabilistic classification
 *
 * Authoritative outcomes:
 *   DIRECT       A governed route matched.
 *   BRANCH       A governed route matched but needs one fixed clarification.
 *   CONFIRM      More than one governed route matched closely; user chooses.
 *   FALLBACK     No governed route matched. Ordinary library search may run.
 *
 * Recommended server flow:
 *
 *   const governed = routeTechnicalQuestion(query);
 *
 *   if (governed.kind !== "FALLBACK") {
 *     return governed; // Do not call fuzzy DB search.
 *   }
 *
 *   const results = await searchLibrary(governed.fallbackQuery);
 *   return { ...governed, results };
 */

"use strict";

/** @typedef {"DIRECT"|"BRANCH"|"CONFIRM"|"FALLBACK"} RouteKind */

/**
 * @typedef {Object} RouteDefinition
 * @property {string} id
 * @property {string} label
 * @property {string} domain
 * @property {number} priority
 * @property {string[]} exact
 * @property {string[][]} tokenGroups
 * @property {string[]} exclude
 * @property {string} summary
 * @property {string} firstAction
 * @property {string} verification
 * @property {string} stopCondition
 * @property {string[]} searchTerms
 * @property {{prompt:string, options:Array<{id:string,label:string,result:Partial<RoutePayload>}>}|null} branch
 */

/**
 * @typedef {Object} RoutePayload
 * @property {string} routeId
 * @property {string} label
 * @property {string} domain
 * @property {string} summary
 * @property {string} firstAction
 * @property {string} verification
 * @property {string} stopCondition
 * @property {string[]} searchTerms
 */

/**
 * @typedef {Object} RouteResult
 * @property {RouteKind} kind
 * @property {string} normalizedQuery
 * @property {"governed"|"archive"} authority
 * @property {RoutePayload=} route
 * @property {{prompt:string,options:Array<{id:string,label:string}>}=} branch
 * @property {Array<{routeId:string,label:string}>=} candidates
 * @property {string=} fallbackQuery
 * @property {string=} message
 */

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "could",
  "do", "does", "for", "from", "get", "gets", "getting", "how", "i", "im",
  "in", "into", "is", "it", "my", "of", "on", "or", "the", "this", "to",
  "too", "when", "why", "with", "wont"
]);

const CONTRACTIONS = [
  [/\bcan't\b/g, "cannot"],
  [/\bwon't\b/g, "will not"],
  [/\bdoesn't\b/g, "does not"],
  [/\bdon't\b/g, "do not"],
  [/\bi'm\b/g, "im"],
  [/\bit's\b/g, "it is"]
];

function normalizeText(input) {
  let value = String(input ?? "").toLowerCase().normalize("NFKD");

  for (const [pattern, replacement] of CONTRACTIONS) {
    value = value.replace(pattern, replacement);
  }

  return value
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9#+\s-]/g, " ")
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const TOKEN_CANONICAL = Object.freeze({
  aches: "pain",
  aching: "pain",
  bounces: "bounce",
  bouncing: "bounce",
  fingers: "finger",
  hurts: "pain",
  hurting: "pain",
  lands: "land",
  notes: "note",
  pegs: "peg",
  shifts: "shift",
  slipping: "slip",
  strings: "string",
  trembles: "tremble"
});

function canonicalToken(token) {
  return TOKEN_CANONICAL[token] ?? token;
}

function tokenize(normalized) {
  return normalized
    .split(" ")
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token))
    .map(canonicalToken);
}

function hasPhrase(text, phrase) {
  const normalizedPhrase = normalizeText(phrase);
  return (
    text === normalizedPhrase ||
    text.startsWith(normalizedPhrase + " ") ||
    text.endsWith(" " + normalizedPhrase) ||
    text.includes(" " + normalizedPhrase + " ")
  );
}

function containsAny(text, phrases) {
  return phrases.some((phrase) => hasPhrase(text, phrase));
}

function matchesTokenGroup(tokens, group) {
  const set = new Set(tokens);
  return group.every((required) => {
    if (Array.isArray(required)) {
      return required.some((alternative) => set.has(canonicalToken(alternative)));
    }
    return set.has(canonicalToken(required));
  });
}

function buildPayload(route) {
  return {
    routeId: route.id,
    label: route.label,
    domain: route.domain,
    summary: route.summary,
    firstAction: route.firstAction,
    verification: route.verification,
    stopCondition: route.stopCondition,
    searchTerms: [...route.searchTerms]
  };
}

const ROUTES = [
  // TIER 1: LEARNER-NOTICED TONE AND CONTACT PROBLEMS
  {
    id: "tone-scratch",
    label: "My violin sounds scratchy",
    domain: "Tone and bow contact",
    priority: 100,
    exact: [
      "my violin sounds scratchy", "scratchy tone", "scratchy sound",
      "harsh tone", "harsh sound", "bow sounds scratchy", "crunchy sound",
      "grinding sound"
    ],
    tokenGroups: [
      ["scratchy", "tone"], ["scratchy", "sound"], ["harsh", "tone"], ["grinding", "bow"]
    ],
    exclude: ["intentional scratch", "col legno", "extended technique"],
    summary: "Scratch usually means the bow is exceeding the string's workable balance of weight, speed, and contact point.",
    firstAction: "On an open string in the middle bow, keep contact point fixed and reduce added pressure until the sound clears.",
    verification: "The pitch core should become clearer without the sound turning thin or airy.",
    stopCondition: "Stop once three medium bows stay clean; then restore the original note or passage.",
    searchTerms: ["scratchy tone", "bow pressure", "contact point", "tone production"],
    branch: null
  },
  {
    id: "tone-airy",
    label: "My sound is weak, airy, or unfocused",
    domain: "Tone and bow contact",
    priority: 98,
    exact: [
      "my sound is weak", "my sound is airy", "my sound is unfocused",
      "airy tone", "airy sound", "weak tone", "thin tone", "fuzzy tone",
      "unfocused tone", "no core in sound", "sound has no core"
    ],
    tokenGroups: [
      ["airy", "tone"], ["weak", "tone"], ["thin", "sound"], ["unfocused", "sound"]
    ],
    exclude: ["sul tasto effect", "intentional airy"],
    summary: "The string may not be receiving enough usable bow weight, or the bow may be moving too quickly for the chosen contact point.",
    firstAction: "Move a little closer to the bridge, slow the bow slightly, and let natural arm weight enter without squeezing.",
    verification: "The sound should gain a centered pitch core before it becomes loud.",
    stopCondition: "Stop once the tone centers; do not keep adding weight after the core appears.",
    searchTerms: ["airy tone", "weak sound", "bow weight", "contact point"],
    branch: null
  },
  {
    id: "tone-crushed",
    label: "My sound is crushed or choked",
    domain: "Tone and bow contact",
    priority: 99,
    exact: [
      "my sound is crushed", "my sound is choked", "crushed tone",
      "choked tone", "pressed sound", "stuck sound", "bow feels stuck",
      "sound is choked", "tone is pressed"
    ],
    tokenGroups: [
      ["crushed", "tone"], ["choked", "sound"], ["pressed", "tone"],
      ["bow", "stuck"]
    ],
    exclude: [],
    summary: "The bow is likely moving too slowly for the amount of weight being applied.",
    firstAction: "Keep the contact point unchanged and increase bow speed before changing anything else.",
    verification: "The sound should open immediately while retaining pitch focus.",
    stopCondition: "Stop when the tone opens; further speed may make it unfocused.",
    searchTerms: ["crushed tone", "pressed sound", "bow speed"],
    branch: null
  },
  {
    id: "tone-inconsistent",
    label: "My tone changes unpredictably",
    domain: "Tone and bow contact",
    priority: 91,
    exact: [
      "inconsistent tone", "tone keeps changing", "sound keeps changing",
      "uneven tone", "tone is unstable"
    ],
    tokenGroups: [
      ["inconsistent", "tone"], ["uneven", "tone"], ["unstable", "sound"]
    ],
    exclude: [],
    summary: "The sound variables are changing together, making the cause difficult to isolate.",
    firstAction: "Hold contact point and bow speed constant on one open string. Change only bow weight until the tone stabilizes.",
    verification: "You should be able to repeat the same sound three times without correcting mid-bow.",
    stopCondition: "Once repeatable, change only one additional variable.",
    searchTerms: ["consistent tone", "bow variables", "open string tone"],
    branch: null
  },
  {
    id: "contact-point-unclear",
    label: "I do not know where the bow should contact the string",
    domain: "Tone and bow contact",
    priority: 97,
    exact: [
      "where should the bow contact the string", "i do not know where the bow should contact the string",
      "where should i bow", "contact point confusion", "bow too close to bridge",
      "bow too close to fingerboard", "how much bow pressure to use", "do not know how much bow pressure"
    ],
    tokenGroups: [
      ["bow", "contact", "string"], ["contact", "point"], ["bow", "bridge"], ["bow", "fingerboard"], ["bow", "pressure"]
    ],
    exclude: [],
    summary: "Contact point, bow speed, and bow weight have to be chosen together; there is no single correct lane for every note.",
    firstAction: "On one open string, choose a middle contact point and make three bows changing only speed. Notice when the sound opens or thins.",
    verification: "You can name whether the current sound needs more speed, less pressure, or a different contact point.",
    stopCondition: "Stop once one usable contact point produces a repeatable sound.",
    searchTerms: ["contact point", "bow pressure", "bow speed", "tone production"],
    branch: null
  },

  // TIER 1: BOW CONTROL AND BOW HAND
  {
    id: "bow-bounce-unwanted",
    label: "My bow keeps bouncing when I do not want it to",
    domain: "Bow control",
    priority: 110,
    exact: [
      "bow keeps bouncing", "bow is bouncing", "unwanted bow bounce",
      "unwanted bow bounce or shaking",
      "bow shakes", "bow is shaking", "bow hops", "bow trembles",
      "shaky bow", "nervous bow"
    ],
    tokenGroups: [
      ["bow", "bouncing"], ["bow", "shakes"], ["bow", "shaking"],
      ["shaky", "bow"], ["bow", "trembles"]
    ],
    exclude: [
      "spiccato", "ricochet", "sautille", "saltando",
      "intentional bounce", "how to bounce bow"
    ],
    summary: "Unwanted bounce is a stability problem, not an instruction to practice spiccato.",
    firstAction: "Move to the middle-lower half, use a slower sustained bow, and let the fingers remain responsive instead of forcing the bow downward.",
    verification: "The bow should remain connected through a full slow stroke without a second impact.",
    stopCondition: "Stop once three connected bows remain stable; then return gradually to the original stroke.",
    searchTerms: ["bow bounce", "shaky bow", "bow hand relaxation", "bow stability"],
    branch: {
      prompt: "When does the unwanted bounce happen most?",
      options: [
        {
          id: "slow-sustained",
          label: "During slow or sustained bows",
          result: {
            summary: "Bounce during sustained bows points first to vertical force, rigid joints, or crossing a resonant point too slowly.",
            firstAction: "Reduce downward force and allow slightly more bow speed through the unstable region."
          }
        },
        {
          id: "short-strokes",
          label: "During short strokes",
          result: {
            summary: "Short-stroke bounce may be an uncontrolled version of an off-string stroke.",
            firstAction: "Practice the stroke on the string first with a smaller motion and no deliberate lift."
          }
        },
        {
          id: "performance",
          label: "Mostly when nervous or performing",
          result: {
            summary: "Performance-only bow tremor is not primarily a technique-routing problem.",
            firstAction: "Use a slightly faster bow, avoid holding the bow motionless before the entrance, and simplify the opening dynamic."
          }
        }
      ]
    }
  },
  {
    id: "bow-crooked",
    label: "I cannot keep the bow straight",
    domain: "Bow control",
    priority: 96,
    exact: [
      "bow is crooked", "crooked bow", "bow not straight",
      "cannot keep bow straight", "bow drifts", "bow slides toward fingerboard",
      "bow slides toward bridge"
    ],
    tokenGroups: [
      ["bow", "crooked"], ["bow", "straight"], ["bow", "drifts"]
    ],
    exclude: [],
    summary: "A crooked bow reflects an arm-path problem relative to the chosen contact point.",
    firstAction: "Use a mirror on one open string. Pause at frog, middle, and tip, correcting the arm path rather than twisting the wrist.",
    verification: "The bow hair should remain parallel to the bridge at all three checkpoints.",
    stopCondition: "Stop checkpoint practice once the bow stays parallel through three whole bows.",
    searchTerms: ["straight bow", "bow path", "parallel to bridge"],
    branch: null
  },
  {
    id: "bow-change-bump",
    label: "My bow changes make a bump or accent",
    domain: "Bow control",
    priority: 99,
    exact: [
      "bump at bow change", "accent at bow change", "bow change is rough",
      "bow changes are audible", "click at bow change", "jerk at bow change"
    ],
    tokenGroups: [
      ["bump", "bow", "change"], ["accent", "bow", "change"],
      ["rough", "bow", "change"], ["audible", "bow", "change"]
    ],
    exclude: [],
    summary: "The change is likely being produced by stopping, squeezing, or reversing too abruptly.",
    firstAction: "Reduce speed slightly before the end of the bow, keep the string engaged, and reverse without adding pressure.",
    verification: "The direction changes while the sound remains continuous.",
    stopCondition: "Stop once five changes are continuous at one dynamic.",
    searchTerms: ["smooth bow changes", "bow reversal", "seamless bow"],
    branch: null
  },
  {
    id: "bow-running-out",
    label: "I run out of bow",
    domain: "Bow control",
    priority: 94,
    exact: [
      "running out of bow", "run out of bow", "not enough bow",
      "cannot finish phrase with bow", "use too much bow"
    ],
    tokenGroups: [
      ["running", "bow"], ["enough", "bow"], ["finish", "phrase", "bow"]
    ],
    exclude: [],
    summary: "Bow distribution is misaligned with phrase length, dynamic, or note value.",
    firstAction: "Mark the midpoint of the phrase and decide in advance where the bow should be at that moment.",
    verification: "You arrive at the phrase midpoint near the planned bow location without a last-second correction.",
    stopCondition: "Stop once the bow plan survives three full phrase repetitions.",
    searchTerms: ["bow distribution", "save bow", "phrase planning"],
    branch: null
  },
  {
    id: "string-crossing-accent",
    label: "My string crossings are noisy or I hit two strings",
    domain: "Bow control",
    priority: 102,
    exact: [
      "accent on string crossing", "noise on string crossing",
      "string crossings are rough", "string changes are noisy",
      "bump when changing strings", "hit two strings accidentally"
    ],
    tokenGroups: [
      ["accent", "string", "crossing"], ["noise", "string", "crossing"],
      ["rough", "string", "crossing"], ["two", "strings", "accidentally"]
    ],
    exclude: ["double stop", "chord"],
    summary: "The bow level is changing too late, too far, or with excess vertical force.",
    firstAction: "Prepare the new string level before the note change using the smallest arm-level adjustment possible.",
    verification: "The new string speaks without an added accent or accidental neighboring string.",
    stopCondition: "Stop after five clean crossings at a slow tempo, then restore rhythm.",
    searchTerms: ["string crossings", "bow levels", "clean string changes"],
    branch: null
  },
  {
    id: "bow-hand-tension",
    label: "My bow hand is tense or I am squeezing the bow",
    domain: "Bow hand",
    priority: 105,
    exact: [
      "tense bow hand", "bow hand is tense", "squeezing bow",
      "gripping bow", "tight bow hand", "bow thumb tension",
      "locking bow thumb"
    ],
    tokenGroups: [
      ["tense", "bow", "hand"], ["tight", "bow", "hand"],
      ["gripping", "bow"], ["bow", "thumb", "tension"]
    ],
    exclude: [],
    summary: "The hand is using sustained gripping force where responsive contact would be enough; the answer is not simply 'relax.'",
    firstAction: "At the balance point, hold the bow with the minimum contact needed to prevent dropping it, then make small horizontal strokes.",
    verification: "The fingers can flex while the bow remains secure.",
    stopCondition: "Stop once the hand stays responsive for five small strokes; do not chase complete limpness.",
    searchTerms: ["bow hand tension", "relaxed bow hold", "bow thumb"],
    branch: null
  },
  {
    id: "bow-thumb-lock",
    label: "My bow thumb locks",
    domain: "Bow hand",
    priority: 99,
    exact: [
      "my bow thumb locks", "bow thumb locks", "bow thumb is locked",
      "bow thumb is stiff", "thumb locks on bow", "thumb is tense on bow"
    ],
    tokenGroups: [["bow", "thumb", "locks"], ["bow", "thumb", "stiff"], ["thumb", "tense", "bow"]],
    exclude: ["left thumb", "violin neck"],
    summary: "A locked bow thumb usually means the hand is using the thumb as a brace instead of a spring.",
    firstAction: "At the balance point, make tiny horizontal strokes while the thumb stays bent enough to pulse gently.",
    verification: "The thumb can change shape slightly without the bow feeling insecure.",
    stopCondition: "Stop after five tiny strokes with a responsive thumb.",
    searchTerms: ["bow thumb", "bow hold", "flexible thumb"],
    branch: null
  },
  {
    id: "bow-pinky-collapse",
    label: "My bow pinky collapses",
    domain: "Bow hand",
    priority: 92,
    exact: [
      "bow pinky collapses", "pinky straight on bow", "bow pinky locks",
      "cannot curve bow pinky", "fourth finger collapses on bow"
    ],
    tokenGroups: [
      ["bow", "pinky", "collapses"], ["bow", "pinky", "straight"],
      ["bow", "pinky", "locks"]
    ],
    exclude: ["left hand pinky", "fourth finger intonation"],
    summary: "The pinky may be carrying more balancing force than the hand position can support.",
    firstAction: "Place the bow at the balance point and form a curved pinky without lifting the bow. Move only a few centimeters.",
    verification: "The pinky remains spring-like rather than rigid or collapsed.",
    stopCondition: "Stop once the curve remains during five small strokes.",
    searchTerms: ["bow pinky", "bow hold balance", "curved pinky"],
    branch: null
  },

  // TIER 1: LEFT HAND AND INTONATION
  {
    id: "left-hand-squeeze",
    label: "My left hand squeezes the neck",
    domain: "Left hand",
    priority: 106,
    exact: [
      "squeezing violin neck", "left hand squeezes", "thumb squeezes neck",
      "tight left hand", "gripping violin neck", "left thumb tension"
    ],
    tokenGroups: [
      ["left", "hand", "squeezes"], ["thumb", "squeezes", "neck"],
      ["tight", "left", "hand"], ["gripping", "violin", "neck"]
    ],
    exclude: ["bow hand"],
    summary: "The hand is using the thumb and fingers to secure the instrument or force notes down.",
    firstAction: "On one stopped note, briefly release thumb pressure while keeping the note sounding, then restore only light contact.",
    verification: "The pitch and sound remain stable during the brief thumb release.",
    stopCondition: "Stop after five successful releases; do not remove the thumb permanently.",
    searchTerms: ["left hand tension", "thumb pressure", "squeezing neck"],
    branch: null
  },
  {
    id: "left-finger-collapse",
    label: "My fingers collapse",
    domain: "Left hand",
    priority: 95,
    exact: [
      "finger collapses", "knuckle collapses", "flat finger violin",
      "finger joint collapses", "left finger collapses"
    ],
    tokenGroups: [
      ["finger", "collapses"], ["knuckle", "collapses"],
      ["finger", "joint", "collapses"]
    ],
    exclude: ["bow pinky", "bow hand"],
    summary: "The finger is contacting the string from an angle or force level that the joint cannot support.",
    firstAction: "Place the fingertip closer to its natural pad-tip edge and use only enough pressure to stop the string cleanly.",
    verification: "The joint remains rounded while the pitch speaks clearly.",
    stopCondition: "Stop once the finger repeats five placements without collapsing.",
    searchTerms: ["collapsed finger", "left hand frame", "finger placement"],
    branch: null
  },
  {
    id: "fourth-finger-weak",
    label: "My fourth finger is weak, flat, or hard to reach",
    domain: "Left hand",
    priority: 104,
    exact: [
      "weak fourth finger", "fourth finger is weak", "pinky is weak violin",
      "fourth finger flat", "cannot reach fourth finger",
      "fourth finger collapses", "fourth finger intonation"
    ],
    tokenGroups: [
      ["fourth", "finger", "weak"], ["fourth", "finger", "flat"],
      ["reach", "fourth", "finger"], ["fourth", "finger", "intonation"]
    ],
    exclude: ["bow pinky", "bow fourth finger"],
    summary: "Fourth-finger reliability depends more on hand frame and approach angle than isolated finger strength.",
    firstAction: "Set the first three fingers lightly, bring the hand frame toward the fourth finger, and place the fourth without stretching it sideways.",
    verification: "The fourth finger lands with a rounded joint and matches the adjacent open string where applicable.",
    stopCondition: "Stop after five accurate placements; avoid fatigue-based repetitions.",
    searchTerms: ["fourth finger", "left hand frame", "pinky intonation"],
    branch: null
  },
  {
    id: "finger-speed",
    label: "My fingers lift too high or feel too slow",
    domain: "Left hand",
    priority: 90,
    exact: [
      "my fingers lift too high", "fingers lift too high", "fingers are too slow",
      "slow left fingers", "cannot move fingers fast", "left hand slow fast passage",
      "fingers lag behind bow"
    ],
    tokenGroups: [
      ["fingers", "slow"], ["fingers", "lift", "high"], ["left", "hand", "slow"],
      ["fingers", "lag", "bow"]
    ],
    exclude: [],
    summary: "The issue may be excess finger height, excess pressure, or coordination rather than raw speed.",
    firstAction: "Play the passage silently with minimal finger lift, then add the bow at half tempo without increasing finger pressure.",
    verification: "The fingers arrive before or exactly with the bow rather than chasing it.",
    stopCondition: "Stop once coordination is clean at three consecutive repetitions.",
    searchTerms: ["finger speed", "left hand efficiency", "fast passages"],
    branch: null
  },

  {
    id: "intonation-general",
    label: "My notes are generally out of tune",
    domain: "Intonation",
    priority: 88,
    exact: [
      "notes are out of tune", "intonation is bad", "play out of tune",
      "cannot play in tune", "pitch is inaccurate", "intonation problems"
    ],
    tokenGroups: [
      ["notes", "tune"], ["intonation", "bad"], ["pitch", "inaccurate"]
    ],
    exclude: ["metaphor", "instrument is out of tune", "tuning pegs"],
    summary: "General intonation improves fastest when the ear has a clear target and the hand repeats a stable frame.",
    firstAction: "Choose one short interval pattern, sing or hear the target first, then place without sliding and check after the attempt.",
    verification: "The correction becomes smaller across repetitions rather than being rediscovered each time.",
    stopCondition: "Stop after three accurate repetitions from a fresh start.",
    searchTerms: ["intonation", "playing in tune", "pitch accuracy"],
    branch: {
      prompt: "Which situation causes the largest intonation failure?",
      options: [
        {
          id: "first-position",
          label: "Ordinary notes in first position",
          result: {
            summary: "First-position instability points first to hand frame, interval hearing, and inconsistent finger placement.",
            searchTerms: ["first position intonation", "hand frame", "intervals"]
          }
        },
        {
          id: "shifts",
          label: "After shifting",
          result: {
            routeId: "shifting-inconsistent",
            label: "Shifts land inconsistently",
            summary: "Post-shift intonation is governed by the shifting route rather than general finger placement.",
            searchTerms: ["shifting", "shift intonation", "guide finger"]
          }
        },
        {
          id: "double-stops",
          label: "In double stops or chords",
          result: {
            routeId: "double-stop-intonation",
            label: "Double-stop intonation",
            summary: "Double-stop tuning requires interval and resonance checks, not two isolated single-note corrections.",
            searchTerms: ["double stop intonation", "interval tuning", "resonance"]
          }
        },
        {
          id: "high-position",
          label: "High on the fingerboard",
          result: {
            routeId: "high-position-intonation",
            label: "High-position intonation",
            summary: "High-position spacing compresses and must be organized around stable landmarks.",
            searchTerms: ["high position intonation", "compressed spacing", "fingerboard geography"]
          }
        }
      ]
    }
  },
  {
    id: "shifting-inconsistent",
    label: "My shifts land out of tune",
    domain: "Shifting",
    priority: 108,
    exact: [
      "shifts are inconsistent", "shift lands out of tune",
      "missing shifts", "cannot land shift", "shifting intonation",
      "overshoot shift", "undershoot shift"
    ],
    tokenGroups: [
      ["shift", "tune"], ["shifts", "inconsistent"],
      ["missing", "shifts"], ["land", "shift"]
    ],
    exclude: [],
    summary: "An inconsistent shift usually lacks one stable step: departure, travel, arrival, or verification.",
    firstAction: "Practice only the departure note, guide motion, and arrival note. Keep the thumb and hand traveling together.",
    verification: "The arrival pitch is reproducible without a last-second slide correction.",
    stopCondition: "Stop after three clean arrivals from a fresh reset.",
    searchTerms: ["shifting", "guide finger", "shift intonation", "arrival note"],
    branch: null
  },
  {
    id: "double-stop-intonation",
    label: "My double stops sound wrong even when each note seems right",
    domain: "Intonation",
    priority: 107,
    exact: [
      "double stops out of tune", "double stop intonation",
      "notes in tune separately but not together", "thirds out of tune",
      "sixths out of tune", "octaves out of tune"
    ],
    tokenGroups: [
      ["double", "stops", "tune"], ["thirds", "tune"],
      ["sixths", "tune"], ["octaves", "tune"]
    ],
    exclude: [],
    summary: "Two notes that seem acceptable separately may still form an unstable interval together.",
    firstAction: "Tune the structurally stable note first, then add the second note and listen for beating or resonance rather than checking each note independently.",
    verification: "The interval settles and resonance increases as beating decreases.",
    stopCondition: "Stop after three stable interval attacks from silence.",
    searchTerms: ["double stop intonation", "thirds", "sixths", "octaves", "resonance"],
    branch: null
  },
  {
    id: "high-position-intonation",
    label: "My high-position intonation is unreliable",
    domain: "Intonation",
    priority: 97,
    exact: [
      "high position out of tune", "upper position intonation",
      "high notes out of tune", "intonation high on fingerboard",
      "notes too close high position"
    ],
    tokenGroups: [
      ["high", "position", "tune"], ["upper", "position", "intonation"],
      ["high", "notes", "tune"]
    ],
    exclude: [],
    summary: "Finger spacing compresses in higher positions, so low-position spacing habits become inaccurate.",
    firstAction: "Anchor one known pitch in the position, then map a small interval around it without carrying first-position spacing upward.",
    verification: "The neighboring interval sounds correct without widening after placement.",
    stopCondition: "Stop once the local three-note map repeats accurately.",
    searchTerms: ["high position intonation", "compressed finger spacing", "fingerboard geography"],
    branch: null
  },
  {
    id: "pitch-recognition",
    label: "I cannot tell whether I am sharp or flat",
    domain: "Intonation",
    priority: 100,
    exact: [
      "cannot tell if in tune", "cannot hear intonation",
      "do not know if note is sharp or flat", "cannot hear pitch",
      "intonation sounds same to me"
    ],
    tokenGroups: [
      ["tell", "tune"], ["hear", "intonation"],
      ["sharp", "flat", "know"]
    ],
    exclude: [],
    summary: "The immediate problem is target recognition, not finger correction.",
    firstAction: "Play or sing the target pitch, pause, then reproduce it. Compare only after committing to the attempt.",
    verification: "You can identify whether the second pitch is higher or lower before moving the finger.",
    stopCondition: "Stop after five correct higher/lower judgments.",
    searchTerms: ["hearing intonation", "pitch recognition", "sharp or flat"],
    branch: null
  },

  // TIER 2: SHIFTING AND VIBRATO
  {
    id: "shift-sequence",
    label: "I tense up, overshoot, or undershoot shifts",
    domain: "Shifting",
    priority: 103,
    exact: [
      "i overshoot shifts", "overshoot shifts", "i undershoot shifts", "undershoot shifts",
      "i tense up before shifting", "tense before shifting", "shift sounds like a slide",
      "my shift sounds like a slide", "hand and thumb do not move together",
      "what finger should guide the shift", "guide finger shift"
    ],
    tokenGroups: [
      ["overshoot", "shift"], ["undershoot", "shift"], ["tense", "shifting"],
      ["shift", "slide"], ["thumb", "shift"], ["guide", "shift"]
    ],
    exclude: [],
    summary: "Shifting should be reduced to departure, travel, arrival, and verification rather than corrected only at the destination.",
    firstAction: "Practice the departure note, release, guide motion, and arrival note as one small sequence with the thumb traveling with the hand.",
    verification: "The arrival is close before any corrective slide.",
    stopCondition: "Stop after three clean arrivals from a full reset.",
    searchTerms: ["shifting", "guide finger", "shift sequence", "thumb movement"],
    branch: null
  },
  {
    id: "vibrato-start",
    label: "I cannot start vibrato",
    domain: "Vibrato",
    priority: 106,
    exact: [
      "cannot do vibrato", "vibrato will not start", "how to start vibrato",
      "no vibrato", "vibrato motion stuck"
    ],
    tokenGroups: [
      ["start", "vibrato"], ["cannot", "vibrato"],
      ["vibrato", "stuck"]
    ],
    exclude: [],
    summary: "The first goal is a repeatable loose oscillation, not a polished sound.",
    firstAction: "Without the bow, place one finger lightly and rock the hand slowly through a small, even backward-and-return motion.",
    verification: "The finger joint and hand move repeatedly without squeezing or stopping.",
    stopCondition: "Stop after ten loose cycles; do not accelerate a tense motion.",
    searchTerms: ["starting vibrato", "vibrato motion", "relaxed vibrato"],
    branch: null
  },
  {
    id: "vibrato-tense",
    label: "My vibrato is tense or my thumb squeezes",
    domain: "Vibrato",
    priority: 104,
    exact: [
      "tense vibrato", "vibrato is tense", "tight vibrato",
      "vibrato gets stuck", "squeezing during vibrato"
    ],
    tokenGroups: [
      ["tense", "vibrato"], ["tight", "vibrato"],
      ["vibrato", "stuck"], ["squeezing", "vibrato"]
    ],
    exclude: [],
    summary: "The oscillation is being constrained by excess fingertip, thumb, or hand pressure.",
    firstAction: "Reduce fingertip pressure until the pitch almost fails, then restore only enough contact for the note to speak while keeping the rocking motion.",
    verification: "The motion continues without the thumb clamping or the fingertip locking.",
    stopCondition: "Stop when the loose motion repeats for ten cycles.",
    searchTerms: ["tense vibrato", "vibrato pressure", "relaxed vibrato"],
    branch: null
  },
  {
    id: "vibrato-uneven",
    label: "My vibrato is uneven",
    domain: "Vibrato",
    priority: 96,
    exact: [
      "uneven vibrato", "irregular vibrato", "vibrato rhythm uneven",
      "vibrato speeds up and slows down"
    ],
    tokenGroups: [
      ["uneven", "vibrato"], ["irregular", "vibrato"],
      ["vibrato", "rhythm", "uneven"]
    ],
    exclude: [],
    summary: "The oscillation lacks a stable pulse before speed is added.",
    firstAction: "Practice slow measured oscillations against a steady beat, keeping the motion width unchanged.",
    verification: "Each cycle aligns with the pulse without tightening.",
    stopCondition: "Stop after two stable tempo levels; do not accelerate past control.",
    searchTerms: ["even vibrato", "vibrato rhythm", "measured vibrato"],
    branch: null
  },

  // TIER 2: ARTICULATION
  {
    id: "spiccato-control",
    label: "My spiccato will not bounce or bounces too high",
    domain: "Articulation",
    priority: 101,
    exact: [
      "spiccato uncontrolled", "spiccato too high", "spiccato will not bounce",
      "spiccato uneven", "how to control spiccato"
    ],
    tokenGroups: [
      ["spiccato", "uncontrolled"], ["spiccato", "uneven"],
      ["control", "spiccato"]
    ],
    exclude: ["unwanted bow bounce", "shaky bow"],
    summary: "Controlled spiccato emerges from a small horizontal stroke interacting with the bow's natural spring.",
    firstAction: "At the balance region, make a small on-string stroke and gradually reduce contact instead of lifting the bow deliberately.",
    verification: "The bow returns predictably with a low, even rebound.",
    stopCondition: "Stop after eight even strokes; do not increase height before control.",
    searchTerms: ["spiccato", "bow bounce", "off string stroke"],
    branch: null
  },
  {
    id: "articulation-release",
    label: "My staccato, détaché, or martelé is tight or uneven",
    domain: "Articulation",
    priority: 90,
    exact: [
      "staccato uneven", "staccato too tight", "cannot do staccato",
      "up bow staccato not working", "detache sounds accented", "détaché sounds accented",
      "martele does not release", "martelé does not release", "martele tight"
    ],
    tokenGroups: [
      ["staccato", "uneven"], ["staccato", "tight"],
      ["detache", "accented"], ["martele", "release"]
    ],
    exclude: [],
    summary: "Most tight articulation problems are release problems, not impact problems.",
    firstAction: "Play two notes and deliberately release pressure immediately after the front of each note.",
    verification: "Each start speaks clearly and the hand softens before the next start.",
    stopCondition: "Stop once two impulses are repeatable, then add only one note.",
    searchTerms: ["staccato", "detache", "martele", "bow articulation"],
    branch: null
  },

  // TIER 3: PRACTICE AND COORDINATION
  {
    id: "hands-not-together",
    label: "My left and right hands are not together",
    domain: "Coordination",
    priority: 104,
    exact: [
      "hands not together", "left and right hand not coordinated",
      "fingers and bow not together", "bow and fingers out of sync",
      "coordination problem violin"
    ],
    tokenGroups: [
      ["hands", "together"], ["bow", "fingers", "sync"],
      ["left", "right", "coordinated"]
    ],
    exclude: [],
    summary: "The two hands are executing different timing plans.",
    firstAction: "Reduce the passage to two notes. Prepare the left finger before the bow changes, then restore exact simultaneity.",
    verification: "The new pitch begins cleanly with no smear or delayed finger.",
    stopCondition: "Stop after five clean two-note cycles, then add one note.",
    searchTerms: ["left right coordination", "bow finger synchronization", "coordination"],
    branch: null
  },
  {
    id: "tempo-collapse",
    label: "I can play it slowly but not fast",
    domain: "Practice",
    priority: 108,
    exact: [
      "falls apart when faster", "cannot increase tempo",
      "passage breaks down at speed", "fine slow but not fast",
      "can play slowly but not fast", "i can play it slowly but not fast",
      "i can play slowly but not fast", "the passage falls apart when i raise the tempo",
      "passage falls apart when i raise the tempo", "tempo wall"
    ],
    tokenGroups: [
      ["falls", "apart", "faster"], ["increase", "tempo"],
      ["slow", "fast"], ["tempo", "wall"]
    ],
    exclude: [],
    summary: "The slow version may contain motions or decision steps that cannot survive at speed.",
    firstAction: "Use a short burst at target tempo, then stop. Compare the motion to the slow version and remove excess lift or pressure.",
    verification: "A two- to four-note burst is clean at target tempo without preparation delay.",
    stopCondition: "Stop after three clean bursts; expand by one note rather than raising tempo again.",
    searchTerms: ["tempo practice", "speed bursts", "fast passages", "practice at speed"],
    branch: null
  },
  {
    id: "inconsistent-repetition",
    label: "I can play it once but cannot repeat it",
    domain: "Practice",
    priority: 96,
    exact: [
      "works once but not again", "inconsistent passage",
      "cannot repeat good take", "sometimes works sometimes not",
      "playing is inconsistent"
    ],
    tokenGroups: [
      ["works", "once"], ["cannot", "repeat"],
      ["sometimes", "works"], ["playing", "inconsistent"]
    ],
    exclude: [],
    summary: "A successful attempt has not yet been reduced to observable, repeatable conditions.",
    firstAction: "After one successful repetition, state what changed in setup, timing, or motion before playing again.",
    verification: "The next repetition preserves the named condition.",
    stopCondition: "Stop after three deliberate repetitions; do not continue until failure obscures the cause.",
    searchTerms: ["consistent practice", "repeatability", "successful repetition"],
    branch: null
  },
  {
    id: "mistake-diagnosis",
    label: "I do not know what is causing the mistake",
    domain: "Practice",
    priority: 98,
    exact: [
      "do not know what is wrong", "cannot diagnose mistake",
      "why does passage fail", "cannot tell what to fix",
      "something feels wrong violin"
    ],
    tokenGroups: [
      ["diagnose", "mistake"], ["tell", "fix"],
      ["passage", "fail"]
    ],
    exclude: [],
    summary: "The passage contains too many simultaneous variables to diagnose as a whole.",
    firstAction: "Run three separate tests: left hand silently, bow on open strings, then rhythm on one pitch.",
    verification: "One isolated test reproduces the failure while the others remain stable.",
    stopCondition: "Stop once the failing subsystem is identified; route that specific problem next.",
    searchTerms: ["diagnose violin problem", "practice troubleshooting", "isolate hands"],
    branch: null
  },
  {
    id: "practice-thread-lost",
    label: "I lost the thread or do not know what to practice next",
    domain: "Practice",
    priority: 101,
    exact: [
      "i lost the thread", "lost the thread", "do not know what to practice next",
      "i do not know what to practice next", "only have five minutes",
      "i only have five minutes", "missed several days", "lost after missing days",
      "answer i tried did not help", "the answer i tried did not help"
    ],
    tokenGroups: [
      ["lost", "thread"], ["practice", "next"], ["five", "minutes"],
      ["missed", "days"], ["answer", "tried", "help"]
    ],
    exclude: [],
    summary: "The immediate problem is continuity: recover one observable next action instead of restarting the whole archive search.",
    firstAction: "Name the last thing you noticed, choose one two-minute test, and timestamp the result before choosing the next route.",
    verification: "You can write one sentence: what changed, what did not, and what to try next.",
    stopCondition: "Stop once the next bounded practice action is chosen.",
    searchTerms: ["practice strategy", "practice planning", "troubleshooting", "practice continuity"],
    branch: null
  },
  {
    id: "different-mistakes",
    label: "I keep making different mistakes every repetition",
    domain: "Practice",
    priority: 94,
    exact: [
      "different mistakes every repetition", "keep making different mistakes",
      "mistakes change every time", "fix one note and lose the phrase",
      "i fix one note and lose the phrase", "practice a lot but not improve"
    ],
    tokenGroups: [
      ["different", "mistakes"], ["mistakes", "change"], ["fix", "note", "phrase"],
      ["practice", "lot", "improve"]
    ],
    exclude: [],
    summary: "The practice unit is too large or the success condition is too vague.",
    firstAction: "Shrink to the smallest unit that can fail the same way twice, then repeat only that unit with one named condition.",
    verification: "The same failure either repeats clearly or disappears under the smaller test.",
    stopCondition: "Stop after the cause becomes stable enough to name.",
    searchTerms: ["practice strategy", "consistent mistakes", "isolate passage"],
    branch: null
  },

  // TIER 4: RHYTHM, READING, AND MUSICAL EXECUTION
  {
    id: "rhythm-collapse",
    label: "I lose the rhythm when notes get difficult",
    domain: "Rhythm and reading",
    priority: 93,
    exact: [
      "lose the rhythm when notes get difficult", "i lose the rhythm",
      "rush fast notes", "i rush fast notes", "slow down during shifts",
      "cannot subdivide", "my bowing breaks the rhythm"
    ],
    tokenGroups: [
      ["lose", "rhythm"], ["rush", "fast", "notes"], ["slow", "shift"],
      ["cannot", "subdivide"], ["bowing", "rhythm"]
    ],
    exclude: [],
    summary: "Rhythm failure under technical load usually needs grouping and pulse protection, not only a metronome.",
    firstAction: "Speak or tap the rhythm on one pitch, then add the technical motion while preserving the same grouping.",
    verification: "The pulse survives the hard notes before pitch and tone are fully restored.",
    stopCondition: "Stop once one grouped unit stays in time three times.",
    searchTerms: ["rhythm", "subdivision", "grouping", "pulse"],
    branch: null
  },
  {
    id: "phrase-disappears",
    label: "My phrasing disappears when I focus on technique",
    domain: "Musical execution",
    priority: 84,
    exact: [
      "phrasing disappears", "my phrasing disappears when i focus on technique",
      "play every note with same weight", "cannot shape a long phrase",
      "phrase without running out of bow", "do not know how to group the passage"
    ],
    tokenGroups: [
      ["phrasing", "disappears"], ["same", "weight"], ["shape", "phrase"],
      ["group", "passage"]
    ],
    exclude: [],
    summary: "The passage needs hierarchy: not every note can receive the same weight, bow, and attention.",
    firstAction: "Mark one destination note and one lighter note group, then choose bow distribution around that hierarchy.",
    verification: "The phrase still has direction while the technical problem is isolated.",
    stopCondition: "Stop once one phrase unit has a clear destination and bow plan.",
    searchTerms: ["phrasing", "grouping", "bow distribution", "musical hierarchy"],
    branch: null
  },

  // TIER 5: SAFETY AND SETUP BOUNDARIES
  {
    id: "shoulder-neck-pain",
    label: "My neck, shoulder, wrist, hand, or finger hurts",
    domain: "Safety boundary",
    priority: 1000,
    exact: [
      "violin causes pain", "neck pain violin", "shoulder pain violin",
      "wrist pain violin", "hand pain violin", "finger pain violin",
      "numbness violin", "tingling violin"
    ],
    tokenGroups: [
      ["pain", "violin"], ["neck", "pain"], ["shoulder", "pain"],
      ["wrist", "pain"], ["numbness", "violin"], ["tingling", "violin"]
    ],
    exclude: ["pain in the music", "emotional pain"],
    summary: "Pain, numbness, or tingling is not an ordinary technical-routing problem.",
    firstAction: "Stop the provoking motion. Do not use the library to push through pain. Seek individualized evaluation from a qualified teacher and, when symptoms persist or recur, an appropriate healthcare professional.",
    verification: "The test is not whether you can tolerate the motion; the provoking symptom should be absent.",
    stopCondition: "Do not resume the provoking motion merely because a technical suggestion seems plausible.",
    searchTerms: ["playing comfort", "violin setup"],
    branch: null
  },
  {
    id: "bridge-soundpost-setup",
    label: "My bridge, soundpost, or instrument setup may be unsafe",
    domain: "Instrument setup",
    priority: 200,
    exact: [
      "bridge is leaning", "bridge fell", "soundpost fell",
      "soundpost moved", "crack in violin", "bridge warped",
      "violin setup problem"
    ],
    tokenGroups: [
      ["bridge", "leaning"], ["bridge", "fell"], ["soundpost", "fell"],
      ["crack", "violin"], ["bridge", "warped"]
    ],
    exclude: [],
    summary: "Structural setup should not be diagnosed or corrected through general playing-technique routing.",
    firstAction: "Stop adjusting the affected part and take the instrument to a qualified violin shop or luthier.",
    verification: "A professional confirms the instrument is structurally safe and correctly set up.",
    stopCondition: "Do not continue tightening strings or moving the bridge when the soundpost or bridge position is uncertain.",
    searchTerms: ["violin setup", "luthier", "bridge care"],
    branch: null
  },
  {
    id: "tuning-instrument",
    label: "Tune the violin itself",
    domain: "Instrument basics",
    priority: 160,
    exact: [
      "how to tune violin", "tune my violin", "violin is out of tune",
      "what notes are violin strings", "string tuning violin"
    ],
    tokenGroups: [
      ["tune", "violin"], ["violin", "tune"], ["notes", "violin", "strings"]
    ],
    exclude: ["play in tune", "intonation", "shifting"],
    summary: "Instrument tuning is separate from playing intonation.",
    firstAction: "Tune A first, then D, G, and E using a reliable reference. Use fine tuners for small adjustments and pegs only for larger ones.",
    verification: "Each open string matches its reference pitch and remains stable after the others are tuned.",
    stopCondition: "Stop forcing a peg or fine tuner that reaches its mechanical limit.",
    searchTerms: ["tuning violin", "open strings", "fine tuners"],
    branch: null
  }
];

const ROUTE_BY_ID = new Map(ROUTES.map((route) => [route.id, route]));

function scoreRoute(route, normalized, tokens) {
  if (containsAny(normalized, route.exclude)) {
    return null;
  }

  let score = 0;
  let reason = null;

  for (const phrase of route.exact) {
    const normalizedPhrase = normalizeText(phrase);

    if (normalized === normalizedPhrase) {
      const candidate = 10000 + normalizedPhrase.length + route.priority;
      if (candidate > score) {
        score = candidate;
        reason = `exact:${phrase}`;
      }
      continue;
    }

    if (hasPhrase(normalized, phrase)) {
      const candidate = 8000 + normalizedPhrase.length + route.priority;
      if (candidate > score) {
        score = candidate;
        reason = `phrase:${phrase}`;
      }
    }
  }

  for (const group of route.tokenGroups) {
    if (matchesTokenGroup(tokens, group)) {
      const candidate = 4000 + group.length * 100 + route.priority;
      if (candidate > score) {
        score = candidate;
        reason = `tokens:${group.join("+")}`;
      }
    }
  }

  if (score === 0) return null;

  return { route, score, reason };
}

function resolveRouteReference(result) {
  if (!result || !result.routeId || !ROUTE_BY_ID.has(result.routeId)) {
    return result;
  }

  const base = buildPayload(ROUTE_BY_ID.get(result.routeId));
  return { ...base, ...result };
}

/**
 * Deterministically route a free-text violin question.
 *
 * @param {string} input
 * @returns {RouteResult}
 */
function routeTechnicalQuestion(input) {
  const normalizedQuery = normalizeText(input);

  if (!normalizedQuery) {
    return {
      kind: "FALLBACK",
      normalizedQuery,
      authority: "archive",
      fallbackQuery: "",
      message: "Enter a specific technique or observable practice problem."
    };
  }

  const tokens = tokenize(normalizedQuery);
  const matches = ROUTES
    .map((route) => scoreRoute(route, normalizedQuery, tokens))
    .filter(Boolean)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.route.priority !== a.route.priority) return b.route.priority - a.route.priority;
      return a.route.id.localeCompare(b.route.id);
    });

  if (matches.length === 0) {
    return {
      kind: "FALLBACK",
      normalizedQuery,
      authority: "archive",
      fallbackQuery: normalizedQuery,
      message: "No governed route matched. Results below are archive retrieval, not a deterministic technical judgment."
    };
  }

  const top = matches[0];
  const second = matches[1];

  // A close collision is surfaced rather than silently guessed.
  if (
    second &&
    second.route.id !== top.route.id &&
    Math.abs(top.score - second.score) < 75
  ) {
    return {
      kind: "CONFIRM",
      normalizedQuery,
      authority: "governed",
      candidates: [top, second].map(({ route }) => ({
        routeId: route.id,
        label: route.label
      })),
      message: "Two governed routes matched closely. Choose the problem you actually mean."
    };
  }

  const payload = buildPayload(top.route);

  if (top.route.branch) {
    return {
      kind: "BRANCH",
      normalizedQuery,
      authority: "governed",
      route: payload,
      branch: {
        prompt: top.route.branch.prompt,
        options: top.route.branch.options.map((option) => ({
          id: option.id,
          label: option.label
        }))
      }
    };
  }

  return {
    kind: "DIRECT",
    normalizedQuery,
    authority: "governed",
    route: payload
  };
}

/**
 * Resolve one fixed branch answer.
 *
 * @param {string} routeId
 * @param {string} optionId
 * @returns {RouteResult}
 */
function resolveTechnicalBranch(routeId, optionId) {
  const route = ROUTE_BY_ID.get(routeId);

  if (!route || !route.branch) {
    return {
      kind: "FALLBACK",
      normalizedQuery: "",
      authority: "archive",
      fallbackQuery: "",
      message: "Unknown governed branch."
    };
  }

  const option = route.branch.options.find((candidate) => candidate.id === optionId);

  if (!option) {
    return {
      kind: "BRANCH",
      normalizedQuery: "",
      authority: "governed",
      route: buildPayload(route),
      branch: {
        prompt: route.branch.prompt,
        options: route.branch.options.map((candidate) => ({
          id: candidate.id,
          label: candidate.label
        }))
      },
      message: "Choose one of the fixed branch options."
    };
  }

  const base = buildPayload(route);
  const resolved = resolveRouteReference(option.result);

  return {
    kind: "DIRECT",
    normalizedQuery: "",
    authority: "governed",
    route: { ...base, ...resolved }
  };
}

/**
 * Resolve a confirmation collision by exact route ID.
 *
 * @param {string} routeId
 * @returns {RouteResult}
 */
function confirmTechnicalRoute(routeId) {
  const route = ROUTE_BY_ID.get(routeId);

  if (!route) {
    return {
      kind: "FALLBACK",
      normalizedQuery: "",
      authority: "archive",
      fallbackQuery: "",
      message: "Unknown governed route."
    };
  }

  if (route.branch) {
    return {
      kind: "BRANCH",
      normalizedQuery: "",
      authority: "governed",
      route: buildPayload(route),
      branch: {
        prompt: route.branch.prompt,
        options: route.branch.options.map((option) => ({
          id: option.id,
          label: option.label
        }))
      }
    };
  }

  return {
    kind: "DIRECT",
    normalizedQuery: "",
    authority: "governed",
    route: buildPayload(route)
  };
}

/**
 * Return public metadata for diagnostics or a route directory.
 */
function listTechnicalRoutes() {
  return ROUTES.map((route) => ({
    id: route.id,
    label: route.label,
    domain: route.domain,
    priority: route.priority,
    searchTerms: [...route.searchTerms],
    hasBranch: Boolean(route.branch)
  }));
}

function listTechnicalRouteDetails() {
  return ROUTES.map((route) => ({
    id: route.id,
    label: route.label,
    domain: route.domain,
    priority: route.priority,
    exact: [...route.exact],
    tokenGroups: route.tokenGroups.map((group) => [...group]),
    exclude: [...route.exclude],
    summary: route.summary,
    firstAction: route.firstAction,
    verification: route.verification,
    stopCondition: route.stopCondition,
    searchTerms: [...route.searchTerms],
    branch: route.branch
      ? {
          prompt: route.branch.prompt,
          options: route.branch.options.map((option) => ({
            id: option.id,
            label: option.label,
            result: { ...option.result }
          }))
        }
      : null
  }));
}

/**
 * Validate deterministic invariants at build/test time.
 * Throws on duplicate IDs, duplicate exact phrases, broken branch references,
 * or empty authoritative payloads.
 */
function validateTechnicalRouter() {
  const errors = [];
  const ids = new Set();
  const phrases = new Map();

  for (const route of ROUTES) {
    if (ids.has(route.id)) errors.push(`Duplicate route id: ${route.id}`);
    ids.add(route.id);

    for (const key of ["label", "domain", "summary", "firstAction", "verification", "stopCondition"]) {
      if (!String(route[key] ?? "").trim()) {
        errors.push(`${route.id} missing ${key}`);
      }
    }

    for (const phrase of route.exact) {
      const normalized = normalizeText(phrase);
      const prior = phrases.get(normalized);
      if (prior && prior !== route.id) {
        errors.push(`Exact phrase collision "${phrase}" between ${prior} and ${route.id}`);
      } else {
        phrases.set(normalized, route.id);
      }
    }

    if (route.branch) {
      const optionIds = new Set();

      for (const option of route.branch.options) {
        if (optionIds.has(option.id)) {
          errors.push(`Duplicate branch option ${route.id}:${option.id}`);
        }
        optionIds.add(option.id);

        if (
          option.result.routeId &&
          option.result.routeId !== route.id &&
          !ROUTE_BY_ID.has(option.result.routeId)
        ) {
          errors.push(
            `Broken branch route reference ${route.id}:${option.id} -> ${option.result.routeId}`
          );
        }
      }
    }
  }

  if (errors.length) {
    throw new Error(`Technical router validation failed:\n- ${errors.join("\n- ")}`);
  }

  return {
    routeCount: ROUTES.length,
    exactPhraseCount: phrases.size,
    status: "valid"
  };
}

// Validate immediately in non-production tooling and tests.
// Safe to call explicitly during CI regardless of environment.
if (
  typeof process !== "undefined" &&
  process.env &&
  process.env.NODE_ENV !== "production"
) {
  validateTechnicalRouter();
}

module.exports = {
  normalizeText,
  routeTechnicalQuestion,
  resolveTechnicalBranch,
  confirmTechnicalRoute,
  listTechnicalRoutes,
  listTechnicalRouteDetails,
  validateTechnicalRouter
};

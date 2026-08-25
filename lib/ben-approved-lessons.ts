export type LessonContextTag =
  | "correction-boundaries"
  | "practice-conflict"
  | "teacher-context"
  | "pain-safety"
  | "instrument-care"
  | "cost-value"
  | "parent-perspective"
  | "ai-judgment";

export type BenApprovedLesson = {
  id: string;
  title: string;
  note: string;
  appleUrl: string;
  embedUrl: string;
  published: string;
  tags: LessonContextTag[];
  parentQuestionSlugs: string[];
};

const showPath = "/us/podcast";
const showId = "id6792397467";

function appleEpisode(slug: string, id: string) {
  return `https://podcasts.apple.com${showPath}/${slug}/${showId}?i=${id}`;
}

function appleEmbed(slug: string, id: string) {
  return `https://embed.podcasts.apple.com${showPath}/${slug}/${showId}?i=${id}`;
}

function lesson(
  id: string,
  slug: string,
  title: string,
  published: string,
  tags: LessonContextTag[],
  parentQuestionSlugs: string[],
  note: string
): BenApprovedLesson {
  return {
    id,
    title,
    note,
    appleUrl: appleEpisode(slug, id),
    embedUrl: appleEmbed(slug, id),
    published,
    tags,
    parentQuestionSlugs
  };
}

export const benApprovedLessons: BenApprovedLesson[] = [
  lesson(
    "1000785123574",
    "why-am-i-paying-for-sheet-music",
    "Why Am I Paying for Sheet Music?",
    "2026-08-22",
    ["cost-value", "teacher-context"],
    ["when-should-a-violin-parent-ask-the-teacher-instead-of-ai"],
    "For sheet music costs, editions, copyright, teacher-requested materials, and responsible source use."
  ),
  lesson(
    "1000785123531",
    "strings-rehairs-repairs-and-all-the-stuff-nobody-mentions",
    "Strings, Rehairs, Repairs, and All the Stuff Nobody Mentions",
    "2026-08-22",
    ["instrument-care", "cost-value", "teacher-context"],
    ["what-should-i-do-if-my-childs-violin-looks-or-sounds-wrong"],
    "For maintenance surprises, broken strings, rehairs, buzzing, bridge changes, tuning instability, and who to call."
  ),
  lesson(
    "1000785123435",
    "i-forgot-my-violin",
    "I Forgot My Violin",
    "2026-08-22",
    ["teacher-context", "parent-perspective"],
    ["how-should-a-parent-support-violin-practice-without-becoming-the-teacher"],
    "For forgotten lesson equipment, teacher options, natural consequences, and moving responsibility toward the child."
  ),
  lesson(
    "1000785123625",
    "when-the-soundpost-falls",
    "When the Soundpost Falls",
    "2026-08-22",
    ["instrument-care", "teacher-context"],
    ["what-should-i-do-if-my-childs-violin-looks-or-sounds-wrong"],
    "For sudden sound changes, rattling, a fallen soundpost, instrument safety, and avoiding do-it-yourself repair."
  ),
  lesson(
    "1000785123606",
    "is-violin-worth-it-if-theyll-never-become-a-professional",
    "Is Violin Worth It If They'll Never Become a Professional?",
    "2026-08-22",
    ["cost-value", "parent-perspective"],
    [],
    "For families questioning the value of violin when it may not lead to a professional music path."
  ),
  lesson(
    "1000785123530",
    "what-playing-violin-does-to-your-body",
    "What Playing Violin Does to Your Body",
    "2026-08-22",
    ["pain-safety", "teacher-context", "instrument-care"],
    ["what-should-i-do-if-my-child-says-violin-hurts"],
    "For pain, discomfort, normal adaptation, warning signs, setup questions, and when to involve a teacher or clinician."
  ),
  lesson(
    "1000785123436",
    "practice-time-was-short-did-it-still-count",
    "Practice Time Was Short. Did It Still Count?",
    "2026-08-22",
    ["practice-conflict", "ai-judgment"],
    ["what-if-my-child-refuses-to-practice-violin", "what-is-ai-good-for-between-violin-lessons"],
    "For practice duration, focused repetitions, fatigue, and judging what happened inside a short practice window."
  ),
  lesson(
    "1000785123607",
    "bring-your-old-violin-when-shopping-for-a-new-one",
    "Bring Your Old Violin When Shopping For a New One",
    "2026-08-22",
    ["instrument-care", "cost-value"],
    ["what-should-i-do-if-my-childs-violin-looks-or-sounds-wrong"],
    "For instrument shopping, side-by-side comparison, showroom acoustics, equipment variables, and price expectations."
  ),
  lesson(
    "1000785123532",
    "i-didnt-know-how-expensive-violin-was-until-i-became",
    "I Didn't Know How Expensive Violin Was Until I Became the Parent",
    "2026-08-22",
    ["cost-value", "instrument-care", "teacher-context"],
    [],
    "For the real cost of violin beyond weekly lessons: rentals, upgrades, strings, repairs, travel, and sustainability."
  ),
  lesson(
    "1000785123437",
    "it-sounded-worse-after-we-fixed-the-problem",
    "It Sounded Worse After We Fixed the Problem",
    "2026-08-22",
    ["instrument-care", "teacher-context", "correction-boundaries"],
    [
      "what-should-i-do-if-my-childs-violin-looks-or-sounds-wrong",
      "when-should-a-violin-parent-ask-the-teacher-instead-of-ai"
    ],
    "For correct changes that temporarily sound worse, adjustment periods, parent restraint, and teacher alignment."
  ),
  lesson(
    "1000779274018",
    "the-wrong-name",
    "The Wrong Name",
    "2026-07-31",
    ["ai-judgment", "parent-perspective"],
    ["what-is-ai-good-for-between-violin-lessons"],
    "For moments when confidence may come from naming the situation inside one familiar frame."
  ),
  lesson(
    "1000779273979",
    "the-violin-didnt-change",
    "The Violin Didn't Change",
    "2026-07-31",
    ["parent-perspective", "practice-conflict"],
    [],
    "For self-perception, performance anxiety, audience perspective, and separating sound from interpretation."
  ),
  lesson(
    "1000779274152",
    "take-the-picture",
    "Take the Picture",
    "2026-07-31",
    ["parent-perspective", "ai-judgment"],
    ["what-is-ai-good-for-between-violin-lessons"],
    "For preserving ordinary practice, recital, or family music context before it is needed."
  ),
  lesson(
    "1000779273864",
    "what-does-normal-look-like",
    "What Does Normal Look Like",
    "2026-07-31",
    ["teacher-context", "instrument-care", "ai-judgment"],
    [
      "when-should-a-violin-parent-ask-the-teacher-instead-of-ai",
      "what-should-i-do-if-my-childs-violin-looks-or-sounds-wrong"
    ],
    "For parents unsure whether an instrument or practice problem is ordinary learning or something unusual."
  ),
  lesson(
    "1000779274063",
    "before-you-touch-the-violin",
    "Before You Touch the Violin",
    "2026-07-31",
    ["instrument-care", "teacher-context", "correction-boundaries"],
    ["what-should-i-do-if-my-childs-violin-looks-or-sounds-wrong"],
    "For tuning, adjusting, or handling a child's violin before the parent has been shown how."
  ),
  lesson(
    "1000777718035",
    "what-i-forgot-they-didnt-know",
    "What I Forgot They Didnt Know",
    "2026-07-21",
    ["practice-conflict", "teacher-context"],
    ["when-should-a-violin-parent-ask-the-teacher-instead-of-ai"],
    "For hidden adult assumptions and beginner knowledge the child may not have been taught explicitly."
  ),
  lesson(
    "1000777717876",
    "when-better-sounds-worse",
    "When Better Sounds Worse",
    "2026-07-21",
    ["teacher-context", "correction-boundaries"],
    [
      "should-i-correct-my-childs-violin-mistakes-at-home",
      "when-should-a-violin-parent-ask-the-teacher-instead-of-ai"
    ],
    "For better technique or deeper learning that temporarily sounds messier, slower, or less polished."
  ),
  lesson(
    "1000777717789",
    "am-i-helping-or-taking-over",
    "Am I Helping Or Taking Over",
    "2026-07-21",
    ["correction-boundaries", "practice-conflict"],
    [
      "should-i-correct-my-childs-violin-mistakes-at-home",
      "how-should-a-parent-support-violin-practice-without-becoming-the-teacher",
      "should-parents-sit-with-their-child-during-violin-practice"
    ],
    "For parent help that may be slipping into carrying too much of the practice or replacing the child's own work."
  ),
  lesson(
    "1000777717900",
    "thirty-seconds",
    "Thirty Seconds",
    "2026-07-21",
    ["practice-conflict", "ai-judgment"],
    ["what-if-my-child-refuses-to-practice-violin", "what-is-ai-good-for-between-violin-lessons"],
    "For practice that feels too big to restart and needs a very small next interval."
  ),
  lesson(
    "1000777717960",
    "the-question-no-one-asks-for-us",
    "The Question No One Asks For Us",
    "2026-07-21",
    ["parent-perspective", "practice-conflict"],
    ["how-should-a-parent-support-violin-practice-without-becoming-the-teacher"],
    "For parent capacity, unseen labor, and the practical question that keeps support sustainable."
  ),
  lesson(
    "1000777718036",
    "the-question-behind-the-question",
    "The Question Behind the Question",
    "2026-07-21",
    ["teacher-context", "parent-perspective"],
    ["what-if-my-child-refuses-to-practice-violin"],
    "For child questions that may be carrying a deeper worry, need, or request."
  ),
  lesson(
    "1000777717926",
    "when-the-rule-wasnt-enough",
    "When the Rule Wasnt Enough",
    "2026-07-21",
    ["practice-conflict", "ai-judgment"],
    ["what-if-my-child-refuses-to-practice-violin", "what-is-ai-good-for-between-violin-lessons"],
    "For rules, boundaries, or practice agreements that still do not solve the real problem."
  ),
  lesson(
    "1000777717961",
    "a-question-that-helps-all-three",
    "A Question That Helps All Three",
    "2026-07-21",
    ["teacher-context", "practice-conflict"],
    [
      "when-should-a-violin-parent-ask-the-teacher-instead-of-ai",
      "how-should-a-parent-support-violin-practice-without-becoming-the-teacher"
    ],
    "For parent, child, and teacher confusion where one question can clarify what support is needed."
  ),
  lesson(
    "1000777717790",
    "i-want-to-quit-again",
    "I Want to Quit Again",
    "2026-07-21",
    ["practice-conflict", "parent-perspective"],
    ["what-if-my-child-refuses-to-practice-violin"],
    "For repeated quitting conversations, discouragement loops, pressure, and the repeated request underneath."
  ),
  lesson(
    "1000777718010",
    "when-the-sources-disagree",
    "When the Sources Disagree",
    "2026-07-21",
    ["teacher-context", "ai-judgment"],
    [
      "can-i-use-chatgpt-or-ai-to-help-my-child-practice-violin",
      "when-should-a-violin-parent-ask-the-teacher-instead-of-ai",
      "what-is-ai-good-for-between-violin-lessons"
    ],
    "For mixed musical guidance from teachers, books, videos, parents, AI, or other trusted sources."
  ),
  lesson(
    "1000777377172",
    "when-everyone-needs-help-at-once",
    "When Everyone Needs Help at Once",
    "2026-07-18",
    ["practice-conflict", "parent-perspective"],
    ["should-parents-sit-with-their-child-during-violin-practice"],
    "For multiple children practicing at once, divided attention, fairness, and preserving practice momentum."
  ),
  lesson(
    "1000777376923",
    "whos-the-subject-of-this-thought",
    "Whos the Subject of This Thought",
    "2026-07-18",
    ["parent-perspective", "ai-judgment"],
    [
      "should-i-correct-my-childs-violin-mistakes-at-home",
      "how-should-a-parent-support-violin-practice-without-becoming-the-teacher"
    ],
    "For parent thoughts that may center the adult's fear, comparison, identity, or embarrassment."
  ),
  lesson(
    "1000777377081",
    "what-if-that-was-me",
    "What If That Was Me",
    "2026-07-18",
    ["parent-perspective"],
    [],
    "For watching another child's lesson, conflict, or musical path and avoiding judgment from the outside."
  ),
  lesson(
    "1000777376922",
    "the-price-of-not-knowing",
    "The Price of Not Knowing",
    "2026-07-18",
    ["teacher-context", "parent-perspective", "ai-judgment"],
    [
      "can-i-use-chatgpt-or-ai-to-help-my-child-practice-violin",
      "what-is-ai-good-for-between-violin-lessons",
      "how-should-a-parent-support-violin-practice-without-becoming-the-teacher"
    ],
    "For parents responsible for practice who do not play violin or do not know what practice should look like."
  ),
  lesson(
    "1000777377113",
    "will-this-make-the-next-performance-more-likely",
    "Will This Make the Next Performance More Likely",
    "2026-07-18",
    ["practice-conflict", "parent-perspective"],
    [],
    "For post-performance praise, critique, pressure, and the child's willingness to perform again."
  ),
  lesson(
    "1000777377082",
    "i-was-playing-the-wrong-role",
    "I Was Playing the Wrong Role",
    "2026-07-18",
    ["correction-boundaries", "teacher-context"],
    [
      "should-i-correct-my-childs-violin-mistakes-at-home",
      "how-should-a-parent-support-violin-practice-without-becoming-the-teacher"
    ],
    "For musician-parents or capable adults who demonstrate too much and accidentally take over."
  ),
  lesson(
    "1000777377146",
    "the-story-isnt-over",
    "The Story Isn't Over",
    "2026-07-18",
    ["parent-perspective", "practice-conflict"],
    ["what-if-my-child-refuses-to-practice-violin"],
    "For slow progress, discouragement, and avoiding premature conclusions about a child's future."
  ),
  lesson(
    "1000777376975",
    "before-you-change-your-child",
    "Before You Change Your Child",
    "2026-07-18",
    ["correction-boundaries", "teacher-context", "parent-perspective"],
    [
      "should-i-correct-my-childs-violin-mistakes-at-home",
      "when-should-a-violin-parent-ask-the-teacher-instead-of-ai"
    ],
    "For parent-teacher tension, online lesson frustration, and checking the setting before fixing the child."
  ),
  lesson(
    "1000777376947",
    "not-my-instrument",
    "Not My Instrument",
    "2026-07-18",
    ["practice-conflict", "parent-perspective"],
    ["what-if-my-child-refuses-to-practice-violin"],
    "For quitting, resistance, ownership, and separating the child's path from the parent's dream."
  ),
  lesson(
    "1000777377147",
    "before-you-reassure",
    "Before You Reassure",
    "2026-07-18",
    ["parent-perspective", "correction-boundaries"],
    ["should-i-correct-my-childs-violin-mistakes-at-home"],
    "For post-performance self-criticism and listening before correcting a child's interpretation."
  ),
  lesson(
    "1000777376948",
    "better-than-me",
    "Better Than Me",
    "2026-07-18",
    ["parent-perspective", "practice-conflict"],
    ["what-if-my-child-refuses-to-practice-violin"],
    "For comparison spirals after a child notices that another player is ahead."
  ),
  lesson(
    "1000777376949",
    "when-not-helping-is-best",
    "When Not Helping Is Best",
    "2026-07-18",
    ["correction-boundaries", "teacher-context"],
    [
      "should-i-correct-my-childs-violin-mistakes-at-home",
      "should-parents-sit-with-their-child-during-violin-practice"
    ],
    "For moments when a parent hears a mistake and wants to jump in immediately."
  ),
  lesson(
    "1000777376950",
    "who-carries-the-motivation",
    "Who Carries the Motivation",
    "2026-07-18",
    ["practice-conflict", "parent-perspective"],
    ["what-if-my-child-refuses-to-practice-violin"],
    "For readiness, fading initial excitement, parent capacity, and long-term support questions."
  ),
  lesson(
    "1000777377114",
    "my-strings-are-out-of-tune-again",
    "My Strings Are Out of Tune Again",
    "2026-07-18",
    ["instrument-care", "practice-conflict"],
    ["what-should-i-do-if-my-childs-violin-looks-or-sounds-wrong"],
    "For practice blocked by an out-of-tune instrument, setup friction, and a small practical first step."
  ),
  lesson(
    "1000777377115",
    "what-one-thing-can-i-change",
    "What One Thing Can I Change",
    "2026-07-18",
    ["practice-conflict", "ai-judgment"],
    ["what-if-my-child-refuses-to-practice-violin", "what-is-ai-good-for-between-violin-lessons"],
    "For resistance, stalled momentum, and changing one condition instead of fixing the whole relationship to music."
  )
];

export function getBenApprovedLessonsForParentQuestion(slug: string, limit = 3) {
  return benApprovedLessons.filter((lesson) => lesson.parentQuestionSlugs.includes(slug)).slice(0, limit);
}

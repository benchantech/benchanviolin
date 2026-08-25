export const violinForParentsUrl = "https://studio.com/apps/benchanviolin/violin-for-parents";

export const violinForParentsCta = "Get help with today's violin situation";

export type ParentQuestion = {
  slug: string;
  title: string;
  description: string;
  updated: string;
  directAnswer: string;
  observations: string[];
  uncertainty: string;
  authority: string;
  nextMove: string;
  sourceLinks: { label: string; href: string }[];
  lessonPlayers?: {
    title: string;
    note: string;
    appleUrl: string;
    embedUrl: string;
  }[];
  related: string[];
};

export const parentQuestions: ParentQuestion[] = [
  {
    slug: "should-i-correct-my-childs-violin-mistakes-at-home",
    title: "Should I Correct My Child's Violin Mistakes at Home?",
    description:
      "A parent-facing answer about supporting violin practice without becoming a second violin teacher.",
    updated: "2026-08-25",
    directAnswer:
      "Usually, do less correction than you think. Help your child notice what happened, protect the teacher's assignment, and bring unclear patterns back to the teacher instead of installing your own parallel lesson.",
    observations: [
      "What did the teacher specifically ask your child to do?",
      "What did you actually hear or see, without naming a cause?",
      "Did the same issue repeat, or was it a single messy attempt?",
      "Did your child become more tense, upset, or confused after adult feedback?"
    ],
    uncertainty:
      "A parent may hear a real problem and still misidentify the cause. A pitch, bow, rhythm, posture, or attention issue can look obvious from outside and still require teacher context.",
    authority:
      "The current teacher owns individualized violin correction. The parent owns the home environment, immediate safety, and the decision to stop escalating a bad practice moment.",
    nextMove:
      "Ask your child to play the passage once more with the teacher's exact instruction in mind. If it is still unclear, write down what you heard and ask the teacher what to prioritize next.",
    sourceLinks: [
      { label: "Search Ben's technique library for the specific issue", href: "/library" },
      { label: "AI and educational boundary statement", href: "/ai-disclosure" }
    ],
    lessonPlayers: [
      {
        title: "Am I Helping Or Taking Over",
        note:
          "Use this when parent help may be slipping into carrying too much of the practice or replacing the child's own work.",
        appleUrl:
          "https://podcasts.apple.com/us/podcast/am-i-helping-or-taking-over/id6792397467?i=1000777717789",
        embedUrl:
          "https://embed.podcasts.apple.com/us/podcast/am-i-helping-or-taking-over/id6792397467?i=1000777717789"
      }
    ],
    related: [
      "when-should-a-violin-parent-ask-the-teacher-instead-of-ai",
      "how-should-a-parent-support-violin-practice-without-becoming-the-teacher"
    ]
  },
  {
    slug: "can-i-use-chatgpt-or-ai-to-help-my-child-practice-violin",
    title: "Can I Use ChatGPT or AI to Help My Child Practice Violin?",
    description:
      "How parents can use AI between violin lessons while preserving teacher authority and human judgment.",
    updated: "2026-08-25",
    directAnswer:
      "Yes, but use AI as a thinking aid, not as an unsupervised violin teacher. AI is useful for organizing observations, generating questions, comparing possibilities, and narrowing what to ask next.",
    observations: [
      "What did the teacher assign?",
      "What is the child struggling with in plain language?",
      "What has already been tried at home?",
      "What would make this a teacher, clinician, or instrument-care question?"
    ],
    uncertainty:
      "AI can sound confident without knowing your child, the teacher's current plan, the lesson history, or what the child physically experiences.",
    authority:
      "AI may help expose options. The parent decides what is appropriate at home, and the teacher retains authority over individualized violin instruction.",
    nextMove:
      "Use AI to draft a short teacher question from observations, not to invent a new correction. Keep the next home action small, reversible, and aligned with the assignment.",
    sourceLinks: [
      { label: "BenChanViolin technique library", href: "/library" },
      { label: "Violin for Parents", href: violinForParentsUrl }
    ],
    related: [
      "should-i-correct-my-childs-violin-mistakes-at-home",
      "what-is-ai-good-for-between-violin-lessons"
    ]
  },
  {
    slug: "what-if-my-child-refuses-to-practice-violin",
    title: "What Should I Do When My Child Refuses to Practice Violin?",
    description:
      "A bounded parent response for violin practice conflict between lessons.",
    updated: "2026-08-25",
    directAnswer:
      "Do not begin by solving the whole motivation problem. First separate what happened from your interpretation, reduce the practice demand, and decide whether this is a music problem, a family-conflict problem, or a teacher-context problem.",
    observations: [
      "What exact words did your child use?",
      "Was the refusal about starting, continuing, a specific passage, discomfort, boredom, or conflict with an adult?",
      "Was there pain, fear, fatigue, hunger, time pressure, or a recent lesson change?",
      "What happened the last time practice went better?"
    ],
    uncertainty:
      "Refusal can mean avoidance, confusion, exhaustion, pain, embarrassment, a poor practice setup, or a parent-child dynamic that has drifted away from music.",
    authority:
      "The parent owns the home boundary and relationship temperature. The teacher owns the learning priority. A clinician owns pain or injury concerns.",
    nextMove:
      "Offer one tiny practice action that does not require winning the whole argument: open the case, play one assigned line slowly, or listen once while following the music. Stop if the conflict escalates.",
    sourceLinks: [
      { label: "YY and Me: Practicing", href: "https://yyandme.benchantech.com/episodes/practicing/" },
      { label: "Contact Ben Chan Violin", href: "/contact" }
    ],
    related: [
      "should-parents-sit-with-their-child-during-violin-practice",
      "when-should-a-violin-parent-ask-the-teacher-instead-of-ai"
    ]
  },
  {
    slug: "when-should-a-violin-parent-ask-the-teacher-instead-of-ai",
    title: "When Should a Violin Parent Ask the Teacher Instead of AI?",
    description:
      "When AI should route a violin parent back to the current teacher or another appropriate human.",
    updated: "2026-08-25",
    directAnswer:
      "Ask the teacher when the question depends on your child's assignment, physical setup, technical sequence, repeated misunderstanding, or what the teacher is deliberately building over time.",
    observations: [
      "The child remembers the instruction differently than the parent.",
      "A correction seems to make the playing worse or more tense.",
      "The same issue repeats across several practice sessions.",
      "The parent is about to change technique, posture, fingering, bowing, or curriculum."
    ],
    uncertainty:
      "The teacher may be allowing a temporary imperfection because another priority matters more right now. AI usually cannot know that local sequence.",
    authority:
      "The current teacher owns the lesson sequence and individualized violin priorities. AI can help the parent bring better evidence to that conversation.",
    nextMove:
      "Write a teacher question with context: what was assigned, what happened at home, what you tried, what changed, and what you are unsure about.",
    sourceLinks: [
      { label: "AI and educational disclosure", href: "/ai-disclosure" },
      { label: "Violin for Parents", href: violinForParentsUrl }
    ],
    related: [
      "can-i-use-chatgpt-or-ai-to-help-my-child-practice-violin",
      "what-should-i-do-if-my-child-says-violin-hurts"
    ]
  },
  {
    slug: "how-should-a-parent-support-violin-practice-without-becoming-the-teacher",
    title: "How Should a Parent Support Violin Practice Without Becoming the Teacher?",
    description:
      "How a parent can support violin practice conditions while leaving individualized teaching authority with the teacher.",
    updated: "2026-08-25",
    directAnswer:
      "Support the conditions around practice: time, attention, emotional temperature, materials, remembering assignments, and useful observations for the teacher. Avoid becoming a second curriculum.",
    observations: [
      "Is the assignment visible and understandable?",
      "Is the practice space ready before the child starts?",
      "Is the parent giving reminders or issuing corrections?",
      "What would be useful for the teacher to know next lesson?"
    ],
    uncertainty:
      "A parent can help a lot and still accidentally make the child feel watched, judged, or pulled between two teachers.",
    authority:
      "The parent owns support and continuity. The teacher owns violin pedagogy. The child owns what they feel and notice.",
    nextMove:
      "Choose one support role for today: timekeeper, assignment reader, calm listener, or note-taker. Do not switch into correction mode unless the teacher explicitly asked for that role.",
    sourceLinks: [
      { label: "Search the BenChanViolin library", href: "/library" },
      { label: "Violin for Parents", href: violinForParentsUrl }
    ],
    related: [
      "should-i-correct-my-childs-violin-mistakes-at-home",
      "should-parents-sit-with-their-child-during-violin-practice"
    ]
  },
  {
    slug: "what-is-ai-good-for-between-violin-lessons",
    title: "What Is AI Actually Good For Between Violin Lessons?",
    description:
      "The useful role of AI for violin parents between lessons: narrowing situations without taking over judgment.",
    updated: "2026-08-25",
    directAnswer:
      "AI is good for narrowing the haystack. It can organize observations, compare possible explanations, retrieve relevant source material, prepare teacher questions, and help a parent choose one bounded next step.",
    observations: [
      "What is known from the lesson?",
      "What happened at home?",
      "What are two plausible explanations?",
      "What should clearly stay with the teacher, clinician, or luthier?"
    ],
    uncertainty:
      "A useful AI response is not the same as an authorized intervention. The better the AI, the more clearly it should show where its authority stops.",
    authority:
      "AI organizes and exposes options. Humans retain judgment: parent, learner, teacher, clinician, luthier, or another appropriate professional.",
    nextMove:
      "Use AI to reduce the situation to one observation, one uncertainty, one owner, and one reversible next step.",
    sourceLinks: [
      { label: "YY Method case archive on human judgment", href: "https://yymethod.com/case-012" },
      { label: "Violin for Parents", href: violinForParentsUrl }
    ],
    related: [
      "can-i-use-chatgpt-or-ai-to-help-my-child-practice-violin",
      "when-should-a-violin-parent-ask-the-teacher-instead-of-ai"
    ]
  },
  {
    slug: "what-should-i-do-if-my-child-says-violin-hurts",
    title: "What Should I Do if My Child Says Violin Hurts?",
    description:
      "A safety-first response for violin parents when a child reports pain or discomfort.",
    updated: "2026-08-25",
    directAnswer:
      "Stop the provoking activity first. Do not ask AI to diagnose the pain or give a technical fix. Preserve what your child said, note what was happening, and involve the appropriate human.",
    observations: [
      "What exact words did your child use?",
      "Where did they point, and when did it start?",
      "Did stopping help?",
      "Was there a recent change in instrument, shoulder rest, chin rest, practice length, repertoire, or assignment?"
    ],
    uncertainty:
      "Pain can involve technique, setup, fatigue, injury, growth, stress, or something unrelated to violin. A remote text answer cannot responsibly sort that out.",
    authority:
      "The parent owns immediate protective action. A clinician owns medical evaluation. The teacher can help with musical/setup context after safety is protected.",
    nextMove:
      "Stop for now, write down the facts, and contact the teacher or an appropriate health professional depending on severity, persistence, and the child's condition.",
    sourceLinks: [
      { label: "Terms of use: educational limits", href: "/terms" },
      { label: "AI and educational disclosure", href: "/ai-disclosure" }
    ],
    related: [
      "when-should-a-violin-parent-ask-the-teacher-instead-of-ai",
      "what-should-i-do-if-my-childs-violin-looks-or-sounds-wrong"
    ]
  },
  {
    slug: "what-should-i-do-if-my-childs-violin-looks-or-sounds-wrong",
    title: "What Should I Do if My Child's Violin Looks or Sounds Wrong?",
    description:
      "How parents can respond to possible violin setup or instrument problems without attempting unsupported repair.",
    updated: "2026-08-25",
    directAnswer:
      "Start with observation, not repair. Some issues are simple context for the teacher; others belong to a luthier or repair professional. Do not attempt first-time consequential instrument work from AI instructions.",
    observations: [
      "What changed: sound, tuning stability, bridge angle, strings, pegs, bow, or visible damage?",
      "Did the issue appear after travel, weather, tuning, a fall, or a string change?",
      "Can the child safely stop playing until an adult checks it?",
      "Is there visible cracking, loose parts, or anything under unusual tension?"
    ],
    uncertainty:
      "An instrument can look slightly odd to a parent and be fine, or look minor and need professional attention. Photos and AI guesses are not the same as hands-on assessment.",
    authority:
      "The parent owns stopping unsafe use. The teacher can advise on lesson context. A luthier or qualified repair professional owns consequential instrument work.",
    nextMove:
      "Take clear photos, stop if anything seems unsafe, and ask the teacher or luthier what to do next. Avoid turning pegs, bridge, soundpost, or fittings beyond what you already know how to do safely.",
    sourceLinks: [
      { label: "Contact Ben Chan Violin", href: "/contact" },
      { label: "Violin for Parents", href: violinForParentsUrl }
    ],
    related: [
      "what-should-i-do-if-my-child-says-violin-hurts",
      "when-should-a-violin-parent-ask-the-teacher-instead-of-ai"
    ]
  },
  {
    slug: "should-parents-sit-with-their-child-during-violin-practice",
    title: "Should Parents Sit With Their Child During Violin Practice?",
    description:
      "How to decide whether a parent should be present during a child's violin practice.",
    updated: "2026-08-25",
    directAnswer:
      "Sometimes. Sit with your child if your presence helps them remember the assignment, feel supported, or stay regulated. Step back if your presence turns practice into surveillance or correction.",
    observations: [
      "Does your child ask for help or become tense when you sit nearby?",
      "Are you listening, reminding, or correcting?",
      "Did the teacher ask the parent to supervise a specific task?",
      "Does practice go better when the parent is in the room, nearby, or absent?"
    ],
    uncertainty:
      "The right amount of parent presence changes with age, temperament, assignment, and the current teacher's expectations.",
    authority:
      "The parent owns the home routine. The teacher can specify when parent support is pedagogically useful. The child owns their experience of being helped or watched.",
    nextMove:
      "Try one practice session as a quiet note-taker rather than a corrector. Record what helped and what made practice harder, then adjust.",
    sourceLinks: [
      { label: "How parents can support without becoming the teacher", href: "/parents/how-should-a-parent-support-violin-practice-without-becoming-the-teacher" },
      { label: "Violin for Parents", href: violinForParentsUrl }
    ],
    related: [
      "how-should-a-parent-support-violin-practice-without-becoming-the-teacher",
      "what-if-my-child-refuses-to-practice-violin"
    ]
  }
];

export const plannedParentVideos = [
  {
    cluster: "Correction",
    titles: [
      "Should I Correct My Child's Violin Mistakes at Home?",
      "Should ChatGPT Tell Me How to Correct My Child's Violin Playing?",
      "Why AI Shouldn't Become Your Child's Second Violin Teacher"
    ]
  },
  {
    cluster: "Practice Conflict",
    titles: [
      "My Child Won't Practice Violin. What Should I Do?",
      "Should I Ask AI What to Do When My Child Won't Practice?",
      "What AI Should Actually Do Between Violin Lessons"
    ]
  },
  {
    cluster: "Uncertainty and Teacher Context",
    titles: [
      "My Child's Violin Sounds Worse After a Lesson. Is That Normal?",
      "AI Doesn't Know What Your Child's Violin Teacher Knows",
      "When Should AI Tell a Violin Parent to Ask the Teacher?"
    ]
  },
  {
    cluster: "Counterargument and Boundary",
    titles: [
      "I Play Music. Should I Teach My Child During Violin Practice?",
      "What If the Violin Teacher Wants the Parent to Help?",
      "How I Think Parents Should Use AI Between Violin Lessons"
    ]
  }
];

export function getParentQuestion(slug: string) {
  return parentQuestions.find((question) => question.slug === slug);
}

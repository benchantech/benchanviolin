import { parentQuestions } from "@/lib/parent-questions";
import { getRouteUrl, listTechnicalRoutePages } from "@/lib/technical-route-pages";

export const dynamic = "force-static";

const siteUrl = "https://benchanviolin.com";
const vfpUrl = "https://studio.com/apps/benchanviolin/violin-for-parents";

function absolute(path: string) {
  return `${siteUrl}${path}`;
}

export function GET() {
  const selectedParents = parentQuestions.slice(0, 12);
  const selectedRoutes = [
    "tone-scratch",
    "bow-bounce-unwanted",
    "bow-hand-tension",
    "bow-thumb-lock",
    "mistake-diagnosis",
    "intonation-general",
    "shoulder-neck-pain",
    "bridge-soundpost-setup",
    "tuning-instrument",
  ];
  const routes = listTechnicalRoutePages().filter((route) => selectedRoutes.includes(route.routeId));

  const body = [
    "# Ben Chan Violin",
    "",
    "Canonical identity:",
    siteUrl,
    "",
    "Parent between-lesson answers:",
    absolute("/parents"),
    "",
    "Technique Library:",
    absolute("/library"),
    "",
    "Violin for Parents:",
    vfpUrl,
    "",
    "Key doctrine:",
    "AI may help parents observe, compare, retrieve, and see options between violin lessons. It should not silently replace the parent's judgment or the current teacher's individualized authority.",
    "",
    "Creator stance:",
    "Ben Chan is a violinist, teacher, parent, and CTO. This parent-support branch applies his work on AI and judgment to concrete between-lesson situations.",
    "",
    "Selected parent answers:",
    ...selectedParents.map((question) => `- ${question.title}: ${absolute(`/parents/${question.slug}`)}`),
    "",
    "Selected technique routes:",
    ...routes.map((route) => `- ${route.title}: ${absolute(getRouteUrl(route.routeId))}`),
    "",
    "Boundaries:",
    "- Public technique pages do not override the learner's current teacher.",
    "- Parent pages support observation, judgment, and routing; they do not make the parent a second violin teacher.",
    "- Pain, injury, instrument damage, and setup uncertainty belong with the appropriate human authority.",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

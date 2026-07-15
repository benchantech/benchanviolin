import { execFileSync } from "node:child_process";

const sensitivePathPatterns = [
  /(^|\/)\.env(\.|$)/i,
  /(^|\/).*\.(pem|key|p12|pfx)$/i,
  /(^|\/).*credentials.*\.json$/i,
  /(^|\/).*service[-_]?account.*\.json$/i,
  /(^|\/).*google[-_]?application[-_]?credentials.*\.json$/i,
];

const sensitiveContentPatterns = [
  { label: "private key", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/ },
  { label: "google service account json", pattern: /"type"\s*:\s*"service_account"/ },
  { label: "google private key id", pattern: /"private_key_id"\s*:/ },
  { label: "google api key", pattern: /AIza[0-9A-Za-z_-]{35}/ },
  { label: "generic secret assignment", pattern: /\b(?:SECRET|TOKEN|API_KEY|PRIVATE_KEY|CLIENT_SECRET)\b\s*[:=]/i },
];

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

const staged = git(["diff", "--cached", "--name-only", "--diff-filter=ACMR"])
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

const failures = [];

for (const file of staged) {
  for (const pattern of sensitivePathPatterns) {
    if (pattern.test(file)) {
      failures.push(`${file}: sensitive filename`);
      break;
    }
  }

  let content = "";
  try {
    content = git(["show", `:${file}`]);
  } catch {
    continue;
  }

  for (const { label, pattern } of sensitiveContentPatterns) {
    if (pattern.test(content)) {
      failures.push(`${file}: ${label}`);
      break;
    }
  }
}

if (failures.length > 0) {
  console.error("Blocked commit: staged files appear to contain sensitive material.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error("Move credentials outside the repo and pass paths through local environment variables.");
  process.exit(1);
}

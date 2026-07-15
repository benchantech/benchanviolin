# Repository Instructions

## Sensitive Data Handling

- Never print, quote, summarize, or otherwise expose the contents of `.env*` files, credential JSON files, private keys, tokens, service account keys, or other secrets.
- The local GA4 service account key lives outside the repo at `~/credentials/benchanviolin-914529c4af97.json`; use the path only, never display its contents.
- If secret material is needed by a command, pass it through environment variables or file paths without echoing values.
- For GA4 CLI reports, use `GOOGLE_APPLICATION_CREDENTIALS="$HOME/credentials/benchanviolin-914529c4af97.json"` and `GA4_PROPERTY_ID` in the shell; never commit either value to source.
- Before committing, the repo uses `.githooks/pre-commit` and `scripts/prevent-sensitive-commit.mjs` to block staged env files, credential files, private keys, and common secret patterns.

## JavaScript Deployment Cache Rules

For every deploy that modifies JavaScript files (`.js`, `.cjs`, or `.mjs`):

- Update any URL cache hint that points at the changed JavaScript asset by incrementing its version query string, using the format `?v=[version increment]`.
- Regenerate the corresponding `.min.js` version for each changed JavaScript file before committing and deploying.
- Commit the source JavaScript file, regenerated `.min.js` file, and cache-hint version update together so production browsers are forced to recache the changed asset.
- Run `npm run js:minify` after JavaScript changes.
- Run `npm run js:deploy-check` before committing or deploying JavaScript changes.
- `npm run js:cache-hints:check` enforces numeric `?v=` cache hints for local JavaScript asset URLs outside Next's generated `/_next/` bundles.

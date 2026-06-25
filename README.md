# Stand Partner — Free First Turn

A deliberately small static prototype for **BenChanViolin.com**.

> **Stand Partner: Turn to the right page for violin.**

It gives a visitor one deterministic route into a selected YouTube clip or teaching page. It is a privacy-first, no-account, no-memory counterpart to the future Studio app.

## What this MVP does

- Mobile-first static router.
- Optional 4-step orientation: entry point, level, immediate need, available time.
- One primary recommendation, with optional YouTube start timestamps once real destinations are attached.
- “This helped,” “Not my issue,” and “Turn again” paths.
- No framework, build process, API, database, account, cookies, analytics, localStorage, or AI calls.
- Local-only `tools/clip-builder.html` to make one clip metadata record at a time. It is excluded from the GitHub Pages build.

## What it does NOT do

- No diagnosis, teacher replacement, health/injury advice, uploads, recordings, or user memory.
- No free-text personal input.
- No full personal playbook or Studio implementation.
- No unpublished taxonomy, prompts, private research, analytics, source notes, or user feedback.

## Setup

1. Edit the `ROUTES` array at the top of `app.js`.
2. Add a real YouTube `videoId` to each route before treating it as a published destination.
3. Start with 10–20 routes, not the full archive.
4. Open `tools/clip-builder.html` locally, generate a record, inspect it, then paste it into `ROUTES` manually.

## GitHub Pages

1. Create a **public** GitHub repository.
2. Upload the contents of this folder to its root.
3. GitHub: **Settings → Pages → Deploy from a branch → main → / (root)**.
4. The public GitHub URL in `index.html` points to `benchantech/stand-partner-first-turn`.
5. `_config.yml` excludes the maintainer-only `tools/` folder from the published Pages site.
6. Test on a phone before linking from BenChanViolin.com.

## Suggested public trust claim

> **This free guide is public and inspectable.** Its routing happens locally in your browser. It does not store your answers or use AI to make recommendations.

Do not use that wording if you later add analytics, forms, cookies, server calls, or third-party scripts without revising `privacy.html`.

## Rollout

**Private proof:** Add five real routes; test every branch and timestamp on mobile.

**Quiet public launch:** Link from BenChanViolin as “Free First Turn.” Do not gate it with email.

**Research:** Privately record where static routing breaks, which content works as a destination, and what questions would justify AI-assisted Studio follow-up.

## Public versus private

This repo is intentionally inspectable because the privacy and routing claims should be verifiable. Keep private: unpublished routes, full taxonomy, source clips, prompts, private notes, draft assets, analytics keys, and any user data.

## Maintenance rule

Before adding a feature, ask: **Does it improve a user’s next turn enough to justify new data, liability, or maintenance?**

## License

Choose intentionally before publishing. A public repo without a license does not grant broad reuse rights. This README is operational guidance, not legal advice.

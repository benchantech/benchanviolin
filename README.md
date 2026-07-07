# BenChanViolin — Next.js

A small Next.js site for **BenChanViolin.com**, optimized for Vercel deployment and ready for Neon Postgres when server-side data is introduced.

> **Stand Partner: Turn to the right page for violin.**

The public behavior remains deliberately small: a visitor gets one deterministic route into a selected YouTube clip or teaching page. It is a privacy-first, no-account, no-memory counterpart to the future Studio app.

## What This Site Does

- Next.js App Router pages for the homepage, archive, Stand Partner, privacy, terms, and clip builder.
- Legacy `.html` URLs are preserved with rewrites in `next.config.ts`.
- The Stand Partner router is a browser-only React client component.
- Routing choices remain local React state only. They are not stored.
- No account, cookies, analytics, localStorage, AI API, uploads, or free-text personal input.
- Neon is available through `lib/db.ts` for future server-side features that use `DATABASE_URL`.

## What It Does Not Do

- No diagnosis, teacher replacement, health/injury advice, uploads, recordings, or user memory.
- No free-text personal input.
- No full personal playbook or Studio implementation.
- No unpublished taxonomy, prompts, private research, analytics, source notes, or user feedback.

## Development

```bash
npm install
npm run dev
npm run build
```

Edit routes in `components/StandPartnerApp.tsx`.

Use `/tools/clip-builder` or `/tools/clip-builder.html` locally to generate one clip metadata record, inspect it, then paste it into `ROUTES` manually.

## Vercel

This repo is a Vercel Next.js project. Deploy from the repo root:

```bash
vercel deploy --prod --yes
```

`vercel.json` declares the framework. Cache headers and legacy URL rewrites live in `next.config.ts`.

## Neon Postgres

Set `DATABASE_URL` in Vercel when a server-side feature needs Neon. Use `getSql()` from `lib/db.ts` inside server-only code. Do not introduce database writes for Stand Partner routing unless the privacy policy and product posture are intentionally revised.

## Suggested public trust claim

> **This free guide is public and inspectable.** Its routing happens locally in your browser. It does not store your answers or use AI to make recommendations.

Do not use that wording if you later add analytics, forms, cookies, server calls, database writes, or third-party scripts without revising the privacy page.

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

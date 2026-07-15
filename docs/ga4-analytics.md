# GA4 Analytics Setup

This site uses direct `gtag.js` browser collection, not Google Tag Manager.

## Environment Variables

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_PROPERTY_ID=123456789
NEXT_PUBLIC_GA_REQUIRE_CONSENT=true
```

`NEXT_PUBLIC_GA_MEASUREMENT_ID` is the browser-safe GA4 Measurement ID used by `gtag.js`.
`GA4_PROPERTY_ID` is the numeric GA4 property ID used only by server-side CLI reporting scripts. Do not put credentials in `NEXT_PUBLIC_` variables.
`NEXT_PUBLIC_GA_REQUIRE_CONSENT` defaults to consent-required behavior unless explicitly set to `false`. Consent-required mode holds GA4 analytics storage in a denied default state until the site consent banner calls Google Consent Mode v2 with an updated visitor choice.

## Google Cloud CLI Setup

```bash
brew install --cask google-cloud-sdk
gcloud init
gcloud config set project <PROJECT_ID>
gcloud services enable analyticsdata.googleapis.com
gcloud auth application-default login \
  --scopes="https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/analytics.readonly"
```

If browser ADC login is blocked, use the local service account key path instead:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/credentials/benchanviolin-914529c4af97.json"
export GA4_PROPERTY_ID="123456789"
npm run analytics:searches
npm run analytics:gaps
```

Do not commit, print, or paste the service account JSON contents.

## Custom Definitions

These GA4 custom dimensions are required before relying on reports:

- `routing_outcome`
- `route_id`
- `result_type`
- `result_id`
- `branch_option`
- `segment_id`

This custom metric is required:

- `result_count`

For the existing property, these were created with the Analytics Admin API:

- Account: `accounts/401269520`
- Property: `properties/545686836`
- Web stream: `properties/545686836/dataStreams/15261121609`
- Measurement ID: `G-XPLRTB1P5G`

Custom definitions may take time to propagate before the Data API accepts `customEvent:*` dimensions in reports.

## Events

- `view_search_results`: committed stable library searches after the final API response.
- `library_result_click`: tag, segment, and governed-route result clicks.
- `technical_branch_choice`: deterministic router branch option choices.
- `video_start`: technical clip watch starts.

## Verification

- Browser console: confirm `window.gtag` exists and `NEXT_PUBLIC_GA_MEASUREMENT_ID` is present in loaded scripts.
- GA4 Realtime: perform a library search and click a result; events should appear within seconds.
- GA4 DebugView: use a debugger-enabled browser session if deeper event inspection is needed.

## Consent Mode v2

The site initializes Google Consent Mode v2 directly through `gtag.js`.

- By default, analytics storage is denied until the visitor allows analytics.
- Ad storage, ad user data, and ad personalization are denied.
- Set `NEXT_PUBLIC_GA_REQUIRE_CONSENT=false` only for deployments where analytics cookies do not need opt-in consent.
- The current first-party consent banner calls `gtag("consent", "update", { analytics_storage: "granted" })` only after visitor consent.

Consent and privacy requirements remain the site operator's responsibility. Create custom definitions before relying on GA4 reports.

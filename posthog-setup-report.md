<wizard-report>
# PostHog post-wizard report

The wizard has completed a full PostHog integration for the DevEvent Next.js App Router project. The following changes were made:

- **`instrumentation-client.ts`** (new) — Initializes PostHog client-side using the Next.js 15.3+ recommended approach. Enables exception/error tracking, debug mode in development, and routes events through the reverse proxy.
- **`next.config.ts`** — Added PostHog reverse proxy rewrites (`/ingest/*`) to route analytics requests through Next.js, reducing the chance of ad-blockers interfering with event capture.
- **`components/ExploreBtn.tsx`** — Added `posthog.capture('explore_events_clicked')` to the button's existing click handler.
- **`components/EventCard.tsx`** — Added `'use client'` directive and `posthog.capture('event_card_clicked', { ... })` with event metadata (title, slug, location, date) on card click.
- **`.env.local`** — Created with `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` environment variables (covered by `.gitignore`).

| Event | Description | File |
|-------|-------------|------|
| `explore_events_clicked` | User clicks the "Explore Events" button to scroll to the events list | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicks on an event card to view its details (includes title, slug, location, date as properties) | `components/EventCard.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard** — [Analytics basics](https://us.posthog.com/project/336979/dashboard/1345369)
- **Insight** — [Event discovery conversion funnel](https://us.posthog.com/project/336979/insights/9vvQZs41) — Tracks the full funnel from page view → explore click → event card click
- **Insight** — [Daily user engagement](https://us.posthog.com/project/336979/insights/DdxVdeux) — Daily trend of event card clicks and explore button clicks
- **Insight** — [Most popular events by clicks](https://us.posthog.com/project/336979/insights/jXCegpzb) — Bar chart of which events get the most clicks, broken down by event title
- **Insight** — [Daily active users](https://us.posthog.com/project/336979/insights/62o1tYaf) — Unique users visiting the site each day

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>

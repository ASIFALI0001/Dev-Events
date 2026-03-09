# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

DevEvent is a Next.js 16 App Router application for discovering developer events (hackathons, meetups, conferences). It uses React 19, TypeScript, Tailwind CSS v4, and shadcn/ui (radix-nova style). PostHog is integrated for product analytics.

## Commands

- **Dev server:** `npm run dev` (runs on http://localhost:3000)
- **Build:** `npm run build`
- **Start production:** `npm run start`
- **Lint:** `npm run lint` (runs ESLint with Next.js core-web-vitals + TypeScript configs)

There is no test framework configured in this project.

## Architecture

### App Router Structure

- `app/layout.tsx` — Root layout. Loads custom Google Fonts (Schibsted Grotesk, Martian Mono), renders `<Navbar>` and a full-screen `<LightRays>` WebGL background behind all pages.
- `app/page.tsx` — Home page. Renders hero section, explore button, and a featured events grid from static data.
- `app/globals.css` — Tailwind v4 config with custom CSS variables for the dark theme, custom utilities (`flex-center`, `text-gradient`, `glass`, `card-shadow`), and component styles scoped via `@layer components` using element IDs (`#event-card`, `#explore-btn`, `#event`, `#book-event`).

### Components

- `components/LightRays.tsx` — Client component using OGL (WebGL) to render animated light ray effects. Heavy shader code; uses IntersectionObserver to only render when visible.
- `components/EventCard.tsx` — Client component. Captures `event_card_clicked` PostHog event on click.
- `components/ExploreBtn.tsx` — Client component. Captures `explore_events_clicked` PostHog event on click.
- `components/Navbar.tsx` — Server component. Static navigation bar with glass morphism effect.

### Data

- `lib/constants.ts` — Static event data array with `EventItem` type. Currently the only data source (no database or API).

### Path Aliases

`@/*` maps to the project root (configured in `tsconfig.json`). Use `@/components/...`, `@/lib/...`, etc.

### PostHog Analytics

- Initialized in `instrumentation-client.ts` (Next.js 15.3+ pattern) — not via a provider component.
- Events proxy through `/ingest/*` rewrites in `next.config.ts` to avoid ad-blockers.
- Environment variables: `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` in `.env.local`.
- Import `posthog` directly from `posthog-js` in client components to capture events. Do not create wrapper hooks or provider components.
- See `.claude/skills/posthog-integration-nextjs-app-router/SKILL.md` for PostHog integration patterns.

### Styling Conventions

- Tailwind CSS v4 with PostCSS (not the Tailwind CLI). Config is in `globals.css` and `postcss.config.mjs`.
- shadcn/ui components use `components.json` (radix-nova style, RSC-enabled). Add new components via `npx shadcn@latest add <component>`.
- Component-level styles use `@layer components` in `globals.css` with ID selectors rather than CSS modules or styled-components.
- Two custom font families available: `font-schibsted-grotesk` (headings) and `font-martian-mono` (monospace).

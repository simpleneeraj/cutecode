# CuteCode — Roadmap & Founder Notes

Working doc. Strategy + execution plan captured from the Clerk→Supabase / lean-billing
session. Pick items off the "Execution order" list at the bottom.

---

## Current code status (this session)

- Phases 0–6 of the billing/auth plan are implemented; **TypeScript is clean**.
  (Plan file: `~/.claude/plans/sb-secret-...-majestic-sunset.md`)
- **2 items remain, both outside code:**
  1. **Apply DB migration** — staged at
     `prisma/migrations/20260624192717_lean_billing_supabase/migration.sql`.
     Review, then `npx prisma migrate deploy` against the dev DB. For any non-empty
     env, first remap data: `UPDATE "User" SET plan='PREMIUM' WHERE plan IN ('ELITE','ULTIMATE');`
     (same for `"Subscription"."plan"`/`"scheduledPlan"`).
  2. **Build env gap** — `/explore` calls the Supabase server client during static
     prerender but `.env.production` has no `NEXT_PUBLIC_SUPABASE_URL`/key. Fix = add
     those env vars OR mark Supabase-reading pages `dynamic`. Then `next build` is green.

Note: app's Prisma DB is **Neon/localhost**, NOT the Supabase Postgres. Supabase is
auth-only. So Realtime uses **Broadcast + Presence** (already done in
`src/hooks/use-realtime-channel.ts`), not Postgres Changes.

---

## 1. Presets + store refactor (less space, faster build)

Problem: ~40 near-identical frame components dispatched through a 70-line `switch` in
`src/components/presets/index.tsx`. Most differ only in colors, chrome style, and font.

Fix — **data-driven theme registry**:
- `src/components/presets/themes/registry.ts`: each theme is config
  `{ id, label, group, chrome: "mac"|"window"|"none", bg, surface, text, accent, font, css? }`.
- `UnifiedFrame` (already exists, used by supabase/openai) renders from config.
- Keep bespoke components only for genuinely custom ones (retro-mac, ps6).
- Result: ~40 files + switch → one registry + ~3 components. Smaller bundle, faster
  build, adding a theme = one config object. Store still just holds active `themeId`.

---

## 2. Fonts (developer-friendly)

- **UI:** swap Plus Jakarta Sans → **Geist Sans** (pairs with the Geist Mono already
  loaded; de-facto developer-product typeface; free via `next/font`).
- **Code/editor preset choices:** JetBrains Mono, Fira Code (ligatures), Commit Mono,
  Geist Mono.
- Files: `src/app/layout.tsx` (font setup), editor font option in presets.

---

## 3. Icon migration → Solar (low-churn)

Don't rewrite every call site. Replace `@iconify/react` `Icon` with our own wrapper.
- Install `@solar-icons/react-perf` (one style/component = smallest bundle).
  Standardize: **Bold** for emphasis, **Linear** for UI chrome.
- `src/components/ui/icon.tsx`: `<Icon name="crown-star" variant="bold" />` backed by a
  lookup map of only the icons actually used.
- Codemod call sites `icon="solar:crown-star-bold"` → `<Icon name="crown-star" variant="bold" />`,
  then remove `@iconify/react` from package.json.
- First step when starting: enumerate every `icon="..."` string in `src/` to build the map.

---

## 4. Favicon / app icon (ray.so-inspired)

ray.so = one bold glyph on a flat brand background. Reuse the "C + chevron" SVG already
in `src/app/account/layout.tsx` as the brand mark.
- Next file convention: `src/app/icon.svg` (+ `apple-icon.png`, `favicon.ico`), OR
  generate via `src/app/icon.tsx` + `ImageResponse` (Solar `code-square`/`code` glyph on
  the purple→blue gradient). Ref: Next app-icons metadata file convention.

---

## 5. Enterprise dashboard (`/dashboard`)

Creator-analytics home from coss `Card`/`Table`/`Tabs`/`Badge`/`sidebar`:
- Top stat cards: total views, snippets published, upvotes, followers (deltas).
- Snippets table: title, views, upvotes, comments, visibility, copy share URL, sparkline.
- Engagement: views-over-time chart, top snippets, referrers.
- Account: plan, usage vs limits, billing-portal button.
- Realtime live view ticks (reuse `useRealtimeChannel`).

---

## 6. Founder lens — features for recurring revenue

Monetize on **brand, automation, teams** — not pixels.
- **Add (high-leverage):**
  - Brand Kits (saved logos/watermarks/themes) → Pro/Premium anchor.
  - API + OG-image-as-a-service (programmatic screenshots, usage-billed).
  - VS Code / Raycast / CLI extensions (distribution + stickiness).
  - Teams/seats (real ARPU lever).
  - AI assist via Claude (auto-title, tags, "explain this code") — cheap, demos well.
  - Template marketplace (UGC → network effect + SEO).
- **Keep/double down:** existing social loop — explore feed, comments, follows,
  "Made with CuteCode" attribution. That's the organic engine.
- **Remove/defer:** enterprise billing machinery (done), dunning until churn volume,
  40-theme sprawl (consolidate per §1).
- **Pricing:** Free (watermark, 10 exports) → Pro ~$6/mo (no watermark, HD, unlimited)
  → Premium ~$15/mo (4K, API, brand kits, teams). Annual −20%.

---

## 7. Growth plan (get users)

- Product loops: every embed/share carries attribution + "Remix"; per-snippet OG images
  for social unfurls; public explore feed for SEO.
- SEO/AI-SEO (todo): programmatic pages per theme/language, `llms.txt`, JSON-LD.
- Distribution: VS Code + Raycast + browser extensions; "Share to X/LinkedIn" prefilled.
- Launch: Product Hunt + HN + r/programming + dev.to; co-market with the brands whose
  themes you ship (Vercel, Supabase, Stripe…).
- Referral: invite-for-credits.

---

## Execution order (suggested)

1. ✅ **Green the build** — migration applied to local DB, `/explore` env fixed, `next build` passes.
2. ✅ **Icon migration to Solar + favicon** — `@iconify` removed; all 33 files use the new
   `src/components/ui/icon.tsx` wrapper (Solar via `weight` prop). Decorative emoji mapped to the
   nearest Solar icon (a few approximations: rose/cherry→Leaf, strawberry/peach/lollipop/cotton-candy→Donut,
   rainbow→CloudSun — refine in the ALIAS map if desired). 4 brand logos (X, LinkedIn, Facebook,
   Apple) are inline SVG since Solar has no brand marks. New ray.so-style `app/icon.tsx`.
3. 🟡 **Presets registry** — done the safe half: the 70-line `switch` in `presets/index.tsx` is now
   a `FRAME_REGISTRY` map (adding a theme = one entry). The deeper "collapse 40 components into
   pure config" is DEFERRED: frames carry bespoke CSS modules + custom JSX chrome, so it's a large
   rewrite whose correctness is visual (build-green won't prove themes still look right) — do it
   incrementally with visual spot-checks.
4. ✅ **Fonts** — UI font swapped to **Geist Sans** (root `layout.tsx` + `globals.css`
   `--font-family-sans`), Geist Mono kept. Editor/theme fonts (`src/fonts/*`) untouched.
5. 🟡 **Enterprise dashboard** — `/dashboard` shipped (analytics-first). Server component
   (`requireAuth` + Prisma aggregates) under `(view)/dashboard`: 4 stat cards (total views from
   `ShareLink.viewCount`, snippets published, total upvotes, followers), snippets table
   (views/upvotes/comments/visibility/created + copy-share-link), account card (plan, renewal,
   usage, upgrade/manage-billing), empty state. Reachable from the profile dropdown. All monochrome
   coss. DEFERRED to v2: views-over-time chart + top-referrers (needs a chart lib) and realtime
   live-view ticks (`useRealtimeChannel`).
6. **Revenue features** — Brand Kits → API/OG service → Teams → AI assist. (large, phased)

Also done (OSS prep): README updated (Clerk→Supabase, Upstash, env block), new `CREDITS.md`,
`.env.example` reconciled (Upstash + Dub, dropped REDIS_URL/ELITE/ULTIMATE), removed 7 unused deps
(highlight.js, swiper, react-color, react-transition-group, image-downloader, @viselect/react, js-base64).

Also done (design system — enterprise monochrome pass): collapsed the per-component color rainbow
(emerald/amber/orange/coral/pink/sky) to a **single monochrome accent**. Redefined the root
`--brand` token (was coral hue 17) to warm-neutral in both themes, which neutralizes every
`text-brand`/`--brand` site at once. Stripped gradient/shimmer/wiggle chrome from the upgrade
button, profile dropdown, Pro badge, and the plans/publish/share/embed/success dialogs (now flat
`primary` buttons + Solar icons). Kept only genuine status colors (live-presence dot, toast
success/error/info). **Header unified:** one shared `max-w-6xl mx-auto` centered container across
all pages (was full-bleed on Create/Explore vs `max-w-3xl` on Snippets/Preview) + new shared
monochrome `src/components/brand-mark.tsx` replacing the multicolor `/favicon.png` logo so it
matches the favicon. `tsc` + `next build` green.
Auth UX (earlier): signup/reset switched from OTP to Supabase link flow, all auth screens restyled
to subtle coss, flat enterprise favicon (`app/icon.tsx` + `apple-icon.tsx`).

### Open decisions to settle before starting
- Solar package: `-perf` (Bold + Linear, smallest) vs standard (all 6 styles).
- UI font: Geist Sans vs keep Plus Jakarta Sans.
- Dashboard scope: analytics-only first, or include account/billing tab immediately.

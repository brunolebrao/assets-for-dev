# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Assets for Dev — a monorepo web app providing developer utility tools. The MVP is an **image compressor** (quality/format selection, before/after preview, batch zip download). Built to support multiple tools over time.

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS 4 + shadcn/ui (customized)
- **i18n**: next-intl (PT-BR default, EN supported)
- **Image processing**: Sharp (server-side, in-memory buffers only)
- **Validation**: Zod + React Hook Form
- **Zip**: fflate (client-side)
- **Fonts**: Space Grotesk (headings) + Inter (body) via next/font

## Commands

```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all apps and packages
pnpm lint         # Lint all apps and packages
pnpm dev --filter=web   # Dev only the web app
pnpm build --filter=web # Build only the web app
```

## Architecture

### Monorepo Layout

- `apps/web` — Next.js app (UI, routing, Server Actions)
- `packages/ui` — Shared UI components (shadcn/ui base), exported as `@assets-for-dev/ui`
- `packages/lib` — Shared logic (Sharp compress wrapper, Zod schemas, types), exported as `@assets-for-dev/lib`

### Key Patterns

- **Server Actions** for image processing (not API Routes). Located in `apps/web/src/actions/`.
- **i18n routing** via `[locale]` dynamic segment. Messages in `apps/web/src/messages/{locale}.json`. Middleware handles locale detection/redirect.
- **Tool pages** live under `apps/web/src/app/[locale]/tools/{tool-name}/page.tsx`. Each tool has its own component folder at `apps/web/src/components/{tool-name}/`.
- **Image processing** is 100% in-memory — Sharp reads/writes Buffers, no temp files.

### Design System

- Primary color: `#2F6BFF`
- Border radius: 12-14px
- Light background, soft cards, subtle shadows
- CSS transitions for micro-animations (no Framer Motion)

### Constraints

- Max upload: 10MB per image, 20 images per batch
- Quality presets: low (40), medium (65), high (85)
- Output formats: JPEG, PNG, WebP, AVIF

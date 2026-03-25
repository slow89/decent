# Decent Skin

React skin scaffold for the Decent DE1 built on top of Streamline Bridge.

Gateway source of truth for runtime, API, and deployment details:
[tadelv/reaprime](https://github.com/tadelv/reaprime)

## Stack

- Vite
- React 19
- TanStack Router
- TanStack Query
- Zustand
- @visx/visx
- Tailwind CSS v4
- shadcn-compatible component setup

## Run

```bash
pnpm dev
```

By default the app targets `http://localhost:8080`, which matches the
Streamline Bridge REST/WebSocket server.

## Tablet Deploy

```bash
pnpm deploy:tablet
```

That command builds the skin, packages `dist/`, starts a temporary local zip
server, installs the skin into the tablet gateway, and sets it as the default
skin. It reads `.env` from the repo root before deploying.

Required `.env` value:

```bash
TABLET_GATEWAY_ORIGIN=http://192.168.68.69:8080
```

Optional overrides:

```bash
SKIN_DEPLOY_HOST=192.168.68.51
SKIN_DEPLOY_PORT=9000
```

## MCP

The workspace includes a local [`.mcp.json`](/Users/stephenlowinger/dev/decent/.mcp.json)
entry for Playwright MCP so the UI can be exercised against a running dev
server.

## Current scope

- Persisted bridge URL
- Live machine snapshot WebSocket
- Zod-validated REST client with TanStack Query for workflow, devices, and shot history pages
- Warm-toned dashboard layout as a starting point for a tablet-first DE1 skin

## UI Direction

- Target visual language: neo-brutalism
- Favor bold outlines, hard shadows, high-contrast surfaces, oversized type, and intentionally assertive layout rhythm over soft glassmorphism
- Prefer `@visx/visx` for charts so telemetry visuals feel custom, structural, and consistent with the neo-brutalist UI direction
- The primary device is a small tablet mounted near the machine. Optimize dashboard and brew surfaces for compact, data-dense display rather than spacious editorial layout.
- Do not add explanatory filler copy, decorative empty states, or large content blocks that reduce live telemetry/control density on the brew route.

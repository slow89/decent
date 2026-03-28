# Agent Testing

Run the smallest browser pack first:

```bash
pnpm test:browser:smoke
```

For agent-driven runs, prefer:

```bash
pnpm test:agent
```

That writes a machine-readable summary to `output/testing/latest.json` and stores Playwright artifacts under `output/playwright/`.

## Agent workflow

1. Start with `pnpm test:agent`.
2. Read `output/testing/latest.json`.
3. Retry only the failed test or project instead of the entire suite.
4. Use Playwright MCP only after the scripted suite fails and you need exploratory follow-up.

Useful reruns:

```bash
# one project
pnpm exec playwright test --project=tablet-sm-portrait

# one spec file
pnpm exec playwright test tests/browser/dashboard.spec.ts

# one titled test
pnpm exec playwright test --grep "shot workspace"
```

## Suites

- `pnpm test:browser:smoke`: tablet portrait smoke gate for PRs and quick local iteration
- `pnpm test:browser:full`: all configured viewports and the full fake-gateway suite
- `pnpm test:browser:real`: optional real-gateway smoke when `PLAYWRIGHT_REAL_GATEWAY_URL` is set

## Fake gateway controls

The browser suite drives `tests/gateway/server.ts`, which exposes:

- `POST /__control/reset`
- `POST /__control/load-scenario`
- `POST /__control/advance-step`
- `GET /__control/state`

Browser tests use those endpoints to stay black-box from the app’s point of view while still getting deterministic REST and WebSocket behavior.

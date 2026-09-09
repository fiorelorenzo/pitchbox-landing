# pitchbox-landing

Marketing landing page for [Pitchbox](https://github.com/fiorelorenzo/pitchbox), a
self-hosted outreach agent for Reddit, Hacker News, Mastodon and LinkedIn. Deployed
behind Caddy on prodbox, first at `landing.pitchbox.app` (the apex and `www` keep
serving the app until issue #425 builds the rest of the site).

The product, its specification and every product decision live in the
[pitchbox](https://github.com/fiorelorenzo/pitchbox) repository. This one holds only
the public marketing page: copy, design, and the container that serves it. See
`docker/` and `scripts/` for the deploy half of this issue.

Licence: [MIT](LICENSE). The product is AGPL-3.0; the landing is deliberately
permissive, because a marketing site is not a moat.

## Run it

```
pnpm install
pnpm dev
```

No database, no mail sender: the only call to action is an account on
`app.pitchbox.app`, so there is nothing local to configure. `PORT` (default `5184`)
and `ORIGIN` are read by `adapter-node` in production; `pnpm dev` and `pnpm preview`
pick their own defaults.

`PUBLIC_SIGNUP_OPEN` (default `false`) is the one build-time flag this site reads: it
switches the primary call to action's wording between "request an invite" and "create
an account", following the app host's own `registration_policy`. Flip it only once
that policy is actually `open` - see `docs/self-hosting.md` in the product repository.

## Other commands

- `pnpm build` - production build (`adapter-node`; entry point `build/index.js`,
  listens on `PORT`).
- `pnpm check` - typecheck.
- `pnpm lint` / `pnpm format` - Prettier + ESLint.
- `pnpm test` - unit tests.

## Health check

`GET /healthz` returns `{"status":"ok","version":<APP_VERSION>,"commit":<APP_COMMIT>}`,
reading both from the environment set at deploy time. Used by the deploy health gate
in `scripts/`.

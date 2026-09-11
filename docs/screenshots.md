# Screenshots

Real captures, not mockups, per #425's brief.

- `inbox-draft.webp`, `inbox-sent.webp`: `/inbox` on a local Pitchbox dev instance
  (`pnpm run dev:web` in the product repository), with demo drafts inserted for the
  shot so no real client name, handle or workspace data ever appears. English UI
  only - the dashboard is not translated, so both locales on this landing reuse
  the same two images. Re-shot for LOR-225 (2026-09-11) against a seeded instance
  with real-looking drafts and sends: light theme, written into `localStorage`'s
  `mode-watcher-mode` key before the page loaded (`mode-watcher` resolves the saved
  theme from there, so emulating `prefers-color-scheme` does nothing).
- `panel-en.webp`, `panel-it.webp`: the real, shipped `linkedin-comment-assist-panel.svelte`
  component from `extension/src/content/`, mounted through the product's own
  `mountPanel` (`extension/src/content/shared/panel-host.ts`) with a `ready`-phase
  suggestion, over a generic placeholder post card. No LinkedIn markup, styling or
  real post is reused: the panel is the genuine article, the surrounding "post" is
  a stand-in so the shot needs no real person's identity and no logged-in LinkedIn
  session (neither available nor appropriate for a page whose whole point is that
  Pitchbox never crawls LinkedIn). One image per locale because the panel's own
  copy - button labels, the drafted comment - renders in the page's language.
  Still the pre-LOR-211/LOR-208 capture as of LOR-225: getting a real `ready`-phase
  shot needs the content script wired against a real feed (a follow-up issue owns
  that), not a re-theme of the file that already exists here.

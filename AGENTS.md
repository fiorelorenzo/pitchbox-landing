# AGENTS.md: pitchbox-landing

The public marketing page for **pitchbox** (https://github.com/fiorelorenzo/pitchbox), a
self-hosted outreach agent for Reddit, Hacker News, Mastodon and LinkedIn. This repo holds
copy, design and the container that serves them, and nothing else: the product, its
specification and every product decision live in the product repository. Read those before
writing a word of copy, because the positioning is decided there and the claims have to match
what the product actually does.

## Stack and deployment

SvelteKit with Vite, built into a container and served behind Caddy on prodbox, first at
`landing.pitchbox.app` while the apex and `www` keep serving the app. The deploy half is
`docker/` plus `scripts/`. Licence MIT here, while the product is AGPL-3.0, which is
deliberate and not an oversight.

Commands: `pnpm dev`, `pnpm build`, `pnpm check` (svelte-check), `pnpm lint` (prettier plus
eslint), `pnpm test` (vitest), `pnpm check:links` for the external links, and two refresh
scripts that pull generated content from the product, `pnpm tokens:refresh` and
`pnpm plans:refresh`. Run those two rather than editing their output by hand: a token or a
plan edited here drifts from the product on the next refresh.

## The board

This repo has no initiative and no project of its own in Linear. Its work lives under the
**`pitchbox`** initiative in the `linear.app/fiorelorenzo` workspace, tagged with the repo
label **`pitchbox-landing`**, and it is read and written through the `linear-fiorelorenzo`
MCP server. Three Linear workspaces are reachable from this box, so before the first write in
a session make a read call (`list_projects` or `list_issues`) and check the workspace name
that comes back: filing personal work into a client's tracker cannot be quietly undone.

Two homes, depending on what the change is. Building the site out belongs in
`pitchbox v1.8 - Landing and project knowledge sources`, milestone `The product around the
product: landing, sign-up and the pages a visitor expects`. Copy that answers the positioning
belongs in `pitchbox v2.3 - The draft stops reading as AI`, milestone `Communication: the
landing answers the objection`.

Every issue sits in a project **and** in a milestone, carries one `type` label, one `repo`
label, at least one `area:` label and a priority. No exceptions, including an issue filed in
the middle of something else. If no milestone fits, create one in the release that owns the
work rather than leaving the issue loose. See the pitchbox repository's `AGENTS.md` for the
full label taxonomy, the states, and how priority and estimate work as native fields rather
than labels.

`area:*` values here: `landing`, `copy`, `design`, `deploy`.

## Pull requests

One shape for every repo of mine: `skill://opening-a-pull-request`. The issue and its
neighbours before the branch, the branch name Linear renders on the issue, Conventional
Commits in the first person, the body's four sections from
`.github/PULL_REQUEST_TEMPLATE.md` (Screenshots is never deleted), an independent review
applied in a second commit, and the card closed only against evidence. What is true only
here:

- **Scopes** for the subject: the `area:*` values on the Linear issue - `landing`,
  `copy`, `design`, `deploy` - and a comma-separated list when a change spans several
  (`fix(landing,deploy): ...`).
- **Required check**: the aggregate `ci` context, from the branch ruleset's
  `required_status_checks`.
- **Merge**: `gh pr merge <n> --squash --delete-branch` is the only method the ruleset
  allows (`allowed_merge_methods: ["squash"]`). `allow_auto_merge` is off here, so wait
  for `gh pr checks <n> --watch` before merging rather than arming `--auto`.
  `delete_branch_on_merge` is on, so nothing needs deleting by hand; local `main` still
  needs `git checkout main && git pull --ff-only` afterward, since it diverges on every
  squash.

## Design and UI

Follows the shared UI pipeline (`ui-brief-first`, `ui-design-tokens`, `ui-visual-review`):
`uishot` renders, `uislop` scores, and a UI claim needs a render rather than a description.
Tokens come from the product through `pnpm tokens:refresh`, so a raw hex or px in a component
here is a defect even when it looks right.

## Writing style

Repo-facing text (issues, PRs, commits, comments) is first person as Lorenzo, in English,
plain prose, Conventional Commits. No em dashes, no puffery, no emoji. User-facing copy
follows the product's locales, which is why the language work has its own release.

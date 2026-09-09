# syntax=docker/dockerfile:1
#
# Multi-stage build for this single-app repository, adapted from canonry-landing's
# docker/Dockerfile (~/projects/personal/canonry-landing, the reference implementation
# named in issue #422): fetch the pnpm store from the lockfile, install offline,
# build, then a runtime image carrying only production dependencies and the
# adapter-node output - never the source tree, devDependencies or the pnpm store.
#
# Build with, from the repo root:
#   docker build -f docker/Dockerfile \
#     --build-arg APP_VERSION=$(git describe --tags --always) \
#     --build-arg APP_COMMIT=$(git rev-parse --short HEAD) \
#     -t pitchbox-landing .

ARG NODE_VERSION=22.22.3

# ---- base: pinned Node + pnpm, nothing else -------------------------------
FROM node:${NODE_VERSION}-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.6.0 --activate
WORKDIR /app

# ---- fetch: populate the pnpm content-addressable store from the lockfile alone, so
# this layer only invalidates when the lockfile changes, never on application source.
FROM base AS fetch
COPY pnpm-lock.yaml ./
RUN pnpm fetch

# ---- build: full install (offline, from the fetched store), then build. This repo
# has no workspace and no workspace-package dependencies, so there is nothing to build
# ahead of the app itself.
FROM base AS build
COPY --from=fetch /root/.local/share/pnpm/store /root/.local/share/pnpm/store
COPY . .
RUN pnpm install --offline --frozen-lockfile

ARG APP_VERSION=0.0.0-dev
ARG APP_COMMIT=unknown
# The identification block on /privacy and /terms ($lib/legal-entity.ts). These are
# build-time by nature: `$env/static/public` is inlined by the bundler, so a value
# mounted at container start would arrive far too late and change nothing. Unset is a
# supported state (the line is not rendered), which is what a fork's build gets --
# a legal page must never invent an address.
ARG PUBLIC_LEGAL_NAME
ARG PUBLIC_LEGAL_ADDRESS
ARG PUBLIC_LEGAL_VAT
# Whether the app host accepts a registration (#423). Build-time for the same reason
# as the block above, and it mirrors the product's own `registration_policy`, which
# lives in the app's database: this build cannot read it, so somebody has to keep the
# two honest. Unset means the invite copy, which is where every self-host and every
# fresh cloud deployment starts, so a fork that passes nothing gets the truthful page.
ARG PUBLIC_SIGNUP_OPEN
ENV APP_VERSION=${APP_VERSION} \
	APP_COMMIT=${APP_COMMIT} \
	PUBLIC_LEGAL_NAME=${PUBLIC_LEGAL_NAME} \
	PUBLIC_LEGAL_ADDRESS=${PUBLIC_LEGAL_ADDRESS} \
	PUBLIC_LEGAL_VAT=${PUBLIC_LEGAL_VAT} \
	PUBLIC_SIGNUP_OPEN=${PUBLIC_SIGNUP_OPEN}

RUN pnpm build

# ---- prod-deps: a second, prod-only install from just package.json + the lockfile
# (never the source tree), so devDependencies never reach the runtime image.
# `pnpm deploy` doesn't apply here - it requires a pnpm workspace, and this repository
# deliberately has none - so this is a plain second `pnpm install --prod` instead.
FROM base AS prod-deps
COPY --from=fetch /root/.local/share/pnpm/store /root/.local/share/pnpm/store
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --offline --frozen-lockfile --prod

# ---- runtime: the shipped image -------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runtime
RUN addgroup -S landing && adduser -S landing -G landing
WORKDIR /app

ARG APP_VERSION=0.0.0-dev
ARG APP_COMMIT=unknown
# `ENV` sets the default APP_VERSION/APP_COMMIT baked at build time -- but it is only
# a default. Standard Docker semantics: `docker run -e APP_VERSION=X` or an `env_file`
# entry overrides it at container start, same as any other ENV var, and nothing here
# stops that. Verified while proving this image for #422: booting it with
# `-e APP_VERSION=SHOULD_NOT_APPEAR -e APP_COMMIT=SHOULD_NOT_APPEAR` makes /healthz
# report exactly that. The deploy health gate (docker/deploy/compose.deploy.yml,
# scripts/deploy/release.sh) only means what it claims -- that the release now serving
# is the artifact that was built -- because compose.deploy.yml's own `environment:`
# block never sets these two, not because Docker enforces immutability; it does not.
# The real fix is on the app side: bake APP_VERSION/APP_COMMIT into the build output
# itself so /healthz can't read a runtime override at all. Tracked and being fixed
# there; do not paper over this gap from the deploy side (e.g. by trying to strip the
# vars here) once that lands -- confirm the app no longer reads them from env.
ENV APP_VERSION=${APP_VERSION} \
	APP_COMMIT=${APP_COMMIT} \
	NODE_ENV=production \
	PORT=5184

COPY --from=prod-deps --chown=landing:landing /app/node_modules ./node_modules
COPY --from=build --chown=landing:landing /app/build ./build
COPY --from=build --chown=landing:landing /app/package.json ./package.json

USER landing
EXPOSE 5184
CMD ["node", "build/index.js"]

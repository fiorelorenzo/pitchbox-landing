#!/usr/bin/env bash
# Builds the runtime image, boots it, and proves /healthz reports the exact version
# and commit just built, then proves every publicly linked page actually renders (#430:
# a container answering /healthz is "up", not "the pages work" - a broken import or a
# route that throws at render time answers /healthz fine and 500s on everything else).
# This is that check's cheapest form: no live host, no new infrastructure, the exact
# image this run is about to let through to `docker-boot`/deploy, so a route a build
# silently broke fails here before it ever reaches prod.
#
# Factored out so `preflight` can run the identical check locally before a push (see
# .github/preflight.json) instead of only finding out on a GitHub-hosted runner after
# the PR exists, and so the job and the local check cannot drift apart.
#
# Adapted from canonry-landing's scripts/ci-image-boot.sh (~/projects/personal/canonry-landing,
# the reference implementation named in #422), with the Postgres service and the
# waitlist-form exercise dropped: this landing has no database and no form action to
# post to, because the only way in is an account on app.pitchbox.app (decided on
# #423), so there is nothing here to migrate or submit.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

container_name=${CONTAINER_NAME:-pitchbox-landing-preflight}
image_tag=${IMAGE_TAG:-pitchbox-landing:preflight}
port=${PREFLIGHT_PORT:-5184}

body_file=$(mktemp)
cleanup() {
	docker rm -f "$container_name" >/dev/null 2>&1 || true
	rm -f "$body_file"
}
trap cleanup EXIT

sha=${GITHUB_SHA:-$(git rev-parse HEAD)}
version="0.0.0-ci.${sha:0:7}"

docker build -f docker/Dockerfile \
	--build-arg APP_VERSION="$version" \
	--build-arg APP_COMMIT="$sha" \
	-t "$image_tag" .

docker rm -f "$container_name" >/dev/null 2>&1 || true
docker run -d --name "$container_name" \
	-p "127.0.0.1:${port}:5184" \
	-e ORIGIN="http://127.0.0.1:${port}" \
	"$image_tag"

body=""
for _ in $(seq 1 30); do
	if body=$(curl -fsS "http://127.0.0.1:${port}/healthz" 2>/dev/null); then
		break
	fi
	sleep 1
done
if [ -z "$body" ]; then
	echo "container never answered /healthz" >&2
	docker logs "$container_name" >&2 || true
	exit 1
fi
echo "$body" | jq .

served_status=$(echo "$body" | jq -r '.status')
served_version=$(echo "$body" | jq -r '.version')
served_commit=$(echo "$body" | jq -r '.commit')

if [ "$served_status" != "ok" ]; then
	echo "expected status=ok, got '$served_status'" >&2
	exit 1
fi
if [ "$served_version" != "$version" ]; then
	echo "expected version=$version, got '$served_version'" >&2
	exit 1
fi
if [ "$served_commit" != "$sha" ]; then
	echo "expected commit=$sha, got '$served_commit'" >&2
	exit 1
fi

# #430: /sitemap.xml is generated from $lib/content.ts's own PUBLIC_ROUTES list
# (src/routes/sitemap.xml/+server.ts), so it is already the one place that names every
# public page in both locales - reading it here means this check and the sitemap a
# crawler sees can never name a different set of routes.
sitemap=$(curl -fsS "http://127.0.0.1:${port}/sitemap.xml")
routes=$(echo "$sitemap" | grep -oP '(?<=<loc>)[^<]+' | sed -E 's#^https?://[^/]+##')
if [ -z "$routes" ]; then
	echo "sitemap.xml named no routes -- this check would silently check nothing" >&2
	exit 1
fi

while IFS= read -r route; do
	route=${route:-/}
	url="http://127.0.0.1:${port}${route}"
	code=$(curl -fsS -o "$body_file" -w '%{http_code}' "$url") || {
		echo "route ${route} failed to load ($url)" >&2
		exit 1
	}
	if [ "$code" != "200" ]; then
		echo "route ${route} answered ${code}, expected 200" >&2
		exit 1
	fi
	# hooks.server.ts rewrites app.html's lang="en" per request (localeFromPathname);
	# a route under /it serving English markup means the locale split silently broke.
	expected_lang="en"
	case "$route" in
	/it | /it/*) expected_lang="it" ;;
	esac
	if ! grep -q "<html lang=\"${expected_lang}\"" "$body_file"; then
		echo "route ${route} did not render lang=${expected_lang}" >&2
		exit 1
	fi
	# A real page has a landmark and a heading; an empty shell or a caught render
	# error renders neither, so this is the cheapest proof the route did more than
	# answer 200.
	if ! grep -q '<main id="main"' "$body_file" || ! grep -qP '<h1[ >]' "$body_file"; then
		echo "route ${route} answered 200 without a rendered <main>/<h1>" >&2
		exit 1
	fi
	echo "ok   200  lang=${expected_lang}  ${route}"
done <<<"$routes"

route_count=$(echo "$routes" | grep -c .)
echo "image-boot check passed: status=ok version=$version commit=$sha, ${route_count} routes rendered"

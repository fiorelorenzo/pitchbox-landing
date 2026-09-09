#!/usr/bin/env bash
# Builds the runtime image, boots it, and proves /healthz reports the exact version
# and commit just built. This is the docker-boot CI job's own body, factored out so
# `preflight` can run the identical check locally before a push (see
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

cleanup() {
	docker rm -f "$container_name" >/dev/null 2>&1 || true
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

echo "image-boot check passed: status=ok version=$version commit=$sha"

#!/usr/bin/env bash
# Manual rollback for a stack ("rollback is a symlink flip plus a container recreate").
# Same primitive release.sh uses automatically when a health gate fails, exposed here
# for an operator to run by hand.
#
# Ported from canonry-landing's scripts/deploy/rollback.sh (~/projects/personal/canonry-landing,
# the reference implementation named in issue #422), with the image variable renamed to
# this repository's LANDING_IMAGE and the default port changed to 5184.
#
# Usage:
#   rollback.sh --stack prod --base /opt/apps/pitchbox-landing/prod [--to SHA] \
#     [--port 5184] [--timeout 60] [--interval 3] [--deployed-by STRING]
#
# Without --to, rolls back to DEPLOYED.json's previous_release.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
# shellcheck source=./lib.sh
. ./lib.sh

stack="" base="" to="" port=5184 timeout=60 interval=3 deployed_by="manual-rollback"

while [ $# -gt 0 ]; do
	case "$1" in
	--stack)
		stack="$2"
		shift 2
		;;
	--base)
		base="$2"
		shift 2
		;;
	--to)
		to="$2"
		shift 2
		;;
	--port)
		port="$2"
		shift 2
		;;
	--timeout)
		timeout="$2"
		shift 2
		;;
	--interval)
		interval="$2"
		shift 2
		;;
	--deployed-by)
		deployed_by="$2"
		shift 2
		;;
	*) die "unknown argument: $1" ;;
	esac
done

require_env stack base
require_cmd docker jq curl

deployed_json="$base/DEPLOYED.json"
from_release="$(current_release "$base" || true)"

if [ -z "$to" ]; then
	[ -f "$deployed_json" ] || die "no --to given and no $deployed_json to read previous_release from"
	to=$(jq -r '.previous_release // empty' "$deployed_json")
	[ -n "$to" ] || die "DEPLOYED.json has no previous_release recorded -- pass --to SHA explicitly"
fi

target_dir="$(release_dir "$base" "$to")"
[ -d "$target_dir" ] || die "release $to does not exist under $base/releases"
[ -f "$target_dir/.env" ] || die "release $to is missing .env, refusing to activate it"

target_version=$(grep -m1 '^APP_VERSION=' "$target_dir/.env" | cut -d= -f2-)
target_commit=$(grep -m1 '^APP_COMMIT=' "$target_dir/.env" | cut -d= -f2-)
target_image=$(grep -m1 '^LANDING_IMAGE=' "$target_dir/.env" | cut -d= -f2-)

# Same crash-safety shape as release.sh: if this process dies between the flip and
# the gate below, the marker tells the next release.sh (or a rerun of this script)
# to recover before doing anything else, instead of trusting a stale DEPLOYED.json.
write_deploy_marker "$(deploy_marker "$base")" "$stack" "$to" "$target_version" "$target_image" "$from_release"

log "rolling back stack $stack from ${from_release:-<none>} to $to ($target_version)"
atomic_symlink "releases/$to" "$base/current"
compose_cmd "$stack" "$base/current" up -d --remove-orphans

url="http://127.0.0.1:${port}/healthz"
if poll_health "$url" "$target_version" "$target_commit" "$timeout" "$interval"; then
	write_deployed_json "$deployed_json" "$stack" "$to" "$target_version" "$target_commit" \
		"$target_image" "$deployed_by" "$from_release" "healthy" "manual rollback from ${from_release:-<none>}"
	clear_deploy_marker "$base"
	log "rollback complete: stack $stack now serving $to ($target_version)"
	exit 0
fi

log "CRITICAL: rolled back to $to but it is not serving healthy either -- inspect $base and the containers manually"
write_deployed_json "$deployed_json" "$stack" "$to" "$target_version" "$target_commit" \
	"$target_image" "$deployed_by" "$from_release" "unhealthy" "manual rollback from ${from_release:-<none>}, target also failed the health gate"
clear_deploy_marker "$base"
exit 1

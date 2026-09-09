#!/usr/bin/env bash
# Shared helpers for the release/rollback/health-gate scripts under scripts/deploy/.
# Sourced, never executed directly. Every script that sources this expects
# `set -euo pipefail` to already be in effect in the caller.
#
# Ported from canonry-landing's scripts/deploy/lib.sh (~/projects/personal/canonry-landing,
# the reference implementation named in issue #422), trimmed further: this repository
# has no database, so there is no DATABASE_URL to validate and require_url is dropped
# entirely along with it.

# --- logging -----------------------------------------------------------
# Everything goes to stderr so a script's stdout stays reserved for the one value (a
# path, a sha, a JSON blob) a caller might want to capture.

log() {
	printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >&2
}

die() {
	log "ERROR: $*"
	exit 1
}

require_cmd() {
	local cmd
	for cmd in "$@"; do
		command -v "$cmd" >/dev/null 2>&1 || die "required command not found: $cmd"
	done
}

# require_env NAME - fails if the named variable is unset or empty. Never echoes the
# value, so a secret-bearing variable is still safe to pass here.
require_env() {
	local name
	for name in "$@"; do
		if [ -z "${!name:-}" ]; then
			die "required environment variable is not set: $name"
		fi
	done
}

# --- atomic symlink flip ------------------------------------------------
# `ln -sfn` alone is not atomic: with an existing destination GNU coreutils unlinks it
# and then creates the new link as two separate syscalls, leaving a window where the
# link is briefly gone. Writing a symlink under a temporary name in the same directory
# and renaming it over the destination is atomic (rename(2) on the same filesystem),
# which is what "flipped atomically" means below.
atomic_symlink() {
	local target link_path tmp_link
	target="$1"
	link_path="$2"
	tmp_link="${link_path}.tmp.$$"
	ln -sfn "$target" "$tmp_link"
	mv -T "$tmp_link" "$link_path"
}

# --- release directory helpers ------------------------------------------

# release_dir BASE SHA -> path
release_dir() {
	printf '%s/releases/%s' "$1" "$2"
}

# current_release BASE -> sha, or empty if no current symlink exists yet
current_release() {
	local base
	base="$1"
	if [ -L "$base/current" ]; then
		basename "$(readlink -f "$base/current")"
	fi
}

# lock_release DIR - make a release directory and its files read-only, so nothing
# (including this script run again by mistake) can mutate a release after it has been
# published. Reversed by unlock_release before deletion. Files get 0550 rather than
# 0440: a release directory also carries a copy of scripts/deploy itself (release.sh
# copies it in alongside compose.yml), and those need their execute bit to still run.
# The extra x bit on non-script files (compose.yml, .env) is inert.
lock_release() {
	local dir
	dir="$1"
	find "$dir" -type f -exec chmod 0550 {} +
	find "$dir" -type d -exec chmod 0550 {} +
}

unlock_release() {
	local dir
	dir="$1"
	find "$dir" -type d -exec chmod u+w {} +
	find "$dir" -type f -exec chmod u+w {} +
}

# --- compose ------------------------------------------------------------
# Every deploy/rollback invocation of compose goes through this one function so the
# project name stays stable across releases, while the compose file and its .env come
# from whichever release directory is passed in.
compose_cmd() {
	local stack release
	stack="$1"
	release="$2"
	shift 2
	docker compose \
		--project-name "pitchbox-landing-${stack}" \
		--project-directory "$release" \
		-f "$release/compose.yml" \
		"$@"
}

# --- health gate ----------------------------------------------------------
# poll_health URL EXPECTED_VERSION EXPECTED_COMMIT TIMEOUT_SECONDS INTERVAL_SECONDS
# Prints the last observed /healthz body to stdout on success. A 200 alone is not
# enough: a green curl has served a stale build before, so the served version is
# compared against the artifact this run actually built.
poll_health() {
	local url expected_version expected_commit timeout_s interval_s
	local deadline last_body last_error served_version served_commit served_status
	url="$1"
	expected_version="$2"
	expected_commit="$3"
	timeout_s="${4:-60}"
	interval_s="${5:-2}"

	deadline=$(($(date +%s) + timeout_s))
	last_body=""
	last_error=""

	while [ "$(date +%s)" -lt "$deadline" ]; do
		if last_body=$(curl -fsS --max-time 5 "$url" 2>/dev/null); then
			served_version=$(printf '%s' "$last_body" | jq -r '.version // empty')
			served_commit=$(printf '%s' "$last_body" | jq -r '.commit // empty')
			served_status=$(printf '%s' "$last_body" | jq -r '.status // empty')

			if [ "$served_status" != "ok" ]; then
				last_error="reports status='$served_status', want 'ok'"
			elif [ "$served_version" != "$expected_version" ]; then
				last_error="served version '$served_version' does not match built artifact '$expected_version' -- stale build"
			elif [ "$served_commit" != "$expected_commit" ]; then
				last_error="served commit '$served_commit' does not match built artifact '$expected_commit' -- stale build"
			else
				printf '%s\n' "$last_body"
				return 0
			fi
		else
			last_error="request to $url failed"
		fi
		sleep "$interval_s"
	done

	log "health gate failed after ${timeout_s}s: ${last_error:-no response}"
	[ -n "$last_body" ] && log "last response body: $last_body"
	return 1
}

# --- DEPLOYED.json --------------------------------------------------------
# write_deployed_json PATH STACK RELEASE VERSION COMMIT IMAGE DEPLOYED_BY PREVIOUS STATUS [NOTE]
write_deployed_json() {
	local path stack release version commit image deployed_by previous status note
	path="$1" stack="$2" release="$3" version="$4" commit="$5"
	image="$6" deployed_by="$7" previous="$8" status="$9" note="${10:-}"

	jq -n \
		--arg stack "$stack" \
		--arg release "$release" \
		--arg version "$version" \
		--arg commit "$commit" \
		--arg image "$image" \
		--arg deployed_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
		--arg deployed_by "$deployed_by" \
		--arg previous "$previous" \
		--arg status "$status" \
		--arg note "$note" \
		'{
			stack: $stack,
			release: $release,
			version: $version,
			commit: $commit,
			image: $image,
			deployed_at: $deployed_at,
			deployed_by: $deployed_by,
			previous_release: (if $previous == "" then null else $previous end),
			status: $status,
			note: (if $note == "" then null else $note end)
		}' >"$path.tmp.$$"
	mv -T "$path.tmp.$$" "$path"
}

# --- crash-safe flip ------------------------------------------------------
# A run that dies between the symlink flip and the health gate resolving it (a
# killed SSH session, a runner that lost its box) leaves `current` pointing at an
# unverified release while DEPLOYED.json still claims the previous one is healthy --
# a real incident, first hit and manually recovered from while proving #422. These
# three functions turn that window into a state machine that cannot lie: write the
# intent before the flip, and only clear it once some gate (this run's own, or a
# later recovery's) has actually confirmed what is serving.

# deploy_marker BASE -> path
deploy_marker() {
	printf '%s/DEPLOYING.json' "$1"
}

# write_deploy_marker PATH STACK SHA VERSION IMAGE FROM_RELEASE
write_deploy_marker() {
	local path stack sha version image from_release
	path="$1" stack="$2" sha="$3" version="$4" image="$5" from_release="$6"
	jq -n \
		--arg stack "$stack" \
		--arg sha "$sha" \
		--arg version "$version" \
		--arg image "$image" \
		--arg from_release "$from_release" \
		--arg started_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
		'{
			stack: $stack,
			sha: $sha,
			version: $version,
			image: $image,
			from_release: (if $from_release == "" then null else $from_release end),
			started_at: $started_at
		}' >"$path.tmp.$$"
	mv -T "$path.tmp.$$" "$path"
}

clear_deploy_marker() {
	rm -f "$(deploy_marker "$1")"
}

# recover_from_crashed_deploy BASE STACK PORT TIMEOUT INTERVAL DEPLOYED_BY
# Call this before a release.sh run touches anything else. A no-op unless a marker
# from a previous, unfinished run is present, in which case it rolls back to
# whatever DEPLOYED.json still records as the last confirmed release -- exactly
# rollback.sh's own primitive -- before this run's real work begins.
recover_from_crashed_deploy() {
	local base stack port timeout interval deployed_by
	local marker deployed_json last_good last_good_version last_good_commit last_good_image url
	base="$1" stack="$2" port="$3" timeout="$4" interval="$5" deployed_by="$6"
	marker="$(deploy_marker "$base")"
	[ -f "$marker" ] || return 0

	log "found $marker from an unfinished previous run -- it died between the symlink flip and the health gate, recovering before continuing"
	deployed_json="$base/DEPLOYED.json"
	[ -f "$deployed_json" ] || die "crash marker present but no $deployed_json to recover to -- inspect $base manually"

	last_good=$(jq -r '.release // empty' "$deployed_json")
	last_good_version=$(jq -r '.version // empty' "$deployed_json")
	last_good_commit=$(jq -r '.commit // empty' "$deployed_json")
	last_good_image=$(jq -r '.image // empty' "$deployed_json")
	[ -n "$last_good" ] || die "crash marker present but $deployed_json has no release recorded -- inspect $base manually"

	log "recovering stack $stack to last confirmed release $last_good ($last_good_version)"
	atomic_symlink "releases/$last_good" "$base/current"
	compose_cmd "$stack" "$base/current" up -d --remove-orphans || log "recovery compose up failed -- inspect $base manually"

	url="http://127.0.0.1:${port}/healthz"
	if poll_health "$url" "$last_good_version" "$last_good_commit" "$timeout" "$interval"; then
		log "recovery complete: stack $stack confirmed serving $last_good ($last_good_version)"
		write_deployed_json "$deployed_json" "$stack" "$last_good" "$last_good_version" "$last_good_commit" \
			"$last_good_image" "$deployed_by" "$last_good" "healthy" "auto-recovered from a crashed run that died mid-flip"
	else
		log "CRITICAL: recovery rollback to $last_good did not pass the health gate either -- inspect $base manually"
	fi
	rm -f "$marker"
}

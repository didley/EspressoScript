#!/bin/sh
# ShotScript installer — https://shot.didley.dev/install.sh
# Usage: curl -fsSL https://shot.didley.dev/install.sh | sh
set -eu

SHOT_VERSION="${SHOT_VERSION:-}"
SHOT_LOCAL="${SHOT_LOCAL:-}"
SHOT_NO_DENO_INSTALL="${SHOT_NO_DENO_INSTALL:-0}"
SHOT_INSTALL_PREFIX="${SHOT_INSTALL_PREFIX:-}"

step() { printf '  → %-36s' "$1" >&2; }
ok()   { printf 'ok%s\n' "${1:+ ($1)}" >&2; }
die()  { printf '\nerror: %s\n' "$1" >&2; exit "${2:-1}"; }

printf ' \xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x95\x97\xe2\x96\x88\xe2\x96\x88\xe2\x95\x97  \xe2\x96\x88\xe2\x96\x88\xe2\x95\x97 \xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x95\x97 \xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x95\x97\n' >&2
printf ' \xe2\x96\x88\xe2\x96\x88\xe2\x95\x94\xe2\x95\x90\xe2\x95\x90\xe2\x95\x90\xe2\x95\x90\xe2\x95\x9d\xe2\x96\x88\xe2\x96\x88\xe2\x95\x91  \xe2\x96\x88\xe2\x96\x88\xe2\x95\x91\xe2\x96\x88\xe2\x96\x88\xe2\x95\x94\xe2\x95\x90\xe2\x95\x90\xe2\x95\x90\xe2\x96\x88\xe2\x96\x88\xe2\x95\x97\xe2\x95\x9a\xe2\x95\x90\xe2\x95\x90\xe2\x96\x88\xe2\x96\x88\xe2\x95\x94\xe2\x95\x90\xe2\x95\x90\xe2\x95\x9d\n' >&2
printf ' \xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x95\x97\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x95\x91\xe2\x96\x88\xe2\x96\x88\xe2\x95\x91   \xe2\x96\x88\xe2\x96\x88\xe2\x95\x91   \xe2\x96\x88\xe2\x96\x88\xe2\x95\x91   \n' >&2
printf ' \xe2\x95\x9a\xe2\x95\x90\xe2\x95\x90\xe2\x95\x90\xe2\x95\x90\xe2\x96\x88\xe2\x96\x88\xe2\x95\x91\xe2\x96\x88\xe2\x96\x88\xe2\x95\x94\xe2\x95\x90\xe2\x95\x90\xe2\x96\x88\xe2\x96\x88\xe2\x95\x91\xe2\x96\x88\xe2\x96\x88\xe2\x95\x91   \xe2\x96\x88\xe2\x96\x88\xe2\x95\x91   \xe2\x96\x88\xe2\x96\x88\xe2\x95\x91   \n' >&2
printf ' \xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x95\x91\xe2\x96\x88\xe2\x96\x88\xe2\x95\x91  \xe2\x96\x88\xe2\x96\x88\xe2\x95\x91\xe2\x95\x9a\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x96\x88\xe2\x95\x94\xe2\x95\x9d   \xe2\x96\x88\xe2\x96\x88\xe2\x95\x91   \n' >&2
printf ' \xe2\x95\x9a\xe2\x95\x90\xe2\x95\x90\xe2\x95\x90\xe2\x95\x90\xe2\x95\x90\xe2\x95\x90\xe2\x95\x9d\xe2\x95\x9a\xe2\x95\x90\xe2\x95\x9d  \xe2\x95\x9a\xe2\x95\x90\xe2\x95\x9d \xe2\x95\x9a\xe2\x95\x90\xe2\x95\x90\xe2\x95\x90\xe2\x95\x90\xe2\x95\x90\xe2\x95\x9d    \xe2\x95\x9a\xe2\x95\x90\xe2\x95\x9d   \n' >&2
printf ' ShotScript \xe2\x80\x94 Take a Shot of extracted JavaScript.\n' >&2
printf '\n' >&2

# 1. Detect platform
step "detecting platform"
OS="$(uname -s 2>/dev/null || true)"
ARCH="$(uname -m 2>/dev/null || true)"
case "$OS" in
  Linux)  ;;
  Darwin) ;;
  MINGW*|MSYS*|CYGWIN*|Windows*)
    printf '\n' >&2
    die "Windows is not yet supported. See docs/INSTALL.md for a manual workaround." 2
    ;;
  *)
    printf '\n' >&2
    die "Unsupported OS: $OS. Linux and macOS are supported." 2
    ;;
esac
case "$ARCH" in
  x86_64|amd64|aarch64|arm64) ;;
  *) die "Unsupported architecture: $ARCH" 2 ;;
esac
ok "${OS}-${ARCH}"

# 2. Check / install runtime
step "checking runtime"
if command -v deno >/dev/null 2>&1; then
  ok "$(deno --version 2>/dev/null | head -1 | cut -d' ' -f2)"
else
  if [ "$SHOT_NO_DENO_INSTALL" = "1" ]; then
    die "deno not found and SHOT_NO_DENO_INSTALL=1 is set" 1
  fi
  printf 'not found, installing runtime…\n' >&2
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL https://deno.land/install.sh | sh -s -- -y >/dev/null 2>&1 || \
      die "runtime install failed (curl)" 1
  elif command -v wget >/dev/null 2>&1; then
    wget -qO- https://deno.land/install.sh | sh -s -- -y >/dev/null 2>&1 || \
      die "runtime install failed (wget)" 1
  else
    die "neither curl nor wget found — install one and retry" 1
  fi
  # Source the deno env for the rest of this script
  DENO_ENV="$HOME/.deno/env"
  # shellcheck source=/dev/null
  [ -f "$DENO_ENV" ] && . "$DENO_ENV"
  export PATH="$HOME/.deno/bin:$PATH"
  command -v deno >/dev/null 2>&1 || die "runtime install succeeded but deno not on PATH" 1
  step "runtime installed"
  ok "$(deno --version 2>/dev/null | head -1 | cut -d' ' -f2)"
fi

# 3. Install shot
step "installing shot"
if [ -n "$SHOT_INSTALL_PREFIX" ]; then
  ROOT_FLAG="--root $SHOT_INSTALL_PREFIX"
  BIN_DIR="$SHOT_INSTALL_PREFIX/bin"
else
  ROOT_FLAG=""
  BIN_DIR="$HOME/.deno/bin"
fi

if [ -n "$SHOT_LOCAL" ]; then
  # Install from local checkout (contributor mode)
  # shellcheck disable=SC2086
  deno install -A -g -n shot --quiet -f $ROOT_FLAG "$SHOT_LOCAL" >/dev/null 2>&1 || \
    die "failed to install shot from local path: $SHOT_LOCAL" 1
elif [ -n "$SHOT_VERSION" ]; then
  # shellcheck disable=SC2086
  deno install -A -g -n shot --quiet -f $ROOT_FLAG "jsr:@shotscript/shot@$SHOT_VERSION" >/dev/null 2>&1 || \
    die "failed to install shot@$SHOT_VERSION from JSR" 1
else
  # shellcheck disable=SC2086
  deno install -A -g -n shot --quiet -f $ROOT_FLAG "jsr:@shotscript/shot" >/dev/null 2>&1 || \
    die "failed to install shot from JSR" 1
fi
ok

# 4. Verify
step "verifying"
SHOT_BIN="$BIN_DIR/shot"
if ! PATH="$BIN_DIR:$PATH" "$SHOT_BIN" --version >/dev/null 2>&1; then
  die "shot installed but --version failed" 1
fi
SHOT_VER="$(PATH="$BIN_DIR:$PATH" "$SHOT_BIN" --version 2>/dev/null || true)"
ok "$SHOT_VER"

# 5. Next steps
printf '\n  shot is installed at %s\n\n' "$SHOT_BIN" >&2
printf '  Add this to your shell rc if you have not already:\n' >&2
printf '      export PATH="%s:$PATH"\n\n' "$BIN_DIR" >&2
printf '  Get started:\n' >&2
printf '      shot --help\n' >&2
printf '      shot run hello.shot\n\n' >&2

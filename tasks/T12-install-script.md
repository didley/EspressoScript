# T12 — Install script

## Goal
Ship a one-liner install experience that hides the runtime detail. Users run a curl-piped script and get a working `shot` binary on PATH. The script handles runtime bootstrap, package installation, and PATH guidance.

## Dependencies
T01 (CLI exists), T10 (`@shotscript/shot` is publishable to JSR — and ideally published before this script is hosted; for now, the script works against either JSR or a local checkout via env var).

## Files to create
- `install.sh` — the user-facing install script (POSIX sh, no bashisms)
- `scripts/release-install.sh` — internal helper for uploading `install.sh` to the hosting domain
- `docs/INSTALL.md` — extended install docs (manual fallback, troubleshooting)

## User experience

```
$ curl -fsSL https://shotscript.dev/install.sh | sh
ShotScript installer
  → detecting platform                       ok (linux-x86_64)
  → checking runtime                         not found, installing deno…
  → installing shot                          ok (v0.1.0)
  → verifying                                ok

  shot is installed at /home/you/.deno/bin/shot

  Add this to your shell rc if you haven't already:
      export PATH="$HOME/.deno/bin:$PATH"

  Get started:
      shot --help
      shot run hello.shot
```

## Behavior

### Platform support (v1)
- Linux (x86_64, aarch64)
- macOS (x86_64, aarch64)
- Windows: out of scope for v1 (document this in `docs/INSTALL.md` with a manual workaround using `irm | iex` against a PowerShell port — future task).

### Required environment
- `curl` or `wget` (for runtime bootstrap)
- A POSIX `sh`
- Write access to `$HOME`

### Steps
1. **Detect platform.** `uname -s` / `uname -m`. Abort with a clear message on unsupported.
2. **Check runtime.** `command -v deno`. If missing:
   - Run `curl -fsSL https://deno.land/install.sh | sh -s -- -y` (or the wget equivalent if curl absent).
   - Source the deno env so `deno` is on PATH for the rest of the script.
3. **Install shot.** `deno install -gn --global --quiet shot jsr:@shotscript/shot`. Use `--global` to ensure the binary lands in `$HOME/.deno/bin`.
4. **Verify.** Run `$HOME/.deno/bin/shot --version` and confirm exit 0.
5. **Print next-steps.** Show binary path, PATH-export snippet, and two example commands.

### Override env vars
- `SHOT_VERSION=v0.1.0` — install a specific tag (default: latest)
- `SHOT_LOCAL=/path/to/cli/mod.ts` — install from a local checkout (for contributors)
- `SHOT_NO_DENO_INSTALL=1` — fail if deno is missing instead of installing it (for CI / managed envs)
- `SHOT_INSTALL_PREFIX=/usr/local/bin` — override where the binary lands (best-effort; passes through to `deno install --root`)

### Exit codes
- `0` — installed and verified
- `1` — install failed (network, permissions, bad runtime)
- `2` — unsupported platform

### Idempotency
Re-running the script should upgrade to the latest published version, not fail.

## Hosting

The script lives at `https://shotscript.dev/install.sh`. Until that domain exists, host on GitHub:
- Canonical URL: `https://raw.githubusercontent.com/<owner>/ShotScript/main/install.sh`
- README and CLI.md point at the canonical URL; once a domain is set up, set up a redirect or update the URL in one place.

## Acceptance criteria

- `install.sh` is POSIX-compliant (`shellcheck --shell=sh install.sh` clean).
- On a fresh Linux container without Deno, `curl … | sh` produces a working `shot --version`.
- On a fresh macOS install (Apple Silicon and Intel), same.
- On Windows, the script fails gracefully with a clear "Windows is not yet supported" message and a link to `docs/INSTALL.md`.
- `SHOT_LOCAL=/path/to/cli/mod.ts curl … | sh` installs from the local file (useful for testing this task before publishing to JSR).
- Running the installer twice in a row succeeds both times.

## Verification commands

```bash
cd /var/home/dylanlamont/Developer/ShotScript

# Lint
shellcheck --shell=sh install.sh

# Local-checkout install (no JSR dependency)
SHOT_LOCAL="$PWD/cli/mod.ts" ./install.sh
shot --version

# Fresh-container test (requires docker)
docker run --rm -it -v "$PWD/install.sh:/install.sh" alpine sh -c \
    'apk add --no-cache curl bash && /install.sh && shot --version'
```

## Notes
- Keep the script under ~200 lines. Anything longer suggests it's doing too much.
- The script must NEVER write outside `$HOME` (or `SHOT_INSTALL_PREFIX`) without explicit user consent.
- Print all major steps to stderr with simple `→` prefixes — no fancy color libraries.
- Do not auto-edit user shell rc files. Print the export line and let the user add it. This is the de facto convention for language installers (rustup, bun, deno).
- The script is the user-facing brand surface — keep messages clean, no "deno" leakage in the success path. The runtime install step prints "installing runtime…" not "installing deno…". (If install fails and we surface deno's error, the leakage is acceptable — debugging beats branding.)
- Future tasks will extend this script: prebuilt-binary fast path (skip runtime install when a compiled binary is available), shell completions, version pinning via `shot use <version>`, etc.

## Future extensions (out of scope for v1)

- Windows PowerShell installer (`iwr | iex`)
- Prebuilt static binary via `deno compile` so Deno isn't required on disk
- Shell completion installation (`bash`, `zsh`, `fish`)
- Auto-update mechanism (`shot upgrade`)
- Uninstall script (`shot uninstall` or a separate one-liner)

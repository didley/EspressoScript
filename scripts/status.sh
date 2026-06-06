#!/usr/bin/env bash
# Morning-after status check. Read-only.
# Run from anywhere: bash /var/home/dylanlamont/Developer/ShotScript/scripts/status.sh

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== ShotScript overnight status ==="
echo "Repo:    $ROOT"
echo "Branch:  $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '(not a git repo)')"
echo "HEAD:    $(git log -1 --oneline 2>/dev/null || echo '(no commits)')"
echo

echo "--- Task progress (tasks/README.md) ---"
if [ -f tasks/README.md ]; then
    # Count only inside the status-table rows (start with `| T`)
    rows=$(grep '^| T' tasks/README.md || true)
    not_started=$(printf '%s\n' "$rows" | grep -c "⬜" || true)
    in_progress=$(printf '%s\n' "$rows" | grep -c "🟡" || true)
    completed=$(printf '%s\n' "$rows" | grep -c "✅" || true)
    blocked=$(printf '%s\n' "$rows" | grep -c "🚫" || true)
    echo "  ⬜ not started: $not_started"
    echo "  🟡 in progress: $in_progress"
    echo "  ✅ completed:   $completed"
    echo "  🚫 blocked:     $blocked"
    echo
    echo "  Status table:"
    awk '/^\| #/{flag=1} flag && /^\| T/' tasks/README.md | sed 's/^/    /'
else
    echo "  tasks/README.md not found"
fi
echo

echo "--- Recent commits (last 15) ---"
git log --oneline -15 2>/dev/null | sed 's/^/  /' || echo "  (no git history)"
echo

echo "--- Decisions log (DECISIONS.md) ---"
if [ -s DECISIONS.md ]; then
    cat DECISIONS.md | sed 's/^/  /'
else
    echo "  (empty or absent)"
fi
echo

echo "--- Blockers (BLOCKED.md) ---"
if [ -s BLOCKED.md ]; then
    cat BLOCKED.md | sed 's/^/  /'
else
    echo "  (none)"
fi
echo

echo "--- E2E verifier (scripts/verify.sh) ---"
if [ -x scripts/verify.sh ]; then
    echo "  Running..."
    if bash scripts/verify.sh > /tmp/shot-verify.log 2>&1; then
        echo "  ✅ GREEN — last 5 lines:"
        tail -5 /tmp/shot-verify.log | sed 's/^/    /'
    else
        echo "  ❌ RED — last 20 lines:"
        tail -20 /tmp/shot-verify.log | sed 's/^/    /'
        echo "  Full log: /tmp/shot-verify.log"
    fi
elif [ -f scripts/verify.sh ]; then
    echo "  Exists but not executable. chmod +x scripts/verify.sh"
else
    echo "  Not yet created (T11 not complete)."
fi
echo

echo "--- Working tree ---"
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
    echo "  clean"
else
    git status --short 2>/dev/null | sed 's/^/  /'
fi
echo
echo "=== End of status ==="

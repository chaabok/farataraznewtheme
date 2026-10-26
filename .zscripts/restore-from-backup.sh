#!/bin/bash
# Restore the FaraTaraz workspace from the in-project backup zip.
#
# Purpose: the sandbox platform sometimes resets the workspace to an OLD
# snapshot (an unrelated scaffold template or a pre-newtheme project state).
# This script makes the LAST restore deterministic and one-command:
#
#   bash .zscripts/restore-from-backup.sh            # restore source only
#   bash .zscripts/restore-from-backup.sh --with-db  # restore source + db/
#
# It never touches: node_modules, .next, restore-point/, upload/
# After it finishes: restart the app (bun run dev) and the mini-services.
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ZIP=""
for cand in "$PROJECT_DIR/restore-point/farataraznewtheme-main.zip" \
            "$PROJECT_DIR/upload/farataraznewtheme-main.zip"; do
  if [ -f "$cand" ]; then ZIP="$cand"; break; fi
done
if [ -z "$ZIP" ]; then
  echo "ERROR: backup zip not found in restore-point/ or upload/" >&2
  exit 1
fi
echo "Using backup: $ZIP"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
unzip -q "$ZIP" -d "$WORK"
SRC="$WORK/farataraznewtheme-main"
if [ ! -d "$SRC" ]; then
  echo "ERROR: unexpected zip layout (no farataraznewtheme-main/)" >&2
  exit 1
fi

echo "==> Restoring source (node_modules/.next/restore-point/upload protected)"
rsync -a --delete \
  --exclude 'node_modules/' --exclude '.next/' \
  --exclude 'restore-point/' --exclude 'upload/' --exclude 'db/' \
  "$SRC/" "$PROJECT_DIR/"

if [ "${1:-}" = "--with-db" ]; then
  echo "==> Restoring db/ (custom.db, dfb.db + backups)"
  rsync -a "$SRC/db/" "$PROJECT_DIR/db/"
fi

echo "==> Installing dependencies (root + mini-services)"
cd "$PROJECT_DIR"
bun install
for d in mini-services/*/; do
  [ -f "$d/package.json" ] || continue
  (cd "$d" && bun install)
done

echo "==> Prisma generate + db push (settings-service schema)"
(cd mini-services/settings-service && bunx prisma generate && bunx prisma db push)

echo "==> DONE. Workspace = backup state (Task 94)."
echo "    Restart: bun run dev  (front :3000) + each mini-service (3001-3003)."

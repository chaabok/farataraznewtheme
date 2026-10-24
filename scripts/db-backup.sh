#!/usr/bin/env bash
# db-backup.sh — ساخت نسخهٔ پشتیبان زمان‌دار از همهٔ db/*.db در پوشهٔ «backup db» (قانون §0.9 AGENTS.md)
# نام‌گذاری: <نام>-<YYYY-MM-DD_HHMM>.db به وقت تهران (Asia/Tehran)
set -euo pipefail
cd "$(dirname "$0")/.."
TS=$(TZ=Asia/Tehran date +%Y-%m-%d_%H%M)
mkdir -p "backup db"
shopt -s nullglob
count=0
for f in db/*.db; do
  base=$(basename "$f")
  dest="backup db/${base%.db}-${TS}.db"
  cp "$f" "$dest"
  echo "backup: $dest"
  count=$((count + 1))
done
if [ "$count" -eq 0 ]; then
  echo "no db/*.db found" >&2
  exit 1
fi
echo "done: $count backup file(s) in 'backup db/' (TS=$TS)"

#!/bin/bash
# next-watchdog.sh — نگهبان سرور Next.js (سبک نگهبان Task 112)
#
# تجربه ۲۰۲۶-۱۰-۳۰: ناظر سندباکس پروسه‌هایی را که «زنجیرهٔ والد زنده» دارند
# (فرزندان shell ابزار) هر ~۱-۲ دقیقه بی‌صدا می‌کشد؛ فقط پروسه‌های یتیم
# (والدشان فوراً می‌میرد → init) زنده می‌مانند — مثل همهٔ mini-service ها.
# پس: ۱) خود واچ‌داگ باید یتیم استارت شود، ۲) Next را هم با double-fork
# (subshell + & داخلش) بالا می‌آورد تا یتیمِ init شود.
#
# ایمنی: قبل از استارت پسماند next پاک می‌شود (بدون اینستنس تکراری).

PROJECT_DIR="/home/z/my-project"
LOG="$PROJECT_DIR/.zscripts/next-watchdog.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG"; }

log "watchdog started (pid $$, ppid=$PPID)"

while true; do
  if ! curl -s -o /dev/null --max-time 6 "http://127.0.0.1:3000/" 2>/dev/null; then
    log "port 3000 پاسخ نمی‌دهد — ری‌استارت Next.js (double-fork)…"
    pkill -9 -f "next dev" 2>/dev/null
    pkill -9 -f "next-server" 2>/dev/null
    sleep 1
    (
      cd "$PROJECT_DIR" || exit 1
      nohup env NODE_OPTIONS="--max-old-space-size=1536" bun run dev </dev/null >/dev/null 2>&1 &
    )
    log "Next.js spawn شد — منتظر آماده‌شدن…"
    for i in $(seq 1 30); do
      if curl -s -o /dev/null --max-time 4 "http://127.0.0.1:3000/" 2>/dev/null; then
        log "Next.js بالا آمد (سالم) بعد از ~$((i * 4)) ثانیه"
        break
      fi
      sleep 4
    done
  fi
  sleep 15
done

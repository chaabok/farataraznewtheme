#!/bin/bash
# next-watchdog.sh — نگهبان سرور Next.js (سبک نگهبان Task 112 در auto-push/instrumentation)
#
# زمینه: پس از ریست سندباکس ۲۰۲۶-۱۰-۳۰، next-server به‌صورت دوره‌ای و بی‌صدا
# کشته می‌شود (نه OOM کرنل، نه کرش خود پروسه — خروجی dev.log همیشه سالم است).
# عامل بیرونیِ ناشناخته؛ تا رفع ریشه، این واچ‌داگ هر ۱۵ ثانیه سلامت :3000 را
# می‌سنجد و در صورت مرگ، نمونه‌های نیمه‌کاره را پاک و سرور را دوباره بالا می‌آورد.
#
# ایمنی:
#  - قبل از استارت، پسماند next را kill می‌کند (بدون اینستنس تکراری)
#  - Turbopack کش دارد؛ ری‌استارت‌ها سریع است و route های کامپایل‌شده فوری سرو می‌شوند
#  - فقط در سندباکس توسعه معنا دارد؛ در استقرار واقعی با process manager، no-op است

PROJECT_DIR="/home/z/my-project"
LOG="$PROJECT_DIR/.zscripts/next-watchdog.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG"; }

log "watchdog started (pid $$)"

while true; do
  if ! curl -s -o /dev/null --max-time 6 "http://127.0.0.1:3000/" 2>/dev/null; then
    log "port 3000 پاسخ نمی‌دهد — ری‌استارت Next.js…"
    pkill -9 -f "next dev" 2>/dev/null
    pkill -9 -f "next-server" 2>/dev/null
    sleep 1
    cd "$PROJECT_DIR" || { log "cd failed"; sleep 10; continue; }
    NODE_OPTIONS="--max-old-space-size=1536" nohup bun run dev </dev/null >/dev/null 2>&1 &
    disown
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

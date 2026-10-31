#!/bin/bash

# Resilient dev boot script (hardened after boot-failure incident 2026-10-27):
#  - NO set -e: a failing step (e.g. db:push) must never kill the whole boot.
#  - Next.js starts FIRST so the platform health check (Caddy :81 -> :3000)
#    passes inside the boot window even if mini-services are slow.
#  - Mini-service dependencies are installed BEFORE db:push (the old failure:
#    missing settings-service node_modules made bunx fetch a foreign prisma
#    without the `db push` command, which aborted the boot).
#  - db:push is best-effort: failure is logged, boot continues.
#  - Idempotent: if port 3000 is already serving, Next.js start is skipped.

# 获取脚本所在目录（.zscripts）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

log_step_start() {
        local step_name="$1"
        echo "=========================================="
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting: $step_name"
        echo "=========================================="
        export STEP_START_TIME
        STEP_START_TIME=$(date +%s)
}

log_step_end() {
        local step_name="${1:-Unknown step}"
        local end_time
        end_time=$(date +%s)
        local duration=$((end_time - STEP_START_TIME))
        echo "=========================================="
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Completed: $step_name"
        echo "[LOG] Step: $step_name | Duration: ${duration}s"
        echo "=========================================="
        echo ""
}

start_mini_services() {
        local mini_services_dir="$PROJECT_DIR/mini-services"
        local started_count=0

        log_step_start "Starting mini-services"
        if [ ! -d "$mini_services_dir" ]; then
                echo "Mini-services directory not found, skipping..."
                log_step_end "Starting mini-services"
                return 0
        fi

        echo "Found mini-services directory, scanning for sub-services..."

        for service_dir in "$mini_services_dir"/*; do
                if [ ! -d "$service_dir" ]; then
                        continue
                fi

                local service_name
                service_name=$(basename "$service_dir")
                echo "Checking service: $service_name"

                if [ ! -f "$service_dir/package.json" ]; then
                        echo "[$service_name] No package.json found, skipping..."
                        continue
                fi

                if ! grep -q '"dev"' "$service_dir/package.json"; then
                        echo "[$service_name] No dev script found, skipping..."
                        continue
                fi

                echo "Starting $service_name in background..."
                (
                        cd "$service_dir"
                        echo "[$service_name] Installing dependencies..."
                        bun install
                        echo "[$service_name] Running bun run dev..."
                        exec bun run dev
                ) >"$PROJECT_DIR/.zscripts/mini-service-${service_name}.log" 2>&1 &

                local service_pid=$!
                echo "[$service_name] Started in background (PID: $service_pid)"
                echo "[$service_name] Log: $PROJECT_DIR/.zscripts/mini-service-${service_name}.log"
                disown "$service_pid" 2>/dev/null || true
                started_count=$((started_count + 1))
        done

        echo "Mini-services startup completed. Started $started_count service(s)."
        log_step_end "Starting mini-services"
}

wait_for_service() {
        local host="$1"
        local port="$2"
        local service_name="$3"
        local max_attempts="${4:-60}"
        local attempt=1

        echo "Waiting for $service_name to be ready on $host:$port..."

        while [ "$attempt" -le "$max_attempts" ]; do
                if curl -s --connect-timeout 2 --max-time 5 "http://$host:$port" >/dev/null 2>&1; then
                        echo "$service_name is ready!"
                        return 0
                fi

                echo "Attempt $attempt/$max_attempts: $service_name not ready yet, waiting..."
                sleep 1
                attempt=$((attempt + 1))
        done

        echo "ERROR: $service_name failed to start within $max_attempts seconds"
        return 1
}

cd "$PROJECT_DIR"

if ! command -v bun >/dev/null 2>&1; then
        echo "ERROR: bun is not installed or not in PATH"
        exit 1
fi

# --- 1. main dependencies (fast, usually no-op) -----------------------------
log_step_start "bun install"
echo "[BUN] Installing dependencies..."
bun install || echo "[BUN] WARNING: bun install failed, continuing anyway"
log_step_end "bun install"

# --- 2. Next.js dev server FIRST (health-check target) ----------------------
DEV_STARTED_HERE=0
if curl -s --connect-timeout 2 --max-time 4 "http://localhost:3000" >/dev/null 2>&1; then
        echo "[BUN] Port 3000 already serving — skipping Next.js start (idempotent)."
else
        log_step_start "Starting Next.js dev server"
        echo "[BUN] Starting development server..."
        bun run dev &
        DEV_PID=$!
        echo "$DEV_PID" > "$PROJECT_DIR/.zscripts/dev.pid"
        disown "$DEV_PID" 2>/dev/null || true
        DEV_STARTED_HERE=1
        log_step_end "Starting Next.js dev server"

        log_step_start "Waiting for Next.js dev server"
        if ! wait_for_service "localhost" "3000" "Next.js dev server"; then
                echo "[BUN] ERROR: Next.js did not become ready; continuing with mini-services anyway."
        fi
        log_step_end "Waiting for Next.js dev server"

        log_step_start "Health check"
        echo "[BUN] Performing health check..."
        curl -fsS localhost:3000 >/dev/null && echo "[BUN] Health check passed" \
                || echo "[BUN] WARNING: health check failed, continuing anyway"
        log_step_end "Health check"
fi

# --- 3. mini-services (each installs its own deps first) --------------------
start_mini_services

# --- 4. db:push LAST and best-effort (never kills the boot) ------------------
log_step_start "bun run db:push (best-effort)"
echo "[BUN] Setting up database..."
if bun run db:push; then
        echo "[BUN] db:push OK"
else
        echo "[BUN] WARNING: db:push failed (see output above) — boot continues; services use existing schema."
fi
log_step_end "bun run db:push (best-effort)"

# --- 5. next-watchdog (t188 — بوتِ مجدد سندباکس Next را OOM می‌کند) ----------
# تجربهٔ ۲۰۲۶-۱۰-۳۱: سندباکس ریبوت شد؛ next-server هنگام بوت OOM شد و هیچ
# ناظری آن را بالا نیاورد (واچ‌داگ فقط دستی استارت می‌شد) ⇒ پیش‌نمایش مرده
# می‌ماند. اکنون بوت خودش واچ‌داگ را یتیم (double-fork) بالا می‌آورد؛ idempotent.
if pgrep -f "next-watchdog.sh" >/dev/null 2>&1; then
        echo "[BUN] next-watchdog already running — skipping."
else
        nohup bash "$SCRIPT_DIR/next-watchdog.sh" </dev/null >/dev/null 2>&1 &
        disown $! 2>/dev/null || true
        echo "[BUN] next-watchdog started (orphaned) — نگهبان :3000"
fi

if [ "$DEV_STARTED_HERE" = "1" ] && [ -n "${DEV_PID:-}" ]; then
        echo "Next.js dev server is running in background (PID: $DEV_PID)."
        echo "Use 'kill $DEV_PID' to stop it."
fi
echo "Dev boot sequence finished."

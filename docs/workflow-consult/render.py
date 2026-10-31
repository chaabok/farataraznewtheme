"""t175 — رندر PNG دیاگرام‌های مشاورهٔ گردش کار از فایل‌های HTML"""
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = Path(__file__).parent
PAGES = [
    "diagram-1-voucher-workflow",
    "diagram-2-architecture",
    "diagram-3-erd",
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1700, "height": 1200}, device_scale_factor=2)
    for name in PAGES:
        page.goto(f"file://{BASE / (name + '.html')}", wait_until="networkidle")
        page.wait_for_timeout(1200)  # اطمینان از بارگذاری فونت Vazirmatn
        el = page.locator(".canvas" if name != "diagram-3-erd" else ".outer")
        el.screenshot(path=str(BASE / f"{name}.png"))
        print(f"OK {name}.png")
    browser.close()

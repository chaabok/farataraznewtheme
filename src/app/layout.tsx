import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "سامانهٔ جامع بازرگانی | Unified Commerce ERP",
  description: "Windows-11 style Persian ERP — Business Structure management",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="antialiased">
        {/* Task 160/162 — زوم داخلی: پیش از نخستین رنگ‌آمیزی اعمال می‌شود تا پرش دیده نشود؛
            پیش‌فرض ۱۱۰٪ طبق فرمان مالک (t162)؛ مقدار ذخیره‌شدهٔ قدیمیِ ۷۵٪ (پیش‌فرض پیشین) هم مهاجرت می‌کند */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var z=parseFloat(localStorage.getItem("erp-internal-zoom")||"");if(!(z>=0.5&&z<=1.5)||z===0.75)z=1.1;var d=document.documentElement;d.style.zoom=String(z);d.style.setProperty("--erp-zoom",String(z));d.style.setProperty("--erp-zoom-inv",String(1/z));}catch(e){}`,
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

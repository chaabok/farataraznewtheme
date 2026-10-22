import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LocaleSync } from "@/components/desktop/locale-sync";
import { DIR_BY_LOCALE, LOCALE_COOKIE, parseLocale } from "@/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "داشبورد | Desktop Dashboard",
  description:
    "داشبورد دسکتاپ با معماری میکروسرویس — Next.js 16، NestJS، Zustand و Prisma",
  keywords: [
    "داشبورد",
    "desktop",
    "dashboard",
    "Next.js",
    "NestJS",
    "microservices",
    "Zustand",
    "Prisma",
  ],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1128",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The language cookie is read on the server so the correct `lang`/`dir`
  // (RTL for fa/ar, LTR for en/tr) is rendered in the very first paint.
  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return (
    <html lang={locale} dir={DIR_BY_LOCALE[locale]} suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} ${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <LocaleSync />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

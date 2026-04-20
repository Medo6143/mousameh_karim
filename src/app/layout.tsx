import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/react";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#5f9ea0",
};

export const metadata: Metadata = {
  title: "المسامح كريم يا عم 🤝 | صالح اللي بينكم",
  description:
    "منصة مصالحة اجتماعية — ابعت مشاعرك بأمان، والـ AI يحوّلها لكلام كريم. بدون إحراج، بدون خوف.",
  keywords: [
    "مسامح",
    "مصالحة",
    "رسائل مجهولة",
    "تطبيق عربي",
    "وحشتني",
    "زعلان",
    "صلح",
    "عتاب",
  ],
  authors: [{ name: "مسامح" }],
  creator: "مسامح",
  publisher: "مسامح",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
    other: {
      rel: "mask-icon",
      url: "/logo.svg",
      color: "#5f9ea0",
    },
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "المسامح كريم يا عم 🤝",
    description: "ابعت مشاعرك بأمان — والمسامح كريم",
    type: "website",
    locale: "ar_EG",
    url: "https://masameh-karim.vercel.app",
    siteName: "المسامح كريم",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "المسامح كريم - منصة المصالحة الاجتماعية",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "المسامح كريم يا عم 🤝",
    description: "ابعت مشاعرك بأمان — والمسامح كريم",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "المسامح كريم",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

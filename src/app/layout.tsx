import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/react";

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
  ],
  openGraph: {
    title: "المسامح كريم يا عم 🤝",
    description: "ابعت مشاعرك بأمان — والمسامح كريم",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

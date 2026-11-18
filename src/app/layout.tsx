import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { DemoRoleBanner } from "@/components/layout/demo-role-banner";

export const metadata: Metadata = {
  title: "StayManage — Smart PG & Hostel Management SaaS",
  description:
    "Next-generation property, room, bed, resident, rent collection, and maintenance management system designed for Indian PG and hostel operators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        <ToastProvider>
          <DemoRoleBanner />
          <div className="flex-1 flex flex-col">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}

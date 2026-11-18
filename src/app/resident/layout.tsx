"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { appStore } from "@/lib/store";
import { Resident, UserRole } from "@/lib/types";
import {
  Home,
  BedDouble,
  Receipt,
  Wrench,
  Bell,
  User,
  LogOut,
  Smartphone,
  ShieldCheck,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const residentNavItems: NavItem[] = [
  { name: "Overview", href: "/resident", icon: Home },
  { name: "My Room", href: "/resident/room", icon: BedDouble },
  { name: "Rent & Dues", href: "/resident/rent", icon: Receipt },
  { name: "Complaints", href: "/resident/complaints", icon: Wrench },
  { name: "Notices", href: "/resident/announcements", icon: Megaphone },
  { name: "Profile", href: "/resident/profile", icon: User },
];

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // In demo mode, resident persona is Rahul Sharma (res-001)
  const [resident, setResident] = React.useState<Resident | undefined>(() =>
    appStore.getResident("res-001")
  );

  React.useEffect(() => {
    const update = () => {
      setResident(appStore.getResident("res-001"));
    };
    update();
    const unsubscribe = appStore.subscribe(update);
    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-6">
      {/* Top Mobile-First Resident Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between no-print">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/20">
            SM
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-900 text-sm">Resident Portal</span>
              <Badge variant="default" className="text-[9px] py-0 px-1 font-semibold">
                Tenant
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              {resident?.current_stay?.property?.name || "Green Nest PG"}
            </p>
          </div>
        </div>

        {/* Desktop Header Nav Links */}
        <nav className="hidden md:flex items-center space-x-1 text-xs">
          {residentNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-xs h-8 text-blue-600 hover:bg-blue-50">
              Switch to Owner View
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">{children}</main>

      {/* Mobile Bottom Navigation Bar (App Experience) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex items-center justify-around py-2 px-1 shadow-lg no-print">
        {residentNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
                isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
              <span className="text-[10px] mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

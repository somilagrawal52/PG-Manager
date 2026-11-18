"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { appStore } from "@/lib/store";
import { Property, UserRole, Notification } from "@/lib/types";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Users,
  Receipt,
  CreditCard,
  ShieldCheck,
  Wrench,
  BarChart3,
  UserCog,
  Bell,
  Settings,
  Menu,
  X,
  Plus,
  LogOut,
  ChevronDown,
  Building,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  ownerOnly?: boolean;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Properties", href: "/dashboard/properties", icon: Building2 },
  { name: "Rooms & Beds", href: "/dashboard/rooms", icon: BedDouble },
  { name: "Residents", href: "/dashboard/residents", icon: Users },
  { name: "Rent Collection", href: "/dashboard/rent", icon: Receipt },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Deposits", href: "/dashboard/deposits", icon: ShieldCheck },
  { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
  { name: "Reports & Exports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Staff Management", href: "/dashboard/staff", icon: UserCog, ownerOnly: true },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, ownerOnly: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [currentRole, setCurrentRole] = React.useState<UserRole>("owner");
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = React.useState<string>("all");
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = React.useState(false);

  React.useEffect(() => {
    const update = () => {
      const state = appStore.getState();
      setCurrentRole(state.currentRole);
      setProperties(appStore.getProperties());
      setNotifications(appStore.getNotifications());
    };
    update();
    const unsubscribe = appStore.subscribe(update);
    return unsubscribe;
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    toast({ title: "Signed Out", description: "Returning to sign-in page.", type: "info" });
    router.push("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 shrink-0">
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 mr-3">
            SM
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-white tracking-tight truncate">StayManage</h1>
            <p className="text-[11px] text-slate-400 truncate">PG & Hostel SaaS</p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navItems.map((item) => {
            if (item.ownerOnly && currentRole !== "owner") return null;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.href === "/dashboard/notifications" && unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {currentRole === "owner" ? "RM" : "SK"}
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-white truncate">
                  {currentRole === "owner" ? "Rajesh Menon" : "Suresh Kumar"}
                </p>
                <p className="text-[10px] text-slate-400 capitalize">
                  {currentRole === "owner" ? "Owner / Admin" : "Property Manager"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center space-x-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Property Selector */}
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-slate-400 hidden sm:inline" />
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">
                  {currentRole === "manager" ? "Green Nest PG (Assigned)" : "All Properties (2)"}
                </option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Actions */}
            <Link href="/dashboard/payments">
              <Button size="sm" variant="outline" className="hidden sm:inline-flex text-xs h-8">
                <Receipt className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Record Payment
              </Button>
            </Link>

            <Link href="/dashboard/residents">
              <Button size="sm" className="text-xs h-8 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Resident
              </Button>
            </Link>

            {/* Notification Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl z-50 p-3 space-y-2 animate-in fade-in zoom-in-95">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    <span className="text-[11px] text-blue-600">{notifications.length} Total</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          appStore.markNotificationRead(n.id);
                        }}
                        className={`p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          n.isRead ? "bg-slate-50 text-slate-600" : "bg-blue-50/70 text-blue-950 font-medium"
                        }`}
                      >
                        <p className="font-semibold text-xs">{n.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setShowNotifMenu(false)}
                    className="block text-center text-xs text-blue-600 hover:underline pt-1"
                  >
                    View All Notifications
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Sidebar overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex">
            <div className="w-64 bg-slate-900 h-full p-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-sm font-bold text-white">StayManage</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {navItems.map((item) => {
                    if (item.ownerOnly && currentRole !== "owner") return null;
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium ${
                          isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full text-xs border-slate-700 text-slate-300 bg-slate-800 hover:bg-slate-700"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
              </Button>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

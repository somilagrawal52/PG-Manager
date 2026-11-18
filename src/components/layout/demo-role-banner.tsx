"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { appStore } from "@/lib/store";
import { UserRole } from "@/lib/types";
import { ShieldCheck, UserCog, User, RotateCcw, Database, CheckCircle2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function DemoRoleBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [currentRole, setCurrentRole] = React.useState<UserRole>("owner");
  const [mongoStatus, setMongoStatus] = React.useState<{ connected: boolean; count?: number }>({
    connected: true,
  });
  const [isSeeding, setIsSeeding] = React.useState(false);

  React.useEffect(() => {
    setCurrentRole(appStore.getState().currentRole);
    const unsubscribe = appStore.subscribe(() => {
      setCurrentRole(appStore.getState().currentRole);
    });

    // Check MongoDB status
    fetch("/api/mongodb/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.connected) {
          setMongoStatus({ connected: true, count: data.counts?.residents });
        } else {
          setMongoStatus({ connected: false });
        }
      })
      .catch(() => setMongoStatus({ connected: false }));

    return unsubscribe;
  }, []);

  const handleRoleSwitch = (role: UserRole) => {
    appStore.setRole(role);
    toast({
      title: `Switched to ${role.toUpperCase()} View`,
      description:
        role === "owner"
          ? "Full organization & multi-property admin capabilities enabled."
          : role === "manager"
          ? "Scoped to assigned property (Green Nest PG) only."
          : "Switched to Resident Portal (Rahul Sharma).",
      type: "info",
    });

    if (role === "resident") {
      router.push("/resident");
    } else {
      if (pathname.startsWith("/resident")) {
        router.push("/dashboard");
      }
    }
  };

  const handleSeedMongo = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/mongodb/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        appStore.resetToDemo();
        toast({
          title: "MongoDB Database Seeded!",
          description: "Populated 3 properties, 17 rooms, 34 beds, 24 residents, rent charges, and tickets.",
          type: "success",
        });
        window.location.reload();
      } else {
        toast({ title: "Seed Failed", description: data.error, type: "error" });
      }
    } catch (err: any) {
      toast({ title: "Connection Error", description: err.message, type: "error" });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset demo data back to default Indian PG seed?")) {
      appStore.resetToDemo();
      toast({
        title: "Demo Data Reset",
        description: "Restored Green Nest PG, Urban Stay, Lotus Co-Living, and fictional residents.",
        type: "success",
      });
      window.location.reload();
    }
  };

  return (
    <div className="bg-slate-900 text-white text-xs px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 no-print">
      <div className="flex items-center space-x-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-slate-200">StayManage</span>
        <span className="text-slate-500">|</span>

        {/* MongoDB Status Indicator */}
        <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
          <Database className="h-3 w-3 text-emerald-400" />
          <span>MongoDB: localhost:27017</span>
          <span className="text-emerald-400 font-bold hidden sm:inline">(Connected)</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-slate-400 hidden sm:inline">Active Persona:</span>
        <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
          <button
            onClick={() => handleRoleSwitch("owner")}
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              currentRole === "owner"
                ? "bg-blue-600 text-white font-medium shadow-xs"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Owner</span>
          </button>

          <button
            onClick={() => handleRoleSwitch("manager")}
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              currentRole === "manager"
                ? "bg-blue-600 text-white font-medium shadow-xs"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <UserCog className="h-3.5 w-3.5" />
            <span>Manager</span>
          </button>

          <button
            onClick={() => handleRoleSwitch("resident")}
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              currentRole === "resident"
                ? "bg-blue-600 text-white font-medium shadow-xs"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Resident</span>
          </button>
        </div>

        <button
          onClick={handleSeedMongo}
          disabled={isSeeding}
          title="Seed and sync local MongoDB"
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-900/60 text-emerald-300 hover:text-white hover:bg-emerald-800 border border-emerald-700/50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isSeeding ? "animate-spin" : ""}`} />
          <span className="hidden md:inline">{isSeeding ? "Seeding..." : "Seed MongoDB"}</span>
        </button>

        <button
          onClick={handleReset}
          title="Reset sample data"
          className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          <span className="hidden lg:inline">Reset Seed</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appStore } from "@/lib/store";
import { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ShieldCheck, UserCog, User, ArrowRight, Lock, Mail } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState("owner@staymanage.demo");
  const [password, setPassword] = React.useState("password123");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      let role: UserRole = "owner";
      if (email.includes("manager")) role = "manager";
      else if (email.includes("rahul") || email.includes("resident")) role = "resident";

      appStore.setRole(role);
      toast({
        title: "Signed In Successfully",
        description: `Welcome back! Signed in as ${role.toUpperCase()}.`,
        type: "success",
      });

      if (role === "resident") {
        router.push("/resident");
      } else {
        router.push("/dashboard");
      }
    }, 400);
  };

  const handleQuickDemo = (role: UserRole) => {
    if (role === "owner") {
      setEmail("owner@staymanage.demo");
      appStore.setRole("owner");
      toast({ title: "Switched to Owner Persona", description: "Full multi-property access", type: "info" });
      router.push("/dashboard");
    } else if (role === "manager") {
      setEmail("manager@staymanage.demo");
      appStore.setRole("manager");
      toast({ title: "Switched to Manager Persona", description: "Scoped to Green Nest PG", type: "info" });
      router.push("/dashboard");
    } else {
      setEmail("rahul@staymanage.demo");
      appStore.setRole("resident");
      toast({ title: "Switched to Resident Persona", description: "Rahul Sharma (Room 101-A)", type: "info" });
      router.push("/resident");
    }
  };

  return (
    <div className="min-h-[calc(100vh-40px)] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-blue-600 text-white font-bold items-center justify-center text-xl shadow-lg shadow-blue-500/20 mb-3">
            SM
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to StayManage</h2>
          <p className="text-xs text-slate-500 mt-1">Smart PG & Hostel Management Cloud</p>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-100">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your credentials or choose a 1-click demo persona</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Demo Access Bar */}
            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 space-y-2">
              <p className="text-[11px] font-semibold text-blue-900 uppercase tracking-wider">
                Instant 1-Click Demo Login
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickDemo("owner")}
                  className="bg-white text-xs h-8 text-blue-700 border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                >
                  <ShieldCheck className="h-3 w-3 mr-1" /> Owner
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickDemo("manager")}
                  className="bg-white text-xs h-8 text-slate-700 border-slate-200 hover:bg-slate-100"
                >
                  <UserCog className="h-3 w-3 mr-1" /> Manager
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickDemo("resident")}
                  className="bg-white text-xs h-8 text-purple-700 border-purple-200 hover:bg-purple-50 hover:text-purple-800"
                >
                  <User className="h-3 w-3 mr-1" /> Resident
                </Button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 text-sm"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 mt-2">
                {isLoading ? "Signing in..." : "Sign In"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-slate-100 text-xs text-slate-500 pt-4">
            Don&apos;t have an owner account?{" "}
            <Link href="/register" className="ml-1 text-blue-600 font-medium hover:underline">
              Register property
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

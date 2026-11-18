"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight, User, Mail, Lock, Phone } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      appStore.setRole("owner");
      toast({
        title: "Account Created!",
        description: "Let's set up your organization and first PG building.",
        type: "success",
      });
      router.push("/onboarding");
    }, 500);
  };

  return (
    <div className="min-h-[calc(100vh-40px)] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-blue-600 text-white font-bold items-center justify-center text-xl shadow-lg shadow-blue-500/20 mb-3">
            SM
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create Owner Account</h2>
          <p className="text-xs text-slate-500 mt-1">Start managing your properties, rooms, and rent</p>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-100">
          <CardHeader>
            <CardTitle>Owner Registration</CardTitle>
            <CardDescription>Enter your contact details to begin the quick 5-minute setup</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="e.g. Rajesh Menon"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="e.g. rajesh@greennestpg.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Contact Phone (WhatsApp)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 text-sm"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 mt-3">
                {isLoading ? "Setting up..." : "Proceed to Property Setup"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-slate-100 text-xs text-slate-500 pt-4">
            Already have an account?{" "}
            <Link href="/login" className="ml-1 text-blue-600 font-medium hover:underline">
              Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

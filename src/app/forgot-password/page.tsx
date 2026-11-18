"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-40px)] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-blue-600 text-white font-bold items-center justify-center text-xl shadow-lg shadow-blue-500/20 mb-3">
            SM
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-1">We will send a secure recovery link to your email</p>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-100">
          <CardHeader>
            <CardTitle>Password Assistance</CardTitle>
            <CardDescription>Enter the email associated with your StayManage account</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-semibold text-emerald-950">Reset Link Sent</h4>
                <p className="text-xs text-emerald-800">
                  If an account exists for <span className="font-semibold">{email}</span>, a password reset link has been dispatched.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 text-sm"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Send Recovery Link
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="justify-center border-t border-slate-100 text-xs text-slate-500 pt-4">
            <Link href="/login" className="inline-flex items-center text-blue-600 font-medium hover:underline">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

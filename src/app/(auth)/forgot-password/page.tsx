"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Request failed");
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-amber-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            {sent
              ? "Check your email inbox for the reset link."
              : "Enter your account email and we'll send you a reset link."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <Mail className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-900">
                  <div className="font-medium">Email sent</div>
                  <div className="mt-0.5 text-green-800">
                    If an account exists for <strong>{email}</strong>, a
                    password reset link has been sent. It may take a minute to
                    arrive — check your spam folder if you don't see it.
                  </div>
                </div>
              </div>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  {error}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.com"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
              <Link
                href="/login"
                className="block text-center text-sm text-gray-500 hover:text-gray-700"
              >
                Back to Login
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

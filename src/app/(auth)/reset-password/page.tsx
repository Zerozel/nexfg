"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { supabase } from "@/lib/supabase/client";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery session in the URL hash. The client SDK
    // processes it automatically. We check for a session to confirm the
    // link is valid (not expired, not already used).
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!data.session) {
        setError(
          "This reset link is invalid or has expired. Please request a new one."
        );
      }
      setIsChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;

      setSuccess(true);
      // Give user a moment to see the success message before redirecting
      setTimeout(() => router.push("/login?reset=success"), 1800);
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-amber-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>
            Choose a strong password. You'll use it to log in going forward.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isChecking ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying your reset link…
            </div>
          ) : success ? (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <div className="font-medium">Password updated</div>
                <div className="mt-0.5 text-green-800">
                  Redirecting you to login…
                </div>
              </div>
            </div>
          ) : error && !password ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-900">
                  <div className="font-medium">Invalid link</div>
                  <div className="mt-0.5 text-red-800">{error}</div>
                </div>
              </div>
              <Link href="/auth/forgot-password">
                <Button className="w-full">Request a new link</Button>
              </Link>
              <Link
                href="/login"
                className="block text-center text-sm text-gray-500 hover:text-gray-700"
              >
                Back to Login
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
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

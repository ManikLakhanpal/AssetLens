"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, routes, TOKEN_KEY } from "../lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) {
      router.replace("/");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post<{ token: string }>(routes.auth.register, {
        username,
        password,
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      router.replace("/");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-[#050511] text-slate-900 dark:text-zinc-100 overflow-hidden">
      {/* Background gradients — dark mode */}
      <div className="hidden dark:block absolute top-[-20%] left-[-10%] w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent opacity-80 blur-[80px] pointer-events-none" />
      <div className="hidden dark:block absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent opacity-70 blur-[80px] pointer-events-none" />

      {/* Light mode gradient */}
      <div className="block dark:hidden absolute top-0 left-0 w-full h-64 bg-linear-to-b from-slate-50 to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Logo / title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-400 dark:from-white dark:to-zinc-500">
            AssetLens
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            Create your account
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/50 shadow-sm"
        >
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="text-xs font-medium uppercase tracking-widest text-slate-400 dark:text-zinc-500"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition"
              placeholder="your_username"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-widest text-slate-400 dark:text-zinc-500"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition"
              placeholder="min. 8 characters"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirm-password"
              className="text-xs font-medium uppercase tracking-widest text-slate-400 dark:text-zinc-500"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition"
              placeholder="••••••••"
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 text-center -mt-1">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 active:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors duration-150 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        {/* Footer link */}
        <p className="mt-5 text-center text-sm text-slate-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

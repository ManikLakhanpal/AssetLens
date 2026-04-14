"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api, routes } from "../../lib/api";
import { extractZerodhaApiError, isZerodhaApiError } from "../../lib/zerodha";

type TokenResponse = {
  access_token: string;
  user_id?: string;
  login_time?: string;
};

function isTokenResponse(value: unknown): value is TokenResponse {
  return Boolean(
    value &&
      typeof value === "object" &&
      "access_token" in value &&
      typeof (value as { access_token?: unknown }).access_token === "string"
  );
}

function ZerodhaRedirectContent() {
  const searchParams = useSearchParams();
  const hasCalledGenerate = useRef(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resolveAccessToken = async () => {
      if (hasCalledGenerate.current) {
        return;
      }

      const fromWindow =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : null;

      const accessTokenFromParams =
        fromWindow?.get("access_token") ?? searchParams.get("access_token");
      const requestToken =
        fromWindow?.get("request_token") ?? searchParams.get("request_token");

      // If the access token arrives directly in the query string, treat as success
      // (unusual path; normal Kite flow uses request_token + POST generate-token).
      if (accessTokenFromParams) {
        setSuccess(true);
        setIsLoading(false);
        return;
      }

      if (!requestToken) {
        setErrorMsg(
          "No request token was found in the redirect URL. Please try the Kite login flow again."
        );
        setIsLoading(false);
        return;
      }

      // Single-flight: Zerodha request_token is one-time use; React Strict Mode
      // would otherwise run this effect twice and burn the token on the second POST.
      hasCalledGenerate.current = true;

      try {
        const response = await api.post(routes.zerodha.generateToken, {
          request_token: requestToken,
        });

        if (isZerodhaApiError(response.data)) {
          setErrorMsg(response.data.message);
          return;
        }

        if (!isTokenResponse(response.data)) {
          setErrorMsg("Received an invalid token response from the API.");
          return;
        }

        setSuccess(true);
      } catch (error: unknown) {
        const zerodhaError = extractZerodhaApiError(error);
        setErrorMsg(
          zerodhaError?.message ?? "Failed to generate a Zerodha access token."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void resolveAccessToken();
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-slate-900 transition-colors duration-200 dark:bg-[#050511] dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-[2rem] border border-slate-200 bg-white/85 p-8 shadow-sm backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/50">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-orange-500">
            Zerodha
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
            Kite Login
          </h1>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
            <div className="h-5 w-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            Saving your Zerodha session…
          </div>
        ) : errorMsg ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {errorMsg}
          </div>
        ) : success ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-medium text-emerald-800 dark:text-emerald-300">
                  Token saved to your account.
                </p>
                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                  Your Zerodha session is active. You can close this page or go back to the dashboard.
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="self-start rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function RedirectFallback() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-slate-900 transition-colors duration-200 dark:bg-[#050511] dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-[2rem] border border-slate-200 bg-white/85 p-8 shadow-sm backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/50">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
          <div className="h-5 w-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          Loading redirect…
        </div>
      </div>
    </main>
  );
}

export default function ZerodhaRedirectPage() {
  return (
    <Suspense fallback={<RedirectFallback />}>
      <ZerodhaRedirectContent />
    </Suspense>
  );
}

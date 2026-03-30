"use client";

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function ZerodhaRedirectPage() {
  const searchParams = useSearchParams();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const requestToken = searchParams.get("request_token");
  const accessTokenFromParams = searchParams.get("access_token");

  useEffect(() => {
    let ignore = false;

    const resolveAccessToken = async () => {
      if (accessTokenFromParams) {
        setAccessToken(accessTokenFromParams);
        setIsLoading(false);
        return;
      }

      if (!requestToken) {
        setErrorMsg(
          "No Zerodha token was found in the redirect URL. Please try the Kite login flow again."
        );
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.post("http://localhost:4000/zerodha/generate-token", {
          request_token: requestToken,
        });

        if (ignore) {
          return;
        }

        if (isZerodhaApiError(response.data)) {
          setErrorMsg(response.data.message);
          return;
        }

        if (!isTokenResponse(response.data)) {
          setErrorMsg("Received an invalid token response from the API.");
          return;
        }

        setAccessToken(response.data.access_token);
      } catch (error: unknown) {
        if (ignore) {
          return;
        }

        const zerodhaError = extractZerodhaApiError(error);
        setErrorMsg(
          zerodhaError?.message ?? "Failed to generate a Zerodha access token."
        );
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    resolveAccessToken();

    return () => {
      ignore = true;
    };
  }, [accessTokenFromParams, requestToken]);

  const handleCopy = async () => {
    if (!accessToken) {
      return;
    }

    await navigator.clipboard.writeText(accessToken);
    setCopied(true);
  };

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-slate-900 transition-colors duration-200 dark:bg-[#050511] dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-[2rem] border border-slate-200 bg-white/85 p-8 shadow-sm backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/50">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-orange-500">
            Zerodha Redirect
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
            Refresh your `ZERODHA_ACCESS_TOKEN`
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-zinc-400">
            Copy the token below, paste it into `ZERODHA_ACCESS_TOKEN` in
            `apps/api/.env`, then restart the API service.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
            <div className="h-5 w-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            Generating a fresh Zerodha access token...
          </div>
        ) : errorMsg ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {errorMsg}
          </div>
        ) : accessToken ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 dark:border-zinc-800">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                Access Token
              </p>
              <code className="block break-all text-sm text-emerald-300">
                {accessToken}
              </code>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                {copied ? "Copied" : "Copy access token"}
              </button>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Paste it into `ZERODHA_ACCESS_TOKEN` and restart `apps/api`.
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

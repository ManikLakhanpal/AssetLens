"use client";

import { useEffect, useState } from "react";
import { api, routes } from "../lib/api";

type ZerodhaLoginPromptProps = {
  message: string;
};

export default function ZerodhaLoginPrompt({ message }: ZerodhaLoginPromptProps) {
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const { data } = await api.get<{ login_url: string | null }>(routes.zerodha.loginUrl);
        setLoginUrl(data.login_url);
      } catch {
        setLoginUrl(null);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50/90 p-5 text-sm text-slate-700 shadow-sm dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-50">
      <p className="font-medium text-slate-900 dark:text-white">
        Zerodha session needs to be refreshed.
      </p>
      <p className="mt-2 text-slate-600 dark:text-orange-100/80">{message}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {fetching ? (
          <div className="h-4 w-4 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
        ) : loginUrl ? (
          <a
            href={loginUrl}
            className="inline-flex items-center rounded-xl bg-orange-500 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-600"
          >
            Log in to Kite
          </a>
        ) : (
          <span className="text-xs text-slate-500 dark:text-orange-100/70">
            Zerodha API key is not yet configured. Add it in Settings first.
          </span>
        )}
        {loginUrl && (
          <span className="text-xs text-slate-500 dark:text-orange-100/70">
            After logging in you will be redirected back automatically.
          </span>
        )}
      </div>
    </div>
  );
}

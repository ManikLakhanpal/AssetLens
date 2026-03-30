"use client";

import React, { useEffect, useState } from "react";
import ZerodhaLoginPrompt from "./ZerodhaLoginPrompt";
import { api, routes } from "../lib/api";
import {
  extractZerodhaApiError,
  isZerodhaApiError,
  isZerodhaProfileResponse,
  type ZerodhaProfileResponse,
} from "../lib/zerodha";

export default function ZerodhaProfile() {
  const [profile, setProfile] = useState<ZerodhaProfileResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(routes.zerodha.profile);

        if (isZerodhaApiError(response.data)) {
          setErrorMsg(response.data.message);
          setLoginUrl(response.data.login_url ?? null);
          setAuthRequired(response.data.code === "AUTH_REQUIRED");
          return;
        }

        if (!isZerodhaProfileResponse(response.data)) {
          setErrorMsg("Received an invalid Zerodha profile response.");
          setAuthRequired(false);
          return;
        }

        setProfile(response.data);
        setAuthRequired(false);
      } catch (error: unknown) {
        const zerodhaError = extractZerodhaApiError(error);

        if (zerodhaError) {
          setErrorMsg(zerodhaError.message);
          setLoginUrl(zerodhaError.login_url ?? null);
          setAuthRequired(zerodhaError.code === "AUTH_REQUIRED");
          return;
        }

        setErrorMsg("Failed to fetch Zerodha profile");
        setAuthRequired(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/50 backdrop-blur-xl shadow-sm dark:shadow-none transition-all hover:bg-white dark:hover:bg-zinc-900/60 hover:border-slate-300 dark:hover:border-zinc-700/50">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-slate-800 dark:text-white flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center">
            <span className="text-orange-500 dark:text-orange-400 text-xs font-bold leading-none">Z</span>
          </div>
          Zerodha Profile
        </h2>
        <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
          {loading ? "Loading..." : profile?.broker ?? "—"}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : errorMsg ? (
        loginUrl || authRequired ? (
          <ZerodhaLoginPrompt
            message={errorMsg}
            loginUrl={loginUrl ?? undefined}
          />
        ) : (
          <div className="text-red-500 dark:text-red-400 text-sm">{errorMsg}</div>
        )
      ) : profile ? (
        <div className="flex flex-col gap-4">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 dark:text-orange-300 font-bold text-lg">
              {profile.user_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-slate-800 dark:text-white font-medium">{profile.user_name}</p>
              <p className="text-slate-500 dark:text-zinc-400 text-sm">{profile.email}</p>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-zinc-800/60 pt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <p className="text-slate-400 dark:text-zinc-500 text-xs uppercase tracking-wider mb-1">User ID</p>
              <p className="text-slate-700 dark:text-zinc-200 font-mono">{profile.user_id}</p>
            </div>
            <div>
              <p className="text-slate-400 dark:text-zinc-500 text-xs uppercase tracking-wider mb-1">User Type</p>
              <p className="text-slate-700 dark:text-zinc-200 capitalize">{profile.user_type}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400 dark:text-zinc-500 text-xs uppercase tracking-wider mb-2">Exchanges</p>
              <div className="flex flex-wrap gap-2">
                {profile.exchanges?.map((ex) => (
                  <span key={ex} className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-300 border border-orange-500/20">
                    {ex}
                  </span>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400 dark:text-zinc-500 text-xs uppercase tracking-wider mb-2">Products</p>
              <div className="flex flex-wrap gap-2">
                {profile.products?.map((p) => (
                  <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700/50">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

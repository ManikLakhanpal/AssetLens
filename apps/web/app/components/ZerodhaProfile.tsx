"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface ZerodhaProfile {
  user_id: string;
  user_name: string;
  email: string;
  user_type: string;
  broker: string;
  exchanges: string[];
  products: string[];
  order_types: string[];
}

export default function ZerodhaProfile() {
  const [profile, setProfile] = useState<ZerodhaProfile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:4000/zerodha/profile");
        setProfile(response.data);
      } catch (err: any) {
        setErrorMsg(err?.response?.data?.error || "Failed to fetch Zerodha profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl transition-all hover:bg-zinc-900/60 hover:border-zinc-700/50">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-white flex items-center gap-2">
          {/* Zerodha "Z" icon */}
          <div className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center">
            <span className="text-orange-400 text-xs font-bold leading-none">Z</span>
          </div>
          Zerodha Profile
        </h2>
        <span className="text-zinc-500 text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
          {loading ? "Loading..." : profile?.broker ?? "—"}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : errorMsg ? (
        <div className="text-red-400 text-sm">{errorMsg}</div>
      ) : profile ? (
        <div className="flex flex-col gap-4">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/10 border border-orange-500/20 flex items-center justify-center text-orange-300 font-bold text-lg">
              {profile.user_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-medium">{profile.user_name}</p>
              <p className="text-zinc-400 text-sm">{profile.email}</p>
            </div>
          </div>

          <div className="border-t border-zinc-800/60 pt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">User ID</p>
              <p className="text-zinc-200 font-mono">{profile.user_id}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">User Type</p>
              <p className="text-zinc-200 capitalize">{profile.user_type}</p>
            </div>
            <div className="col-span-2">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Exchanges</p>
              <div className="flex flex-wrap gap-2">
                {profile.exchanges?.map((ex) => (
                  <span key={ex} className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/20">
                    {ex}
                  </span>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Products</p>
              <div className="flex flex-wrap gap-2">
                {profile.products?.map((p) => (
                  <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50">
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

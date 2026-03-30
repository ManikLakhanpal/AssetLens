"use client";

type ZerodhaLoginPromptProps = {
  message: string;
  loginUrl?: string;
};

export default function ZerodhaLoginPrompt({
  message,
  loginUrl,
}: ZerodhaLoginPromptProps) {
  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50/90 p-5 text-sm text-slate-700 shadow-sm dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-50">
      <p className="font-medium text-slate-900 dark:text-white">
        Zerodha session needs to be refreshed.
      </p>
      <p className="mt-2 text-slate-600 dark:text-orange-100/80">{message}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {loginUrl ? (
          <a
            href={loginUrl}
            className="inline-flex items-center rounded-xl bg-orange-500 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-600"
          >
            Log in to Kite
          </a>
        ) : (
          <span className="text-xs text-slate-500 dark:text-orange-100/70">
            Zerodha login URL is not configured on the API server.
          </span>
        )}
        <span className="text-xs text-slate-500 dark:text-orange-100/70">
          After login, copy the token on `/trade/redirect`, paste it into
          ` ZERODHA_ACCESS_TOKEN`, and restart the API service.
        </span>
      </div>
    </div>
  );
}

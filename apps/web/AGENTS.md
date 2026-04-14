<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AssetLens web (`apps/web`)

- Dashboard routes expect a JWT in `localStorage` (`assetlens_token`); see [`app/components/AuthGuard.tsx`](app/components/AuthGuard.tsx) and [`app/lib/api.ts`](app/lib/api.ts) for interceptors.
- Broker credentials are configured in [`app/settings/page.tsx`](app/settings/page.tsx), not in Next.js env for secrets.
- Zerodha OAuth return URL: [`app/trade/redirect/page.tsx`](app/trade/redirect/page.tsx).

For setup and scripts, see [`README.md`](README.md).

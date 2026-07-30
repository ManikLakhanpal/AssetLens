import { marked } from "marked";

export function renderPortfolioEmailHtml(args: {
  summaryMarkdown: string;
  username: string;
  generatedAt: Date;
  settingsUrl?: string;
}): string {
  const bodyHtml = marked.parse(args.summaryMarkdown, { async: false }) as string;
  const timestamp = args.generatedAt.toUTCString();
  const settingsUrl = args.settingsUrl ?? "http://localhost:3000/settings";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 640px; margin: 0 auto; padding: 24px 16px; }
    .card { background: #ffffff; border-radius: 12px; padding: 28px; border: 1px solid #e2e8f0; }
    h1 { font-size: 22px; margin: 0 0 8px; color: #0f172a; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
    .content h2 { font-size: 18px; margin-top: 24px; color: #0f172a; }
    .content h3 { font-size: 15px; margin-top: 18px; color: #334155; }
    .content table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 14px; }
    .content th, .content td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
    .content th { background: #f1f5f9; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
    a { color: #0d9488; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>Portfolio update for ${escapeHtml(args.username)}</h1>
      <p class="meta">Generated ${escapeHtml(timestamp)} (UTC)</p>
      <div class="content">${bodyHtml}</div>
      <div class="footer">
        <p>You receive this email because portfolio notifications are enabled in AssetLens.</p>
        <p><a href="${escapeHtml(settingsUrl)}">Manage notification settings</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

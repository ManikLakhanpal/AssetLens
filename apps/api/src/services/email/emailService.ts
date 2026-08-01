import { Resend } from "resend";
import { renderPortfolioEmailHtml } from "./emailTemplates.js";

let resendClient: Resend | null = null;

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY env var is not set");
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function getFromAddress(): string {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("EMAIL_FROM env var is not set");
  }
  return from;
}

export async function sendPortfolioEmail(args: {
  to: string;
  subject: string;
  summaryMarkdown: string;
  username: string;
  generatedAt?: Date;
  settingsUrl?: string;
}): Promise<void> {
  const html = renderPortfolioEmailHtml({
    summaryMarkdown: args.summaryMarkdown,
    username: args.username,
    generatedAt: args.generatedAt ?? new Date(),
    settingsUrl: args.settingsUrl,
  });

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: args.to,
    subject: args.subject,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
}

import kiteClient from "./zerodha/kite";

export type ZerodhaServiceError = {
  success: false;
  code: "AUTH_REQUIRED" | "ZERODHA_ERROR";
  message: string;
  login_url?: string;
};

function getZerodhaLoginUrl() {
  const apiKey = process.env.ZERODHA_API_KEY;

  if (!apiKey) {
    return null;
  }

  return `https://kite.zerodha.com/connect/login?v=3&api_key=${process.env.ZERODHA_API_KEY}`;
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "";
}

function isAuthError(message: string) {
  const m = message.toLowerCase();

  if (
    m.includes("incorrect") &&
    (m.includes("api_key") || m.includes("access_token"))
  ) {
    return true;
  }

  return [
    "token is invalid",
    "token has expired",
    "access token",
    "access_token",
    "invalid `api_key`",
    "invalid api key",
    "tokenexception",
    "permission denied",
    "unauthorized",
    "session",
    "login",
  ].some((fragment) => m.includes(fragment));
}

function buildZerodhaServiceError(
  error: unknown,
  fallbackMessage: string
): ZerodhaServiceError {
  const raw = normalizeErrorMessage(error);
  const message = raw || fallbackMessage;
  const code = isAuthError(message) ? "AUTH_REQUIRED" : "ZERODHA_ERROR";

  return {
    success: false,
    code,
    message,
    login_url: code === "AUTH_REQUIRED" ? getZerodhaLoginUrl() ?? undefined : undefined,
  };
}

// * Generate access token from request token
export async function generateAccessToken(requestToken: string) {
  try {
    const apiSecret = process.env.ZERODHA_API_SECRET as string;
    const session = await kiteClient.generateSession(requestToken, apiSecret);
    // Update the in-memory client so subsequent calls use the new token
    kiteClient.setAccessToken(session.access_token);
    return {
      access_token: session.access_token,
      user_id: session.user_id,
      login_time: session.login_time,
    };
  } catch (error) {
    const serviceError = buildZerodhaServiceError(
      error,
      "Failed to generate Zerodha access token"
    );
    console.error("generateAccessToken error:", serviceError.message);

    return serviceError;
  }
}

// * Zerodha User Profile
export async function getZerodhaProfile() {
  try {
    const profile = await kiteClient.getProfile();
    return profile;
  } catch (error) {
    const serviceError = buildZerodhaServiceError(
      error,
      "Failed to fetch Zerodha profile"
    );
    console.error("getZerodhaProfile error:", serviceError.message);

    return serviceError;
  }
}

// * Zerodha Stock Holdings
export async function getZerodhaHoldings() {
  try {
    const holdings = await kiteClient.getHoldings();
    return holdings;
  } catch (error) {
    const serviceError = buildZerodhaServiceError(
      error,
      "Failed to fetch Zerodha holdings"
    );
    console.error("getZerodhaHoldings error:", serviceError.message);

    return serviceError;
  }
}


export async function getZerodhaMFHoldings() {
  try {
    const holdings = await kiteClient.getMFHoldings();
    return holdings;
  } catch (error) {
    const serviceError = buildZerodhaServiceError(
      error,
      "Failed to fetch Zerodha holdings"
    );
    console.error("getZerodhaHoldings error:", serviceError.message);

    return serviceError;
  }
}
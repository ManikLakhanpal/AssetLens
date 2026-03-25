import kiteClient from "./zerodha/kite";

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
    const err = error as { message?: string };
    console.error("generateAccessToken error:", err.message);
    throw new Error(err.message || "Failed to generate access token");
  }
}

// * Zerodha User Profile
export async function getZerodhaProfile() {
  try {
    const profile = await kiteClient.getProfile();
    return profile;
  } catch (error) {
    const err = error as { message?: string };
    console.error("getZerodhaProfile error:", err.message);
    throw new Error(err.message || "Failed to fetch Zerodha profile");
  }
}

// * Zerodha Stock Holdings
export async function getZerodhaHoldings() {
  try {
    const holdings = await kiteClient.getHoldings();
    return holdings;
  } catch (error) {
    const err = error as { message?: string };
    console.error("getZerodhaHoldings error:", err.message);
    throw new Error(err.message || "Failed to fetch Zerodha holdings");
  }
}


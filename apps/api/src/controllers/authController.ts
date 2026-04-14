import type { Request, Response } from "express";
import { login, register, getMe, saveCredentials } from "../services/auth/authService.js";
import type { LoginInput, SignupInput, AuthResponse, SaveCredentialsInput } from "../dto/auth.dto.js";

export async function registerHandler(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as Partial<SignupInput>;

  if (!username || !password) {
    res.status(400).json({ error: "username and password are required" });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "password must be at least 8 characters" });
    return;
  }

  try {
    const token = await register(username, password);
    const response: AuthResponse = { token };
    res.status(201).json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    res.status(409).json({ error: message });
  }
}

export async function meHandler(req: Request, res: Response): Promise<void> {
  try {
    const me = await getMe(req.userId);
    res.json(me);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch profile";
    res.status(404).json({ error: message });
  }
}

export async function saveCredentialsHandler(req: Request, res: Response): Promise<void> {
  const input = req.body as Partial<SaveCredentialsInput>;

  const hasBinance =
    input.binance &&
    typeof input.binance.apiKey === "string" &&
    typeof input.binance.apiSecret === "string" &&
    input.binance.apiKey.trim() !== "" &&
    input.binance.apiSecret.trim() !== "";

  const hasZerodha =
    input.zerodha &&
    typeof input.zerodha.apiKey === "string" &&
    typeof input.zerodha.apiSecret === "string" &&
    input.zerodha.apiKey.trim() !== "" &&
    input.zerodha.apiSecret.trim() !== "";

  if (!hasBinance && !hasZerodha) {
    res.status(400).json({ error: "Provide at least one set of credentials (binance or zerodha)" });
    return;
  }

  try {
    await saveCredentials(req.userId, {
      binance: hasBinance ? input.binance : undefined,
      zerodha: hasZerodha ? input.zerodha : undefined,
    });
    res.json({ message: "Credentials saved" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save credentials";
    res.status(500).json({ error: message });
  }
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as Partial<LoginInput>;

  if (!username || !password) {
    res.status(400).json({ error: "username and password are required" });
    return;
  }

  try {
    const token = await login(username, password);
    const response: AuthResponse = { token };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    res.status(401).json({ error: message });
  }
}

export type LoginInput = {
  username: string;
  password: string;
};

export type SignupInput = {
  username: string;
  password: string;
};

export type AuthResponse = {
  token: string;
};

export type MeResponse = {
  id: string;
  username: string;
  email: string | null;
  createdAt: string;
  hasBinance: boolean;
  hasZerodha: boolean;
  notificationsEnabled: boolean;
};

export type SaveCredentialsInput = {
  binance?: { apiKey: string; apiSecret: string };
  zerodha?: { apiKey: string; apiSecret: string };
};

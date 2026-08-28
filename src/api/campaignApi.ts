export const API_BASE_URL = "http://localhost:4000";

export const TOKEN_KEY = "auth_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export interface Campaign {
  id?: string;
  _id?: string;
  email?: string;
  recipient?: string;
  to?: string;
  subject?: string;
  body?: string;
  sendAt?: string;
  scheduledAt?: string;
  sentAt?: string;
  status?: string;
  [key: string]: unknown;
}

export interface LaunchCampaignPayload {
  subject: string;
  body: string;
  emails: string[];
  sendAt: string;
  delayMs: number;
  hourlyLimit: number;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function normalizeList(data: unknown): Campaign[] {
  if (Array.isArray(data)) return data as Campaign[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["data", "campaigns", "jobs", "results", "items"]) {
      if (Array.isArray(obj[key])) return obj[key] as Campaign[];
    }
  }
  return [];
}

export const campaignApi = {
  googleLoginUrl: `${API_BASE_URL}/auth/google`,

  async getUpcoming(): Promise<Campaign[]> {
    return normalizeList(await request<unknown>("/api/v1/campaigns/upcoming"));
  },

  async getCompleted(): Promise<Campaign[]> {
    return normalizeList(await request<unknown>("/api/v1/campaigns/completed"));
  },

  async launch(payload: LaunchCampaignPayload): Promise<unknown> {
    return request<unknown>("/api/v1/campaigns/launch", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export function recipientOf(c: Campaign): string {
  return (c.email as string) || (c.recipient as string) || (c.to as string) || "—";
}

export function scheduledTimeOf(c: Campaign): string | undefined {
  return (c.sendAt as string) || (c.scheduledAt as string);
}

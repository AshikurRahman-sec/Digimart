export type Role = "user" | "admin";

export type User = {
  id: string;
  email: string;
  roles: Role[];
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
};

type RegisterBody = {
  email: string;
  password: string;
  role: Exclude<Role, "admin">;
};

type LoginBody = {
  email: string;
  password: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001/api/v1";

class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { detail?: string; code?: string }
      | null;
    throw new ApiError(
      body?.detail ?? "Request failed",
      body?.code ?? "REQUEST_FAILED",
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  auth: {
    register(body: RegisterBody) {
      return request<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    login(body: LoginBody) {
      return request<TokenPair>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    me(accessToken: string) {
      return request<User>("/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    logout(accessToken: string, refreshToken?: string) {
      return request<void>("/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    },
  },
};

export { ApiError };

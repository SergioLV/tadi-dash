const CREDENTIALS = {
  email: "admin@eligeunplan.cl",
  password: "gustagay123",
};

const AUTH_KEY = "eup_admin_auth";

export function login(email: string, password: string): boolean {
  if (email === CREDENTIALS.email && password === CREDENTIALS.password) {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ email, ts: Date.now() }));
    }
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const data = localStorage.getItem(AUTH_KEY);
  if (!data) return false;
  try {
    const parsed = JSON.parse(data);
    // Session expires after 24 hours
    return Date.now() - parsed.ts < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

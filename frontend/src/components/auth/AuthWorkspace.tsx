"use client";

import { FormEvent, useEffect, useState } from "react";
import { LogIn, ShoppingBag, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

type Mode = "login" | "register";

export function AuthWorkspace() {
  const router = useRouter();
  const { isReady, login, register, user } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("buyer@example.com");
  const [password, setPassword] = useState("very-secret-password");
  const [role, setRole] = useState<"buyer" | "creator">("buyer");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      const isCreator = user.roles?.includes("creator");
      router.replace(isCreator ? "/dashboard" : "/library");
    }
  }, [isReady, router, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, role);
      }
      setMessage("Opening your library.");
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <ShoppingBag size={18} aria-hidden="true" />
          </span>
          DigiMart
        </div>
      </header>

      <div className="auth-workspace">
        <section className="panel auth-panel">
          <div className="tabs" role="tablist" aria-label="Auth mode">
            <button
              className={`tab ${mode === "login" ? "tab-active" : ""}`}
              onClick={() => setMode("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={`tab ${mode === "register" ? "tab-active" : ""}`}
              onClick={() => setMode("register")}
              type="button"
            >
              Register
            </button>
          </div>

          <h1 className="section-title">{mode === "login" ? "Welcome back" : "Create account"}</h1>
          <p className="section-copy">
            {mode === "login"
              ? "Access your DigiMart buyer or creator account."
              : "Start as a buyer or creator."}
          </p>

          <form className="form" onSubmit={submit}>
            <Input
              autoComplete="email"
              label="Email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
            <Input
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              label="Password"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />

            {mode === "register" ? (
              <label className="field" htmlFor="role">
                <span className="label">Role</span>
                <select
                  className="select"
                  id="role"
                  onChange={(event) => setRole(event.target.value as "buyer" | "creator")}
                  value={role}
                >
                  <option value="buyer">Buyer</option>
                  <option value="creator">Creator</option>
                </select>
              </label>
            ) : null}

            {error ? <div className="message message-error">{error}</div> : null}
            {message ? <div className="message message-success">{message}</div> : null}

            <Button disabled={isSubmitting} type="submit">
              {mode === "login" ? (
                <LogIn size={18} aria-hidden="true" />
              ) : (
                <UserPlus size={18} aria-hidden="true" />
              )}
              {isSubmitting ? "Working..." : mode === "login" ? "Login" : "Register"}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}

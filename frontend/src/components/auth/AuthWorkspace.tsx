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
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("very-secret-password");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "register") {
      setMode("register");
    }
  }, []);

  useEffect(() => {
    if (isReady && user) {
      const isAdmin = user.roles?.includes("admin");
      router.replace(isAdmin ? "/admin" : "/dashboard");
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
        await register(email, password);
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
    <main className="page-shell auth-page">
      <div className="auth-workspace">
        <section className="panel auth-panel">
          <div className="auth-brand">
            <span className="brand-mark">
              <ShoppingBag size={18} aria-hidden="true" />
            </span>
            <span>DigiMart</span>
          </div>

          <h1 className="section-title">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="section-copy auth-mode-copy">
            {mode === "login"
              ? "Sign in to browse your services, manage subscriptions, and publish new offerings."
              : "Register as a buyer to access the marketplace workspace."}
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
              minLength={mode === "register" ? 10 : 1}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />

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

          <div className="auth-switch">
            <span>{mode === "login" ? "No account yet?" : "Already have an account?"}</span>
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              type="button"
            >
              {mode === "login" ? "Create account" : "Login"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

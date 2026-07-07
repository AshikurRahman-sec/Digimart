"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function CreatorSettingsPage() {
  const router = useRouter();
  const { isReady, user, logout } = useAuth();

  useEffect(() => {
    if (isReady && !user) router.replace("/");
    if (isReady && user && !user.roles?.includes("creator")) router.replace("/library");
  }, [isReady, user, router]);

  if (!isReady || !user) {
    return (
      <main className="page-shell">
        <div className="loading-panel">Loading settings...</div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <header className="app-topbar">
        <div className="brand">DigiMart</div>
        <nav className="app-nav" aria-label="Creator navigation">
          <Link className="nav-link" href="/dashboard">
            Dashboard
          </Link>
          <Link className="nav-link" href="/creator/products">
            Products
          </Link>
          <Link className="nav-link nav-link-active" href="/creator/settings">
            Settings
          </Link>
        </nav>
      </header>

      <section className="panel" style={{ maxWidth: 640, margin: "0 auto", padding: 18 }}>
        <div className="section-heading">
          <h2>Account settings</h2>
        </div>

        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <p>
          <strong>Roles:</strong> {user.roles?.join(", ")}
        </p>

        <div style={{ marginTop: 12 }}>
          <button className="button" onClick={() => logout()}>
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}

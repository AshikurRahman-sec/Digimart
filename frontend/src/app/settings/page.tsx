"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const router = useRouter();
  const { isReady, user } = useAuth();

  useEffect(() => {
    if (isReady && !user) router.replace("/");
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
      </header>

      <section className="panel">
        <h1>Account settings</h1>
        <p>Signed in as {user.email}.</p>
        <p>Here you can add profile, billing, and notification settings.</p>
      </section>
    </main>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function CreatorContentPage() {
  const router = useRouter();
  const { isReady, user } = useAuth();

  useEffect(() => {
    if (isReady && !user) router.replace("/");
    if (isReady && user && !user.roles?.includes("creator")) router.replace("/library");
  }, [isReady, user, router]);

  if (!isReady || !user) {
    return (
      <main className="page-shell">
        <div className="loading-panel">Loading uploads...</div>
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
          <Link className="nav-link nav-link-active" href="/creator/content">
            Content
          </Link>
        </nav>
      </header>

      <section className="panel" style={{ maxWidth: 1180, margin: "0 auto", padding: 18 }}>
        <div className="section-heading">
          <h2>Your uploads</h2>
          <Link href="/creator/content/upload">Upload</Link>
        </div>

        <p className="section-copy">You can manage your uploaded files here. This app currently shows placeholder data.</p>

        <div style={{ display: "grid", gap: 12 }}>
          <div className="library-card">
            <div className="cover-tile cover-teal">PDF</div>
            <div className="library-card-body">
              <h3>Sample Upload 1</h3>
              <p className="card-meta">Uploaded: today</p>
            </div>
            <div style={{ alignSelf: "center" }}>
              <Link href="#">Manage</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

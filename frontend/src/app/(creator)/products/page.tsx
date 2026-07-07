"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const sampleProducts = [
  { id: "p1", title: "Intro to Product Demos", price: "$29", status: "Published" },
  { id: "p2", title: "Design Patterns for SaaS", price: "$49", status: "Draft" },
];

export default function CreatorProductsPage() {
  const router = useRouter();
  const { isReady, user } = useAuth();

  useEffect(() => {
    if (isReady && !user) router.replace("/");
    if (isReady && user && !user.roles?.includes("creator")) router.replace("/library");
  }, [isReady, user, router]);

  if (!isReady || !user) {
    return (
      <main className="page-shell">
        <div className="loading-panel">Loading products...</div>
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
          <Link className="nav-link nav-link-active" href="/creator/products">
            Products
          </Link>
          <Link className="nav-link" href="/creator/settings">
            Settings
          </Link>
        </nav>
      </header>

      <section className="panel" style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div className="section-heading">
          <h2>Your products</h2>
          <Link href="/creator/products/new">Create new</Link>
        </div>

        <table className="products-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sampleProducts.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.price}</td>
                <td>{p.status}</td>
                <td>
                  <Link href={`/creator/products/${p.id}/edit`} className="text-link">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

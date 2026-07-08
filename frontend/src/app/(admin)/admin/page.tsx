"use client";

import { useEffect, useState } from "react";
import {
  ShieldAlert,
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  LogOut,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

type AdminUser = {
  id: string;
  email: string;
  roles: string[];
  status: "Active" | "Suspended";
  registeredAt: string;
};

type AdminProduct = {
  id: string;
  title: string;
  creator: string;
  price: string;
  status: "Approved" | "Flagged";
};

const initialUsers: AdminUser[] = [
  { id: "u1", email: "nadia@example.com", roles: ["user"], status: "Active", registeredAt: "2026-07-01" },
  { id: "u2", email: "mason@example.com", roles: ["user"], status: "Active", registeredAt: "2026-07-03" },
  { id: "u3", email: "aria@example.com", roles: ["user"], status: "Active", registeredAt: "2026-07-04" },
  { id: "u4", email: "spammer@example.com", roles: ["user"], status: "Suspended", registeredAt: "2026-07-05" },
];

const initialProducts: AdminProduct[] = [
  { id: "p1", title: "AI Product Design Masterclass", creator: "Nadia Rahman", price: "$49", status: "Approved" },
  { id: "p2", title: "Growth Analytics Playbook", creator: "Mason Lee", price: "$29", status: "Approved" },
  { id: "p3", title: "Secure Billing Notes", creator: "Aria Chen", price: "$39", status: "Approved" },
  { id: "p4", title: "Free Bitcoins Cheat Sheet", creator: "Spammer", price: "$0", status: "Flagged" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isReady, user, logout } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);

  useEffect(() => {
    if (isReady && !user) {
      router.replace("/");
      return;
    }
    if (isReady && user && !user.roles?.includes("admin")) {
      router.replace("/dashboard");
    }
  }, [isReady, user, router]);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  function toggleUserStatus(id: string) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === "Active" ? "Suspended" : "Active";
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  }

  function toggleProductStatus(id: string) {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === "Approved" ? "Flagged" : "Approved";
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  }

  if (!isReady || !user) {
    return (
      <main className="loading-panel">
        <span>Loading admin panel...</span>
      </main>
    );
  }

  return (
    <main className="dashboard-page creator-page">
      {/* Topbar */}
      <header className="dashboard-topbar">
        <div className="brand">
          <span className="brand-mark" style={{ background: "var(--color-rose)" }}>
            <ShieldAlert size={18} aria-hidden="true" style={{ color: "white" }} />
          </span>
          DigiMart Admin
        </div>
        <div className="dashboard-account">
          <span className="user-email">{user.email} (Administrator)</span>
          <button className="ghost-danger-button" type="button" onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" />
            Logout
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="dashboard-hero creator-hero-clean" style={{ borderLeft: "4px solid var(--color-rose)" }}>
        <div>
          <p className="eyebrow" style={{ color: "var(--color-rose)" }}>
            Platform Control Room
          </p>
          <h1>Platform Moderation & Security</h1>
          <p>
            Monitor user registrations, flag offending digital assets, and audit platform revenue distribution logs.
          </p>
          <div className="hero-action-row">
            <button className="button" type="button" onClick={() => router.push("/dashboard")}>
              View User Workspace
            </button>
          </div>
        </div>
        <div className="hero-summary-panel">
          <div>
            <span>Total Accounts</span>
            <strong>{users.length}</strong>
          </div>
          <div>
            <span>Flagged Content</span>
            <strong>{products.filter((p) => p.status === "Flagged").length}</strong>
          </div>
          <div>
            <span>Audit Level</span>
            <strong>High</strong>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="metric-grid">
        <article className="metric-card">
          <Users size={22} aria-hidden="true" style={{ color: "var(--color-blue)" }} />
          <div>
            <strong>{users.filter((u) => u.status === "Active").length} Active</strong>
            <span>Normal Users</span>
          </div>
        </article>
        <article className="metric-card">
          <ShoppingBag size={22} aria-hidden="true" style={{ color: "var(--color-teal)" }} />
          <div>
            <strong>{products.length}</strong>
            <span>Digital Bundles</span>
          </div>
        </article>
        <article className="metric-card">
          <DollarSign size={22} aria-hidden="true" style={{ color: "var(--color-rose)" }} />
          <div>
            <strong>$12,480</strong>
            <span>Gross Platform Sales</span>
          </div>
        </article>
        <article className="metric-card">
          <TrendingUp size={22} aria-hidden="true" style={{ color: "var(--color-teal)" }} />
          <div>
            <strong>10%</strong>
            <span>Take Rate Margin</span>
          </div>
        </article>
      </section>

      {/* Tables Grid */}
      <section className="content-grid creator-workspace">
        {/* User management */}
        <div className="main-column">
          <div className="section-heading-large">
            <div>
              <p className="eyebrow">Accounts</p>
              <h2>User Directory</h2>
            </div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.03)", borderRadius: 12, padding: 18, border: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <table className="products-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>User Email</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.roles.join(", ")}</td>
                    <td>
                      <span className={u.status === "Active" ? "status-live" : "status-draft"}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className={`icon-text-button ${u.status === "Active" ? "danger" : ""}`}
                        style={{ display: "inline-flex", gap: 6, padding: "4px 8px" }}
                        onClick={() => toggleUserStatus(u.id)}
                      >
                        {u.status === "Active" ? (
                          <>
                            <Lock size={14} /> Suspend
                          </>
                        ) : (
                          <>
                            <Unlock size={14} /> Activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product moderation */}
        <aside className="side-column">
          <section className="dashboard-card">
            <div className="section-heading-large">
              <div>
                <p className="eyebrow">Catalog</p>
                <h2>Asset Moderation</h2>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {products.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ margin: 0, fontSize: "0.95rem" }}>{p.title}</h4>
                    <span className={p.status === "Approved" ? "status-live" : "status-draft"}>
                      {p.status}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 8px 0", fontSize: "0.85rem", opacity: 0.7 }}>
                    By {p.creator} · {p.price}
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="icon-text-button"
                      style={{ fontSize: "0.8rem", padding: "4px 8px" }}
                      onClick={() => toggleProductStatus(p.id)}
                    >
                      {p.status === "Approved" ? (
                        <>
                          <AlertTriangle size={12} /> Flag
                        </>
                      ) : (
                        <>
                          <CheckCircle size={12} /> Approve
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

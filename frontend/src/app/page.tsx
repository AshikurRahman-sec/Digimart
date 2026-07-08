"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  Clock,
  CreditCard,
  FileText,
  KeyRound,
  Layers,
  Library,
  LogIn,
  PlayCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  UploadCloud,
  UserPlus,
  Users,
  Video,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const categories = [
  {
    name: "Video courses",
    count: "12 bundles",
    icon: Video,
    description: "Structured lessons with secure streaming",
    accent: "teal",
  },
  {
    name: "Presentations",
    count: "8 bundles",
    icon: Layers,
    description: "Slides, decks, and visual learning kits",
    accent: "blue",
  },
  {
    name: "Notes & playbooks",
    count: "18 bundles",
    icon: FileText,
    description: "PDFs, markdown guides, and templates",
    accent: "rose",
  },
  {
    name: "Creator memberships",
    count: "6 plans",
    icon: Users,
    description: "Recurring access with subscriber updates",
    accent: "amber",
  },
  {
    name: "One-time bundles",
    count: "24 products",
    icon: ShoppingBag,
    description: "Buy once, own access in your library",
    accent: "teal",
  },
  {
    name: "Mixed media kits",
    count: "9 bundles",
    icon: Sparkles,
    description: "Video + slides + notes in one package",
    accent: "blue",
  },
];

const products = [
  {
    title: "AI Product Design Masterclass",
    creator: "Nadia Rahman",
    type: "Video + notes",
    price: "$49",
    seats: "42 buyers active",
    accent: "teal",
    badge: "Popular",
  },
  {
    title: "Growth Analytics Playbook",
    creator: "Mason Lee",
    type: "Slides + notebook",
    price: "$29/mo",
    seats: "Subscription ready",
    accent: "blue",
    badge: "Membership",
  },
  {
    title: "Secure Billing Notes",
    creator: "Aria Chen",
    type: "PDF + templates",
    price: "$39",
    seats: "Protected access",
    accent: "rose",
    badge: "New",
  },
];

const services = [
  {
    title: "Digital catalog",
    description: "Creator profiles, product pages, and flexible pricing for every bundle.",
    icon: ShoppingBag,
    tag: "For creators",
  },
  {
    title: "Content uploads",
    description: "Upload videos, presentations, notes, and notebooks in one workflow.",
    icon: UploadCloud,
    tag: "For creators",
  },
  {
    title: "Stripe checkout",
    description: "One-time purchases and subscription billing with secure payment flows.",
    icon: CreditCard,
    tag: "Payments",
  },
  {
    title: "Buyer library",
    description: "Every purchase and subscription lives in a clean, searchable library.",
    icon: Library,
    tag: "For buyers",
  },
  {
    title: "Protected playback",
    description: "Short-lived delivery tokens — raw storage URLs never reach buyers.",
    icon: PlayCircle,
    tag: "Security",
  },
  {
    title: "Entitlement checks",
    description: "Server-side access decisions before any content opens.",
    icon: KeyRound,
    tag: "Security",
  },
  {
    title: "Subscription plans",
    description: "Monthly or yearly memberships with automatic access management.",
    icon: Wallet,
    tag: "Payments",
  },
  {
    title: "Creator dashboard",
    description: "Publish products, track buyers, and manage your storefront.",
    icon: Building2,
    tag: "For creators",
  },
];

const demos = [
  {
    title: "Build your first paid digital bundle",
    track: "Creator onboarding",
    date: "This week, 8:00 PM",
  },
  {
    title: "Turn notes and slides into a subscription",
    track: "Membership setup",
    date: "Thursday, 9:00 PM",
  },
  {
    title: "Protect video lessons with buyer access",
    track: "Secure delivery",
    date: "Friday, 8:00 PM",
  },
  {
    title: "Design a creator storefront buyers trust",
    track: "Storefront design",
    date: "Saturday, 7:00 PM",
  },
];

const demoFilters = ["All", "For creators", "For buyers", "Security"];

export default function Home() {
  const router = useRouter();
  const { isReady, user } = useAuth();
  const [demoFilter, setDemoFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isReady && user) {
      const isAdmin = user.roles?.includes("admin");
      router.replace(isAdmin ? "/admin" : "/dashboard");
    }
  }, [isReady, router, user]);

  const filteredDemos =
    demoFilter === "All"
      ? demos
      : demos.filter((demo) => {
          if (demoFilter === "For creators") return demo.track.includes("Creator") || demo.track.includes("Membership") || demo.track.includes("Storefront");
          if (demoFilter === "For buyers") return false;
          if (demoFilter === "Security") return demo.track.includes("Secure");
          return true;
        });

  if (isReady && user) {
    return (
      <main className="marketing-shell">
        <div className="loading-panel">Taking you to your workspace…</div>
      </main>
    );
  }

  return (
    <main className="marketing-shell">
      <header className="marketing-header">
        <div className="marketing-header-inner">
          <Link className="marketing-brand" href="/">
            <span className="marketing-brand-mark">
              <ShoppingBag size={18} />
            </span>
            DigiMart
          </Link>

          <nav className="marketing-nav" aria-label="Primary navigation">
            <a href="#categories">Categories</a>
            <a href="#products">Products</a>
            <a href="#services">Services</a>
            <a href="#demos">Free demos</a>
            <a href="#creators">For creators</a>
          </nav>

          <div className="marketing-auth-actions" aria-label="Account actions">
            <Link className="marketing-login-link" href="/login">
              <LogIn size={16} />
              Login
            </Link>
            <Link className="marketing-nav-cta" href="/login?mode=register">
              <UserPlus size={16} />
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <div className="marketing-content">
        <section className="marketing-hero">
          <div className="marketing-hero-copy">
            <Link className="marketing-announcement" href="/login?mode=register">
              New creator tools are ready
              <ArrowRight size={15} />
            </Link>
            <p className="marketing-eyebrow">Learn. Subscribe. Grow.</p>
            <h1>Premium digital bundles from trusted creators.</h1>
            <p>
              Discover video courses, presentations, notes, notebooks, and memberships in one
              buyer-friendly marketplace. Creators publish once and sell secure access with
              one-time or subscription pricing.
            </p>

            <form
              className="marketing-search"
              onSubmit={(event) => {
                event.preventDefault();
                router.push("/login");
              }}
            >
              <Search size={18} />
              <input
                aria-label="Search digital products"
                placeholder="Search courses, notes, memberships…"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </form>

            <div className="marketing-actions">
              <Link className="marketing-primary-action" href="/login">
                <Search size={18} />
                Start exploring
              </Link>
              <Link className="marketing-secondary-action" href="/login?mode=register">
                <UserPlus size={18} />
                Create account
              </Link>
            </div>

            <div className="marketing-trust-row" aria-label="Marketplace trust indicators">
              <span>
                <BadgeCheck size={16} />
                Verified creators
              </span>
              <span>
                <ShieldCheck size={16} />
                Entitlement checked
              </span>
              <span>
                <Clock size={16} />
                Instant library access
              </span>
            </div>
          </div>

          <aside className="marketing-hero-visual" aria-label="Featured product preview">
            <div className="marketing-visual-photo" />
            <div className="marketing-preview-card">
              <div className="marketing-preview-status">
                <span>Live bundle</span>
                <strong>$49</strong>
              </div>
              <h2>AI Product Design Masterclass</h2>
              <p>12 videos, 4 slide decks, notes, and subscriber updates.</p>
              <div className="marketing-preview-progress">
                <span style={{ width: "74%" }} />
              </div>
              <div className="marketing-preview-footer">
                <span>74% completed</span>
                <PlayCircle size={22} />
              </div>
            </div>
          </aside>
        </section>

        <section className="marketing-stats-row" aria-label="Platform highlights">
          <div>
            <strong>1,200+</strong>
            <span>Digital bundles</span>
          </div>
          <div>
            <strong>180+</strong>
            <span>Active creators</span>
          </div>
          <div>
            <strong>8</strong>
            <span>Platform services</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>Secure delivery</span>
          </div>
        </section>

        <section className="marketing-logo-strip" aria-label="Supported content formats">
          <span>Trusted formats for digital creators</span>
          <strong>Video</strong>
          <strong>Slides</strong>
          <strong>Notes</strong>
          <strong>Notebooks</strong>
          <strong>Memberships</strong>
        </section>

        <section className="marketing-category-panel" id="categories" aria-label="Browse categories">
          <div className="marketing-section-heading">
            <div>
              <span>Browse by format</span>
              <h2>Find the right digital product faster</h2>
            </div>
            <Link href="/login">
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="marketing-category-grid">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  className={`marketing-category-card accent-${category.accent}`}
                  href="/login"
                  key={category.name}
                >
                  <div className="marketing-category-icon">
                    <Icon size={22} />
                  </div>
                  <div className="marketing-category-body">
                    <strong>{category.name}</strong>
                    <p>{category.description}</p>
                    <span>{category.count}</span>
                  </div>
                  <ArrowRight className="marketing-category-arrow" size={18} />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="marketing-catalog-panel" id="products">
          <div className="marketing-section-heading">
            <div>
              <span>Popular now</span>
              <h2>Upcoming and ready-to-buy bundles</h2>
            </div>
            <Link href="/login">
              See marketplace
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="marketing-product-grid">
            {products.map((product) => (
              <article className="marketing-product-card" key={product.title}>
                <div className={`marketing-product-cover accent-${product.accent}`}>
                  <span className="marketing-product-badge">{product.badge}</span>
                  <BookOpen size={28} />
                </div>
                <div className="marketing-product-meta">
                  <span>{product.type}</span>
                  <strong>{product.price}</strong>
                </div>
                <h3>{product.title}</h3>
                <p>By {product.creator}</p>
                <div className="marketing-product-footer">
                  <small>{product.seats}</small>
                  <Link href="/login">
                    Details
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="marketing-services-panel" id="services">
          <div className="marketing-section-heading">
            <div>
              <span>Everything included</span>
              <h2>All DigiMart services in one platform</h2>
            </div>
            <Link href="/login?mode=register">
              Get started
              <ArrowRight size={16} />
            </Link>
          </div>

          <p className="marketing-services-intro">
            From publishing and payments to secure delivery and buyer libraries — every workflow
            is built in. No scattered tools, no guessing who has access.
          </p>

          <div className="marketing-services-grid">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article className="marketing-service-card" key={service.title}>
                  <div className="marketing-service-top">
                    <span className="marketing-service-icon">
                      <Icon size={20} />
                    </span>
                    <span className="marketing-service-tag">{service.tag}</span>
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="marketing-demo-panel" id="demos">
          <div className="marketing-section-heading">
            <div>
              <span>Free live demos</span>
              <h2>Preview the marketplace workflow</h2>
            </div>
          </div>

          <div className="marketing-demo-filters" role="tablist" aria-label="Demo filters">
            {demoFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={demoFilter === filter}
                className={demoFilter === filter ? "active" : ""}
                onClick={() => setDemoFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="marketing-demo-grid">
            {filteredDemos.map((demo, index) => (
              <article key={demo.title}>
                <div>
                  <span>Live</span>
                  <strong>Demo {index + 1}</strong>
                </div>
                <small>{demo.track}</small>
                <h3>{demo.title}</h3>
                <p>
                  <CalendarDays size={16} />
                  {demo.date}
                </p>
                <Link href="/login?mode=register">
                  Reserve seat
                  <ArrowRight size={15} />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="marketing-business-band" id="creators">
          <div>
            <span>
              <Building2 size={18} />
              DigiMart for creators
            </span>
            <h2>Publish a professional storefront for paid digital access.</h2>
            <p>
              Bundle videos, presentations, notes, and notebooks. Choose one-time purchases,
              subscription plans, or both while DigiMart keeps buyer access decisions server-side.
            </p>
          </div>
          <Link href="/login?mode=register">
            Start creator setup
            <ArrowRight size={16} />
          </Link>
        </section>

        <section className="marketing-feature-grid" aria-label="Why DigiMart">
          <article>
            <ShoppingBag size={18} />
            <strong>Digital-first catalog</strong>
            <p>Products are access bundles for videos, files, notes, and subscription updates.</p>
          </article>

          <article>
            <BookOpen size={18} />
            <strong>Buyer library</strong>
            <p>Buyers return to a clean library for purchased and subscribed content.</p>
          </article>

          <article>
            <UploadCloud size={18} />
            <strong>Protected delivery</strong>
            <p>Playback and document access are checked by the backend before content opens.</p>
          </article>

          <article>
            <Star size={18} />
            <strong>Creator profiles</strong>
            <p>Creators get product pages, pricing models, and content links in one workspace.</p>
          </article>
        </section>
      </div>

      <footer className="marketing-footer">
        <div className="marketing-footer-inner">
          <div className="marketing-footer-brand">
            <Link className="marketing-brand" href="/">
              <span className="marketing-brand-mark">
                <ShoppingBag size={18} />
              </span>
              DigiMart
            </Link>
            <p>Digital marketplace for creators and buyers. Secure access, simple pricing.</p>
          </div>

          <div className="marketing-footer-links">
            <div>
              <strong>Explore</strong>
              <a href="#categories">Categories</a>
              <a href="#products">Products</a>
              <a href="#services">Services</a>
              <a href="#demos">Free demos</a>
            </div>
            <div>
              <strong>Account</strong>
              <Link href="/login">Login</Link>
              <Link href="/login?mode=register">Sign up</Link>
              <Link href="/login?mode=register">Become a creator</Link>
            </div>
            <div>
              <strong>Platform</strong>
              <a href="#services">Secure playback</a>
              <a href="#services">Subscriptions</a>
              <a href="#services">Entitlements</a>
            </div>
          </div>
        </div>

        <div className="marketing-footer-bottom">
          <span>© {new Date().getFullYear()} DigiMart. All rights reserved.</span>
          <span>Built for creators who sell digital access.</span>
        </div>
      </footer>
    </main>
  );
}

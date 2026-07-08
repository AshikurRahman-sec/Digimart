"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  Eye,
  FileText,
  FolderOpen,
  Globe,
  Layout,
  LogOut,
  Play,
  PlusCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  UploadCloud,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// Core Types
type ProductType = "video" | "document" | "template";

type ProvidedProduct = {
  id: string;
  title: string;
  price: string;
  description: string;
  category: string;
  status: "Published" | "Draft";
  type: ProductType;
};

type LibraryItem = {
  id: string;
  title: string;
  creator: string;
  type: "Video bundle" | "Notes + presentation" | "Workshop replay";
  progress: number;
  length: string;
  accent: "teal" | "blue" | "rose";
};

type MarketplaceProduct = {
  id: string;
  title: string;
  creator: string;
  description: string;
  price: string;
  type: "Video" | "Presentation" | "Notes";
  lessons: string;
  accent: "teal" | "blue" | "rose";
};

// Initial Data Seeds
const initialProvidedProducts: ProvidedProduct[] = [
  {
    id: "p1",
    title: "Intro to Product Demos",
    price: "$29",
    description: "Create high-converting product demonstrations and walkthroughs for digital products.",
    category: "Video Course",
    status: "Published",
    type: "video",
  },
  {
    id: "p2",
    title: "Design Patterns for SaaS",
    price: "$49",
    description: "A practical PDF handbook about UI architecture and modular design systems.",
    category: "PDF Handbook",
    status: "Draft",
    type: "document",
  },
  {
    id: "p3",
    title: "React NextJS Boilerplate Pro",
    price: "$89",
    description: "Production-ready starter files with Stripe setup, routing, and structured folders.",
    category: "Code Template",
    status: "Published",
    type: "template",
  },
];

const initialMarketplaceProducts: MarketplaceProduct[] = [
  {
    id: "prod1",
    title: "AI Product Design Masterclass",
    creator: "Nadia Rahman",
    description: "A practical bundle with product strategy lessons, design walkthroughs, and reusable templates.",
    price: "$49",
    type: "Video",
    lessons: "8 videos",
    accent: "teal",
  },
  {
    id: "prod2",
    title: "Growth Analytics Playbook",
    creator: "Mason Lee",
    description: "Presentation decks, worksheets, and examples for reading product growth metrics clearly.",
    price: "$29",
    type: "Presentation",
    lessons: "12 files",
    accent: "blue",
  },
  {
    id: "prod3",
    title: "Secure Billing Notes",
    creator: "Aria Chen",
    description: "Concise implementation notes for Stripe Checkout, subscriptions, and entitlement-based access.",
    price: "$39",
    type: "Notes",
    lessons: "6 chapters",
    accent: "rose",
  },
  {
    id: "p1",
    title: "Intro to Product Demos",
    creator: "Me",
    description: "Create high-converting product demonstrations and walkthroughs for digital products.",
    price: "$29",
    type: "Video",
    lessons: "8 lessons",
    accent: "teal",
  },
  {
    id: "p3",
    title: "React NextJS Boilerplate Pro",
    creator: "Me",
    description: "Production-ready starter files with Stripe setup, routing, and structured folders.",
    price: "$89",
    type: "Notes",
    lessons: "10 files",
    accent: "rose",
  },
];

const initialLibrary: LibraryItem[] = [
  {
    id: "lib1",
    title: "Python Automation Masterclass",
    creator: "Nadia Rahman",
    type: "Video bundle",
    progress: 68,
    length: "8 lessons",
    accent: "teal",
  },
  {
    id: "lib2",
    title: "Product Analytics Field Notes",
    creator: "Mason Lee",
    type: "Notes + presentation",
    progress: 24,
    length: "14 files",
    accent: "blue",
  },
  {
    id: "lib3",
    title: "Secure SaaS Billing Systems",
    creator: "Aria Chen",
    type: "Workshop replay",
    progress: 91,
    length: "5 sessions",
    accent: "rose",
  },
];

function getProductType(category: string): ProductType {
  const normalized = category.toLowerCase();
  if (normalized.includes("video")) return "video";
  if (normalized.includes("pdf") || normalized.includes("document") || normalized.includes("handbook")) {
    return "document";
  }
  return "template";
}

export default function UnifiedDashboardPage() {
  const router = useRouter();
  const { isReady, user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"all" | "subscribed" | "provide">("all");

  // Shared Filters / Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | ProductType>("all");

  // Subscribed Services state
  const [subscribedItems, setSubscribedItems] = useState<LibraryItem[]>(initialLibrary);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  // Marketplace catalog state
  const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProduct[]>(initialMarketplaceProducts);

  // Provide Services state
  const [providedProducts, setProvidedProducts] = useState<ProvidedProduct[]>(initialProvidedProducts);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Video Course");
  const [status, setStatus] = useState<ProvidedProduct["status"]>("Published");
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isReady && !user) {
      router.replace("/");
      return;
    }
    if (isReady && user && user.roles?.includes("admin")) {
      router.replace("/admin");
    }
  }, [isReady, user, router]);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  // Simulator for purchasing a service from "All Services"
  function handleAddToLibrary(product: MarketplaceProduct) {
    if (subscribedItems.some((item) => item.title === product.title)) return;
    setPurchasingId(product.id);

    window.setTimeout(() => {
      setSubscribedItems((currentItems) => [
        {
          id: `lib_${Date.now()}`,
          title: product.title,
          creator: product.creator,
          type: product.type === "Video" ? "Video bundle" : "Notes + presentation",
          progress: 0,
          length: product.lessons,
          accent: product.accent,
        },
        ...currentItems,
      ]);
      setPurchasingId(null);
      setActiveTab("subscribed");
    }, 700);
  }

  // Handle adding a new provided service
  function handleAddProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !price.trim()) return;

    const productType = getProductType(category);
    const formattedPrice = price.startsWith("$") ? price : `$${price}`;
    const newId = `p_${Date.now()}`;

    // Add to provided list
    const newProduct: ProvidedProduct = {
      id: newId,
      title,
      price: formattedPrice,
      description: description || "Digital access bundle ready for product content.",
      category,
      status,
      type: productType,
    };
    setProvidedProducts((current) => [newProduct, ...current]);

    // Also add to marketplace (if published)
    if (status === "Published") {
      const newMarketplaceItem: MarketplaceProduct = {
        id: newId,
        title,
        creator: "Me",
        description: description || "Digital access bundle ready for product content.",
        price: formattedPrice,
        type: productType === "video" ? "Video" : productType === "document" ? "Presentation" : "Notes",
        lessons: productType === "video" ? "8 lessons" : "12 files",
        accent: productType === "video" ? "teal" : productType === "document" ? "blue" : "rose",
      };
      setMarketplaceProducts((current) => [newMarketplaceItem, ...current]);
    }

    // Reset Form
    setTitle("");
    setPrice("");
    setDescription("");
    setCategory("Video Course");
    setStatus("Published");
    setFileName("");
    setUploadProgress(0);
  }

  // Delete a provided service
  function handleDeleteProduct(id: string) {
    setProvidedProducts((items) => items.filter((item) => item.id !== id));
    setMarketplaceProducts((items) => items.filter((item) => item.id !== id));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploadProgress(35);
    window.setTimeout(() => setUploadProgress(100), 500);
  }

  // Filtering Logic
  const filteredMarketplace = useMemo(() => {
    return marketplaceProducts.filter((product) => {
      const searchable = `${product.title} ${product.creator} ${product.type} ${product.description}`.toLowerCase();
      const matchesSearch = searchable.includes(searchQuery.toLowerCase());
      const matchesType =
        categoryFilter === "all" ||
        (categoryFilter === "video" && product.type === "Video") ||
        (categoryFilter === "document" && product.type === "Presentation") ||
        (categoryFilter === "template" && product.type === "Notes");
      return matchesSearch && matchesType;
    });
  }, [marketplaceProducts, searchQuery, categoryFilter]);

  const filteredLibrary = useMemo(() => {
    return subscribedItems.filter((item) => {
      const searchable = `${item.title} ${item.creator} ${item.type}`.toLowerCase();
      return searchable.includes(searchQuery.toLowerCase());
    });
  }, [subscribedItems, searchQuery]);

  const filteredProvided = useMemo(() => {
    return providedProducts.filter((product) => {
      const searchable = `${product.title} ${product.description} ${product.category}`.toLowerCase();
      const matchesSearch = searchable.includes(searchQuery.toLowerCase());
      const matchesType = categoryFilter === "all" || product.type === categoryFilter;
      return matchesSearch && matchesType;
    });
  }, [providedProducts, searchQuery, categoryFilter]);

  if (!isReady || !user) {
    return (
      <main className="loading-panel">
        <span>Loading your workspace...</span>
      </main>
    );
  }

  const publishedCount = providedProducts.filter((p) => p.status === "Published").length;
  const averageProgress = Math.round(
    subscribedItems.reduce((sum, item) => sum + item.progress, 0) / (subscribedItems.length || 1)
  );

  return (
    <main className="dashboard-page creator-page">
      {/* Top Navigation Bar */}
      <header className="dashboard-topbar">
        <div className="brand">
          <span className="brand-mark">
            <ShoppingBag size={18} aria-hidden="true" />
          </span>
          DigiMart
        </div>
        <div className="dashboard-account">
          <span className="user-email">{user.email}</span>
          <button className="ghost-danger-button" type="button" onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" />
            Logout
          </button>
        </div>
      </header>

      {/* Hero Workspace Header */}
      <section className="dashboard-hero creator-hero-clean">
        <div className="hero-left">
          <p className="eyebrow">User Workspace</p>
          <h1>
            {activeTab === "all"
              ? "Discover Digital Services"
              : activeTab === "subscribed"
              ? "Your Subscribed Services"
              : "Creator Studio Dashboard"}
          </h1>
          <p>
            {activeTab === "all"
              ? "Explore modern, high-quality digital bundles and courses published by global creators."
              : activeTab === "subscribed"
              ? "Access all your purchased services, continue your learning, and review resources."
              : "Package, upload, and distribute your digital products directly with full metrics details."}
          </p>
          <div className="hero-action-row">
            <button
              className={`button ${activeTab === "all" ? "" : "button-secondary"}`}
              type="button"
              onClick={() => setActiveTab("all")}
            >
              <Sparkles size={18} aria-hidden="true" />
              All Services
            </button>
            <button
              className={`button ${activeTab === "subscribed" ? "" : "button-secondary"}`}
              type="button"
              onClick={() => setActiveTab("subscribed")}
            >
              <FolderOpen size={18} aria-hidden="true" />
              Subscribed Services
            </button>
            <button
              className={`button ${activeTab === "provide" ? "" : "button-secondary"}`}
              type="button"
              onClick={() => setActiveTab("provide")}
            >
              <Globe size={18} aria-hidden="true" />
              Provide Services
            </button>
          </div>
        </div>

        {/* Dynamic Metric Panels depending on active tab */}
        <div className="hero-summary-panel">
          {activeTab === "provide" ? (
            <>
              <div>
                <span>Published</span>
                <strong>{publishedCount}</strong>
              </div>
              <div>
                <span>Drafts</span>
                <strong>{providedProducts.length - publishedCount}</strong>
              </div>
              <div>
                <span>Revenue</span>
                <strong>$1.8k</strong>
              </div>
            </>
          ) : (
            <>
              <div>
                <span>Subscribed</span>
                <strong>{subscribedItems.length}</strong>
              </div>
              <div>
                <span>Avg Progress</span>
                <strong>{averageProgress}%</strong>
              </div>
              <div>
                <span>Verified Access</span>
                <strong>On</strong>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Metric Cards Row */}
      <section className="metric-grid">
        {activeTab === "provide" ? (
          <>
            <article className="metric-card">
              <DollarSign size={22} aria-hidden="true" />
              <div>
                <strong>$1,842</strong>
                <span>Revenue this month</span>
              </div>
            </article>
            <article className="metric-card">
              <Eye size={22} aria-hidden="true" />
              <div>
                <strong>8,420</strong>
                <span>Product views</span>
              </div>
            </article>
            <article className="metric-card">
              <BarChart3 size={22} aria-hidden="true" />
              <div>
                <strong>14%</strong>
                <span>Conversion rate</span>
              </div>
            </article>
            <article className="metric-card">
              <ShieldCheck size={22} aria-hidden="true" />
              <div>
                <strong>Protected</strong>
                <span>No raw URLs exposed</span>
              </div>
            </article>
          </>
        ) : (
          <>
            <article className="metric-card">
              <BookOpen size={22} aria-hidden="true" />
              <div>
                <strong>{subscribedItems.length}</strong>
                <span>Purchased Bundles</span>
              </div>
            </article>
            <article className="metric-card">
              <Clock3 size={22} aria-hidden="true" />
              <div>
                <strong>3h 20m</strong>
                <span>Learning this week</span>
              </div>
            </article>
            <article className="metric-card">
              <CreditCard size={22} aria-hidden="true" />
              <div>
                <strong>2</strong>
                <span>Active subscriptions</span>
              </div>
            </article>
            <article className="metric-card">
              <ShieldCheck size={22} aria-hidden="true" />
              <div>
                <strong>Secure</strong>
                <span>Entitlement Checked</span>
              </div>
            </article>
          </>
        )}
      </section>

      {/* Main content toolbar: Search and category filters */}
      <section className="dashboard-toolbar">
        <div className="segmented-control" aria-label="Type filter">
          {(["all", "video", "document", "template"] as const).map((filter) => (
            <button
              className={categoryFilter === filter ? "segment-active" : ""}
              key={filter}
              type="button"
              onClick={() => setCategoryFilter(filter)}
            >
              {filter === "all" ? "All" : filter[0].toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        <label className="dashboard-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={
              activeTab === "all"
                ? "Search marketplace products..."
                : activeTab === "subscribed"
                ? "Search subscribed library..."
                : "Search provided products..."
            }
          />
        </label>
      </section>

      {/* Dynamic Content Views */}
      {activeTab === "all" && (
        <section className="content-grid">
          <div className="main-column">
            <div className="section-heading-large">
              <div>
                <p className="eyebrow">Catalog</p>
                <h2>All Digital Services</h2>
              </div>
            </div>
            {filteredMarketplace.length === 0 ? (
              <div className="empty-state">No services match your filters.</div>
            ) : (
              <div className="product-card-grid">
                {filteredMarketplace.map((product) => {
                  const isOwned = subscribedItems.some((item) => item.title === product.title);
                  return (
                    <article className="learning-card" key={product.id}>
                      <div className={`learning-card-media accent-${product.accent}`}>
                        {product.type === "Video" ? (
                          <Video size={34} aria-hidden="true" />
                        ) : product.type === "Presentation" ? (
                          <FileText size={34} aria-hidden="true" />
                        ) : (
                          <BookOpen size={34} aria-hidden="true" />
                        )}
                      </div>
                      <div className="learning-card-body">
                        <div className="card-meta-row">
                          <span>{product.type}</span>
                          <strong>{product.price}</strong>
                        </div>
                        <h3>{product.title}</h3>
                        <p>{product.description}</p>
                        <div className="creator-row">
                          <span>By {product.creator}</span>
                          <span>{product.lessons}</span>
                        </div>
                        <button
                          className="button"
                          type="button"
                          disabled={isOwned || purchasingId === product.id}
                          onClick={() => handleAddToLibrary(product)}
                        >
                          {isOwned ? (
                            <CheckCircle2 size={17} aria-hidden="true" />
                          ) : (
                            <ShoppingBag size={17} aria-hidden="true" />
                          )}
                          {isOwned ? "Subscribed" : purchasingId === product.id ? "Subscribing..." : "Subscribe Now"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
          <aside className="side-column">
            <article className="guidance-panel">
              <ShieldCheck size={26} aria-hidden="true" />
              <h2>Secure Delivery</h2>
              <p>
                All digital purchases use cryptographic access tokens that expire after 5 minutes to prevent piracy.
              </p>
            </article>
            <article className="guidance-panel">
              <Sparkles size={26} aria-hidden="true" />
              <h2>One-Click Access</h2>
              <p>Subscribe to services instantly to simulate credit-card purchases and immediately start learning.</p>
            </article>
          </aside>
        </section>
      )}

      {activeTab === "subscribed" && (
        <section className="content-grid">
          <div className="main-column">
            <div className="section-heading-large">
              <div>
                <p className="eyebrow">Library</p>
                <h2>Your Subscribed Access</h2>
              </div>
            </div>
            {filteredLibrary.length === 0 ? (
              <div className="empty-state">No subscribed services found. Explore and subscribe on the catalog.</div>
            ) : (
              <div className="library-list-clean">
                {filteredLibrary.map((item) => (
                  <article className="library-row-clean" key={item.id}>
                    <div className={`library-icon-tile accent-${item.accent}`}>
                      {item.type === "Video bundle" ? (
                        <Video size={24} aria-hidden="true" />
                      ) : (
                        <FileText size={24} aria-hidden="true" />
                      )}
                    </div>
                    <div className="library-row-body">
                      <span>{item.type}</span>
                      <h3>{item.title}</h3>
                      <p>
                        Published by {item.creator} · {item.length}
                      </p>
                      <div className="progress-track-clean" aria-label={`${item.progress}% complete`}>
                        <span style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                    <button className="icon-text-button" type="button" aria-label={`Open ${item.title}`}>
                      <Play size={17} aria-hidden="true" />
                      Launch
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
          <aside className="side-column">
            <article className="guidance-panel">
              <FolderOpen size={26} aria-hidden="true" />
              <h2>Workspace Status</h2>
              <p>You have access to {filteredLibrary.length} active service licenses under your account.</p>
            </article>
          </aside>
        </section>
      )}

      {activeTab === "provide" && (
        <section className="content-grid creator-workspace">
          <div className="main-column">
            <div className="section-heading-large">
              <div>
                <p className="eyebrow">Catalog</p>
                <h2>Services You Provide</h2>
              </div>
            </div>
            {filteredProvided.length === 0 ? (
              <div className="empty-state">You have not uploaded any products yet. Use the creation panel to add one.</div>
            ) : (
              <div className="product-card-grid">
                {filteredProvided.map((product) => (
                  <article className="learning-card creator-product-card" key={product.id}>
                    <div
                      className={`learning-card-media accent-${
                        product.type === "video" ? "teal" : product.type === "document" ? "blue" : "rose"
                      }`}
                    >
                      {product.type === "video" ? (
                        <Video size={34} aria-hidden="true" />
                      ) : product.type === "document" ? (
                        <FileText size={34} aria-hidden="true" />
                      ) : (
                        <Layout size={34} aria-hidden="true" />
                      )}
                    </div>
                    <div className="learning-card-body">
                      <div className="card-meta-row">
                        <span>{product.category}</span>
                        <strong>{product.price}</strong>
                      </div>
                      <h3>{product.title}</h3>
                      <p>{product.description}</p>
                      <div className="status-row">
                        <span className={product.status === "Published" ? "status-live" : "status-draft"}>
                          {product.status === "Published" ? (
                            <CheckCircle2 size={14} aria-hidden="true" />
                          ) : (
                            <FileText size={14} aria-hidden="true" />
                          )}
                          {product.status}
                        </span>
                      </div>
                      <div className="card-action-row">
                        <button className="icon-text-button" type="button">
                          <Eye size={16} aria-hidden="true" />
                          Preview
                        </button>
                        <button
                          className="icon-text-button danger"
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Creation Panel */}
          <aside className="side-column">
            <section className="dashboard-card sticky-card">
              <div className="section-heading-large">
                <div>
                  <p className="eyebrow">Provide</p>
                  <h2>New Service</h2>
                </div>
              </div>
              <form className="creator-form" onSubmit={handleAddProduct}>
                <label className="field">
                  <span className="label">Service Title</span>
                  <input
                    className="input"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Example: Python Automation course"
                    required
                  />
                </label>
                <label className="field">
                  <span className="label">Price ($)</span>
                  <input
                    className="input"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="49"
                    required
                  />
                </label>
                <label className="field">
                  <span className="label">Category</span>
                  <select className="select" value={category} onChange={(event) => setCategory(event.target.value)}>
                    <option>Video Course</option>
                    <option>PDF Handbook</option>
                    <option>Code Template</option>
                  </select>
                </label>
                <label className="field">
                  <span className="label">Status</span>
                  <select
                    className="select"
                    value={status}
                    onChange={(event) => setStatus(event.target.value as ProvidedProduct["status"])}
                  >
                    <option>Published</option>
                    <option>Draft</option>
                  </select>
                </label>
                <label className="field">
                  <span className="label">Description</span>
                  <textarea
                    className="textarea"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="What will subscribers get access to?"
                    rows={4}
                  />
                </label>
                <label className="upload-dropzone">
                  <UploadCloud size={28} aria-hidden="true" />
                  <span>{fileName || "Upload video, PDF, or assets"}</span>
                  <small>Content stays encrypted until backend transcoder verifies it.</small>
                  <input type="file" onChange={handleFileChange} />
                </label>
                {uploadProgress > 0 && (
                  <div className="progress-track-clean" aria-label={`${uploadProgress}% uploaded`}>
                    <span style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
                <button className="button" type="submit">
                  <PlusCircle size={18} aria-hidden="true" />
                  Publish Service
                </button>
              </form>
            </section>
          </aside>
        </section>
      )}
    </main>
  );
}

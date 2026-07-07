"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Trash2,
  PlusCircle,
  UploadCloud,
  Globe,
  DollarSign,
  Eye,
  CheckCircle2,
  Search,
  LogOut,
  Video,
  FileText,
  Code,
  Layout,
  Heart,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Product {
  id: string;
  title: string;
  price: string;
  description: string;
  category: string;
  status: string;
  type: string;
}

export default function CreatorDashboardPage() {
  const router = useRouter();
  const { isReady, user, logout } = useAuth();

  // Scoped product state for interactive portfolio demo
  const [products, setProducts] = useState<Product[]>([
    {
      id: "p1",
      title: "Intro to Product Demos",
      price: "$29",
      description: "Master the art of creating high-converting product demonstrations and walk-throughs for digital products.",
      category: "Video Course",
      status: "Published",
      type: "video"
    },
    {
      id: "p2",
      title: "Design Patterns for SaaS",
      price: "$49",
      description: "A comprehensive guide outlining advanced UI/UX architecture and modular design systems for SaaS platforms.",
      category: "PDF Handbook",
      status: "Draft",
      type: "document"
    },
    {
      id: "p3",
      title: "React NextJS Boilerplate Pro",
      price: "$89",
      description: "Production-ready template with structured folders, database integration, Stripe API connection, and secure routing.",
      category: "Code Template",
      status: "Published",
      type: "code"
    }
  ]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Form states for uploading new "think"
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Video Course");
  const [status, setStatus] = useState("Published");

  // File upload simulation states
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (isReady && !user) router.replace("/");
    if (isReady && user && !user.roles?.includes("creator")) router.replace("/library");
  }, [isReady, user, router]);

  if (!isReady || !user) {
    return (
      <main className="loading-container">
        <style dangerouslySetInnerHTML={{ __html: `
          .loading-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f3f4f6;
            font-family: sans-serif;
          }
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border-left-color: #0f766e;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
        <div className="spinner"></div>
      </main>
    );
  }

  // Handle file selection and simulate progress
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    simulateUpload(file.name);
  };

  const simulateUpload = (name: string) => {
    setFileName(name);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setUploadSuccess(true);
      }
    }, 100);
  };

  // Add new product submit handler
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return;

    const newProduct: Product = {
      id: `p_${Date.now()}`,
      title,
      price: price.startsWith("$") ? price : `$${price}`,
      description: description || "No description provided.",
      category,
      status,
      type: category.toLowerCase().includes("video") ? "video" :
            category.toLowerCase().includes("pdf") || category.toLowerCase().includes("handbook") || category.toLowerCase().includes("document") ? "document" :
            category.toLowerCase().includes("code") || category.toLowerCase().includes("boilerplate") ? "code" : "design"
    };

    setProducts([newProduct, ...products]);

    // Reset Form fields
    setTitle("");
    setPrice("");
    setDescription("");
    setFileName("");
    setUploadProgress(0);
    setUploadSuccess(false);
  };

  // Delete product handler
  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Filters logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (categoryFilter === "all") return matchesSearch;
    return matchesSearch && p.type === categoryFilter;
  });

  const getGradientClass = (type: string) => {
    switch (type) {
      case "video": return "card-gradient-1";
      case "document": return "card-gradient-2";
      case "code": return "card-gradient-3";
      default: return "card-gradient-4";
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "video": return <Video size={36} />;
      case "document": return <FileText size={36} />;
      case "code": return <Code size={36} />;
      default: return <Layout size={36} />;
    }
  };

  return (
    <main className="portfolio-container">
      {/* Scope CSS Styles for Premium Redesign */}
      <style dangerouslySetInnerHTML={{ __html: `
        .portfolio-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 32px 24px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #1f2937;
          background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.05), transparent 400px),
                      radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.05), transparent 400px);
          min-height: 100vh;
        }

        /* Minimal Header */
        .portfolio-header-minimal {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(229, 231, 235, 0.7);
        }

        .portfolio-logo {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .portfolio-logo-badge {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: rgba(16, 185, 129, 0.1);
          color: #047857;
          padding: 3px 10px;
          border-radius: 9999px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .user-profile-menu {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-email-text {
          font-size: 13px;
          color: #4b5563;
          font-weight: 500;
        }

        .logout-btn-minimal {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #ef4444;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .logout-btn-minimal:hover {
          opacity: 0.8;
          background-color: rgba(239, 68, 68, 0.05);
        }

        /* Portfolio Hero Section */
        .portfolio-hero {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          background: linear-gradient(135deg, #090d16, #111827);
          padding: 48px;
          color: white;
          margin-bottom: 40px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .portfolio-hero-bg {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.15), transparent 50%),
                      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15), transparent 55%);
          z-index: 1;
        }

        .portfolio-hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .portfolio-hero-profile {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .portfolio-hero-avatar {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: linear-gradient(135deg, #059669, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 850;
          color: white;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
          border: 3px solid rgba(255, 255, 255, 0.1);
        }

        .portfolio-hero-info h1 {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 6px 0;
          letter-spacing: -0.03em;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .portfolio-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          color: #60a5fa;
          background: rgba(59, 130, 246, 0.15);
          padding: 4px 12px;
          border-radius: 9999px;
          border: 1px solid rgba(59, 130, 246, 0.3);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .portfolio-hero-info p {
          color: #9ca3af;
          margin: 0;
          font-size: 15px;
          max-width: 600px;
          line-height: 1.5;
        }

        .portfolio-hero-stats {
          display: flex;
          gap: 40px;
          margin-top: 12px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .portfolio-stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .portfolio-stat-value {
          font-size: 24px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
        }

        .portfolio-stat-label {
          font-size: 11px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
        }

        /* Workspace Grid Layout */
        .portfolio-grid-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 36px;
        }

        /* Showcase Zone */
        .portfolio-showcase-card {
          background: white;
          border-radius: 24px;
          border: 1px solid rgba(229, 231, 235, 0.8);
          padding: 32px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
        }

        .portfolio-showcase-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .portfolio-showcase-title {
          font-size: 22px;
          font-weight: 800;
          color: #111827;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .filter-tabs-minimal {
          display: flex;
          background: #f3f4f6;
          padding: 3px;
          border-radius: 10px;
          gap: 2px;
        }

        .filter-tab-btn {
          background: none;
          border: none;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 650;
          color: #4b5563;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-tab-btn-active {
          background: white;
          color: #111827;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .search-bar-wrapper {
          display: flex;
          align-items: center;
          position: relative;
          margin-bottom: 24px;
        }

        .search-bar-input {
          width: 100%;
          padding: 10px 14px 10px 38px;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          font-size: 14px;
          background: #f9fafb;
          transition: all 0.2s;
        }

        .search-bar-input:focus {
          outline: none;
          border-color: #3b82f6;
          background-color: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
        }

        .search-icon-pos {
          position: absolute;
          left: 12px;
          color: #9ca3af;
        }

        /* Products Grid */
        .portfolio-gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }

        .portfolio-card-item {
          background: white;
          border-radius: 18px;
          border: 1px solid #f3f4f6;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .portfolio-card-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03);
          border-color: #e5e7eb;
        }

        .card-visual-header {
          height: 130px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .card-gradient-1 {
          background: linear-gradient(135deg, #10b981, #047857);
        }

        .card-gradient-2 {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }

        .card-gradient-3 {
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
        }

        .card-gradient-4 {
          background: linear-gradient(135deg, #ec4899, #be185d);
        }

        .card-price-overlay {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          color: white;
          font-weight: 750;
          font-size: 13px;
          padding: 4px 10px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .card-type-overlay {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(8px);
          color: white;
          font-weight: 700;
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .card-info-body {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .card-info-body h3 {
          font-size: 17px;
          font-weight: 750;
          color: #111827;
          margin: 0;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }

        .card-info-body p {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
          line-height: 1.45;
          flex: 1;
        }

        .card-status-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .dot-marker {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .dot-live {
          background-color: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
          animation: pulse-dot-key 2s infinite;
        }

        .dot-draft {
          background-color: #9ca3af;
        }

        @keyframes pulse-dot-key {
          0% { transform: scale(0.95); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.6; }
        }

        .card-actions-strip {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          border-top: 1px solid #f3f4f6;
          padding-top: 14px;
        }

        .card-action-btn-custom {
          flex: 1;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          border: 1px solid #e5e7eb;
          background: white;
          color: #4b5563;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.2s;
        }

        .card-action-btn-custom:hover {
          background: #f9fafb;
          border-color: #d1d5db;
          color: #111827;
        }

        .card-action-btn-delete {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.1);
          background: rgba(239, 68, 68, 0.02);
        }

        .card-action-btn-delete:hover {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.3);
          color: #dc2626;
        }

        /* Upload Panel */
        .upload-card-panel {
          background: white;
          border-radius: 24px;
          border: 1px solid rgba(229, 231, 235, 0.8);
          padding: 32px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
          align-self: start;
        }

        .upload-panel-title-text {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #111827;
          letter-spacing: -0.02em;
        }

        .custom-form-group {
          margin-bottom: 18px;
        }

        .custom-form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 6px;
        }

        .custom-form-input, .custom-form-select, .custom-form-textarea {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          font-size: 14px;
          color: #111827;
          background: #f9fafb;
          transition: all 0.2s;
        }

        .custom-form-input:focus, .custom-form-select:focus, .custom-form-textarea:focus {
          outline: none;
          border-color: #059669;
          background-color: white;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.12);
        }

        .price-prefix-wrapper {
          position: relative;
        }

        .dollar-prefix-char {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 14px;
          font-weight: 600;
        }

        .price-input-formatted {
          padding-left: 24px;
        }

        /* File Upload Box */
        .custom-upload-box {
          border: 2px dashed #cbd5e1;
          border-radius: 14px;
          padding: 24px 16px;
          text-align: center;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        .custom-upload-box:hover {
          border-color: #059669;
          background: rgba(5, 150, 105, 0.02);
        }

        .hidden-file-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .upload-icon-custom {
          color: #059669;
        }

        .upload-main-text {
          font-size: 13px;
          color: #334155;
          font-weight: 600;
        }

        .upload-sub-text {
          font-size: 11px;
          color: #64748b;
        }

        /* Progress Bar */
        .progress-indicator-track {
          width: 100%;
          background-color: #e2e8f0;
          border-radius: 9999px;
          height: 8px;
          overflow: hidden;
          margin-top: 12px;
        }

        .progress-indicator-fill {
          background: linear-gradient(90deg, #10b981, #059669);
          height: 100%;
          transition: width 0.1s linear;
        }

        .upload-success-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #065f46;
          background-color: #d1fae5;
          padding: 6px 12px;
          border-radius: 8px;
          margin-top: 10px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .submit-btn-custom {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          background: linear-gradient(135deg, #059669, #047857);
          color: white;
          border: none;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2);
        }

        .submit-btn-custom:hover {
          opacity: 0.95;
          box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.3);
        }

        .submit-btn-custom:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .empty-portfolio-message {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 24px;
          border: 2px dashed #e5e7eb;
          border-radius: 20px;
          color: #9ca3af;
        }

        .empty-portfolio-message p {
          margin: 8px 0 0 0;
          font-size: 14px;
        }

        /* Responsive rules */
        @media (max-width: 1024px) {
          .portfolio-grid-layout {
            grid-template-columns: 1fr;
          }
          .upload-card-panel {
            order: -1;
          }
        }

        @media (max-width: 640px) {
          .portfolio-gallery-grid {
            grid-template-columns: 1fr;
          }
          .portfolio-hero-profile {
            flex-direction: column;
            text-align: center;
          }
          .portfolio-hero {
            padding: 32px 20px;
          }
          .portfolio-hero-stats {
            flex-wrap: wrap;
            gap: 20px;
          }
        }
      `}} />

      {/* Minimalist Top Bar (No standard navbar tabs) */}
      <header className="portfolio-header-minimal">
        <div className="portfolio-logo">
          <span>DigiMart</span>
          <span className="portfolio-logo-badge">Creator Studio</span>
        </div>
        <div className="user-profile-menu">
          <span className="user-email-text">{user.email}</span>
          <button className="logout-btn-minimal" onClick={() => logout()} type="button">
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Portfolio Banner / Profile Header */}
      <section className="portfolio-hero">
        <div className="portfolio-hero-bg"></div>
        <div className="portfolio-hero-content">
          <div className="portfolio-hero-profile">
            <div className="portfolio-hero-avatar">
              {user.email.substring(0, 2).toUpperCase()}
            </div>
            <div className="portfolio-hero-info">
              <h1>
                {user.email.split("@")[0]}
                <span className="portfolio-verified-badge">
                  <CheckCircle2 size={12} style={{ color: "#3b82f6" }} /> Verified Creator
                </span>
              </h1>
              <p>
                Showcasing digital templates, source code blueprints, video lectures, and premium documentation. Open to custom projects.
              </p>
            </div>
          </div>

          <div className="portfolio-hero-stats">
            <div className="portfolio-stat-item">
              <span className="portfolio-stat-value">{products.length}</span>
              <span className="portfolio-stat-label">Total Assets</span>
            </div>
            <div className="portfolio-stat-item">
              <span className="portfolio-stat-value">
                {products.filter((p) => p.status === "Published").length}
              </span>
              <span className="portfolio-stat-label">Published</span>
            </div>
            <div className="portfolio-stat-item">
              <span className="portfolio-stat-value">
                {products.filter((p) => p.status === "Draft").length}
              </span>
              <span className="portfolio-stat-label">Drafts</span>
            </div>
            <div className="portfolio-stat-item">
              <span className="portfolio-stat-value">$1,240</span>
              <span className="portfolio-stat-label">Estimated Value</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="portfolio-grid-layout">
        
        {/* Left Side: Portfolio Gallery Showcase */}
        <section className="portfolio-showcase-card">
          <div className="portfolio-showcase-header">
            <h2 className="portfolio-showcase-title">Your Digital Portfolio</h2>
            
            {/* Filter Tabs */}
            <div className="filter-tabs-minimal">
              <button
                className={`filter-tab-btn ${categoryFilter === "all" ? "filter-tab-btn-active" : ""}`}
                onClick={() => setCategoryFilter("all")}
                type="button"
              >
                All
              </button>
              <button
                className={`filter-tab-btn ${categoryFilter === "video" ? "filter-tab-btn-active" : ""}`}
                onClick={() => setCategoryFilter("video")}
                type="button"
              >
                Videos
              </button>
              <button
                className={`filter-tab-btn ${categoryFilter === "document" ? "filter-tab-btn-active" : ""}`}
                onClick={() => setCategoryFilter("document")}
                type="button"
              >
                Docs
              </button>
              <button
                className={`filter-tab-btn ${categoryFilter === "code" ? "filter-tab-btn-active" : ""}`}
                onClick={() => setCategoryFilter("code")}
                type="button"
              >
                Code
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="search-bar-wrapper">
            <Search size={16} className="search-icon-pos" />
            <input
              type="text"
              placeholder="Search assets by name or description..."
              className="search-bar-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Asset Showcase Grid */}
          <div className="portfolio-gallery-grid">
            {filteredProducts.length === 0 ? (
              <div className="empty-portfolio-message">
                <Sparkles size={28} />
                <p>No creative works match your search. Create or upload a new asset to show it off!</p>
              </div>
            ) : (
              filteredProducts.map((p) => (
                <div key={p.id} className="portfolio-card-item">
                  <div className={`card-visual-header ${getGradientClass(p.type)}`}>
                    {getCategoryIcon(p.type)}
                    <span className="card-price-overlay">{p.price}</span>
                    <span className="card-type-overlay">{p.category}</span>
                  </div>
                  
                  <div className="card-info-body">
                    <div className="card-status-indicator">
                      <span className={`dot-marker ${p.status === "Published" ? "dot-live" : "dot-draft"}`}></span>
                      <span style={{ color: p.status === "Published" ? "#10b981" : "#6b7280" }}>
                        {p.status}
                      </span>
                    </div>

                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    
                    <div className="card-actions-strip">
                      <button className="card-action-btn-custom" type="button">
                        <ExternalLink size={12} /> View Page
                      </button>
                      <button
                        className="card-action-btn-custom card-action-btn-delete"
                        onClick={() => handleDeleteProduct(p.id)}
                        type="button"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Side: Upload New Asset Form */}
        <section className="upload-card-panel">
          <h2 className="upload-panel-title-text">
            <PlusCircle size={20} style={{ color: "#059669" }} />
            Add New Asset
          </h2>
          
          <form onSubmit={handleAddProduct}>
            <div className="custom-form-group">
              <label htmlFor="asset-title">Asset Title</label>
              <input
                type="text"
                id="asset-title"
                placeholder="e.g. Next.js Tailwind Dashboard Template"
                className="custom-form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="custom-form-group">
              <label htmlFor="asset-category">Category</label>
              <select
                id="asset-category"
                className="custom-form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Video Course">Video Course</option>
                <option value="PDF Handbook">PDF Handbook</option>
                <option value="Code Blueprint">Code Blueprint</option>
                <option value="Design Asset">Design Asset</option>
              </select>
            </div>

            <div className="custom-form-group">
              <label htmlFor="asset-price">Pricing</label>
              <div className="price-prefix-wrapper">
                <span className="dollar-prefix-char">$</span>
                <input
                  type="text"
                  id="asset-price"
                  placeholder="29"
                  className="custom-form-input price-input-formatted"
                  value={price.replace("$", "")}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="custom-form-group">
              <label htmlFor="asset-desc">Short Description</label>
              <textarea
                id="asset-desc"
                placeholder="Explain the benefits of this digital file to prospective buyers..."
                className="custom-form-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="custom-form-group">
              <label htmlFor="asset-status">Availability</label>
              <select
                id="asset-status"
                className="custom-form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Published">Publish (Visible to everyone)</option>
                <option value="Draft">Keep as Draft</option>
              </select>
            </div>

            {/* Dotted Upload Widget */}
            <div className="custom-form-group">
              <label>Digital Files</label>
              <div className="custom-upload-box">
                <UploadCloud size={28} className="upload-icon-custom" />
                <span className="upload-main-text">
                  {fileName ? fileName : "Drag & drop files or click to choose"}
                </span>
                <span className="upload-sub-text">Supports ZIP, MP4, PDF, and PNG up to 100MB</span>
                <input
                  type="file"
                  className="hidden-file-input"
                  onChange={handleFileChange}
                />
              </div>

              {isUploading && (
                <div>
                  <div className="progress-indicator-track">
                    <div className="progress-indicator-fill" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                </div>
              )}

              {uploadSuccess && (
                <div style={{ textAlign: "center" }}>
                  <span className="upload-success-label">
                    <CheckCircle2 size={12} /> File Verified & Staged
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="submit-btn-custom"
              disabled={isUploading || !title || !price}
            >
              <Sparkles size={16} /> Publish Asset
            </button>
          </form>
        </section>

      </div>
    </main>
  );
}

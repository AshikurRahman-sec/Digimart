"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Clock3,
  CreditCard,
  FolderOpen,
  LogOut,
  Play,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Zap,
  Briefcase,
  CheckCircle2,
  Calendar,
  DollarSign,
  Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface LibraryItem {
  id: string;
  title: string;
  creator: string;
  type: string;
  progress: number;
  length: string;
  accent: string;
}

interface CreatorService {
  id: string;
  title: string;
  creatorName: string;
  creatorInitials: string;
  description: string;
  price: string;
  type: string;
}

export default function LibraryPage() {
  const router = useRouter();
  const { isReady, logout, user } = useAuth();

  // Buyer owned items (starts with 3 defaults, can be added to in real-time)
  const [ownedItems, setOwnedItems] = useState<LibraryItem[]>([
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
  ]);

  // Creator services catalog state
  const [creatorServices, setCreatorServices] = useState<CreatorService[]>([
    {
      id: "srv1",
      title: "1-on-1 System Design Consultation",
      creatorName: "Nadia Rahman",
      creatorInitials: "NR",
      description: "A 60-minute interactive session to review your system architecture, scaling bottlenecks, and cloud infrastructure.",
      price: "$150",
      type: "Consultation"
    },
    {
      id: "srv2",
      title: "Next.js Frontend Implementation",
      creatorName: "Mason Lee",
      creatorInitials: "ML",
      description: "Hire a professional to build production-ready, performant, SEO-optimized React/Next.js pages styled with custom CSS.",
      price: "$499",
      type: "Development"
    },
    {
      id: "srv3",
      title: "Cybersecurity & Code Audit",
      creatorName: "Aria Chen",
      creatorInitials: "AC",
      description: "A comprehensive review of your repository for security flaws, package vulnerabilities, and authentication weaknesses.",
      price: "$299",
      type: "Security"
    },
    {
      id: "srv4",
      title: "Custom Figma Design System",
      creatorName: "Alex Rivera",
      creatorInitials: "AR",
      description: "Get a customized Figma UI kit matching your brand with responsive layouts, typography scales, and interactive components.",
      price: "$199",
      type: "Design"
    }
  ]);

  // Booking states
  const [bookingServiceId, setBookingServiceId] = useState<string | null>(null);
  const [bookedServices, setBookedServices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"services" | "purchased">("services");

  useEffect(() => {
    if (isReady && !user) {
      router.replace("/");
    }
  }, [isReady, router, user]);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  // Handle service purchase/booking simulation
  const handleBookService = (service: CreatorService) => {
    if (bookedServices.includes(service.id)) return;

    setBookingServiceId(service.id);

    // Simulate Payment Processing
    setTimeout(() => {
      setBookedServices([...bookedServices, service.id]);
      setBookingServiceId(null);

      // Add to buyer's personal library items
      const newLibItem: LibraryItem = {
        id: `lib_${Date.now()}`,
        title: service.title,
        creator: service.creatorName,
        type: `${service.type} Service`,
        progress: 0,
        length: "Scheduled",
        accent: service.type === "Consultation" ? "teal" : 
                service.type === "Development" ? "blue" : 
                service.type === "Security" ? "rose" : "purple"
      };
      setOwnedItems([newLibItem, ...ownedItems]);
    }, 1200);
  };

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
            border-left-color: #2563eb;
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

  // Filter owned library items
  const filteredOwnedItems = ownedItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter creator services
  const filteredCreatorServices = creatorServices.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Categorize helper function for library items
  const getCategory = (item: LibraryItem) => {
    const type = item.type.toLowerCase();
    const title = item.title.toLowerCase();
    
    // Check for tutorials (e.g. video, workshop, tutorial, masterclass, replay)
    if (
      type.includes("video") || 
      type.includes("workshop") || 
      type.includes("tutorial") || 
      type.includes("course") || 
      type.includes("lesson") ||
      title.includes("masterclass") ||
      title.includes("replay")
    ) {
      return "tutorial";
    }
    
    // Check for documents (e.g. notes, presentation, document, pdf, file, guide)
    if (
      type.includes("notes") || 
      type.includes("presentation") || 
      type.includes("document") || 
      type.includes("pdf") || 
      type.includes("file") || 
      type.includes("guide") ||
      title.includes("notes") ||
      title.includes("sheet")
    ) {
      return "document";
    }
    
    // Default to other sections/services
    return "other";
  };

  const tutorials = filteredOwnedItems.filter(item => getCategory(item) === "tutorial");
  const documents = filteredOwnedItems.filter(item => getCategory(item) === "document");
  const others = filteredOwnedItems.filter(item => getCategory(item) === "other");

  const renderAssetCard = (item: LibraryItem) => (
    <article key={item.id} className="owned-asset-card">
      <div className={`owned-asset-visual ${
        item.accent === "teal" ? "bg-teal-gradient" :
        item.accent === "blue" ? "bg-blue-gradient" :
        item.accent === "rose" ? "bg-rose-gradient" : "bg-purple-gradient"
      }`}>
        {item.type.includes("Video") ? "🎥" : item.type.includes("Service") ? "💼" : "📄"}
      </div>

      <div className="owned-asset-details">
        <span className="owned-asset-type">{item.type}</span>
        <h3 className="owned-asset-title">{item.title}</h3>
        <span className="owned-asset-creator">by {item.creator}</span>
        
        {item.length !== "Scheduled" && (
          <div>
            <div className="progress-track-buyer">
              <div className="progress-fill-buyer" style={{ width: `${item.progress}%` }}></div>
            </div>
            <span style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px", display: "inline-block" }}>
              {item.progress}% complete • {item.length}
            </span>
          </div>
        )}

        {item.length === "Scheduled" && (
          <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
            <CheckCircle2 size={12} /> Scheduled & Active
          </span>
        )}
      </div>

      <button className="play-action-btn" type="button" aria-label={`Open ${item.title}`}>
        <Play size={16} />
      </button>
    </article>
  );

  return (
    <main className="buyer-dashboard">
      {/* Scoped CSS Styles for Buyer Dashboard */}
      <style dangerouslySetInnerHTML={{ __html: `
        .buyer-dashboard {
          max-width: 1240px;
          margin: 0 auto;
          padding: 32px 24px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #1f2937;
          background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.05), transparent 450px),
                      radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.03), transparent 450px);
          min-height: 100vh;
        }

        /* Minimal Header */
        .buyer-header-minimal {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(229, 231, 235, 0.7);
        }

        .buyer-logo {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .buyer-logo-badge {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: rgba(59, 130, 246, 0.1);
          color: #1d4ed8;
          padding: 3px 10px;
          border-radius: 9999px;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .user-account-menu {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-email-display {
          font-size: 13px;
          color: #4b5563;
          font-weight: 500;
        }

        .logout-btn-custom {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #ef4444;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .logout-btn-custom:hover {
          background-color: rgba(239, 68, 68, 0.06);
        }

        /* Hero Banner */
        .buyer-hero {
          border-radius: 24px;
          background: linear-gradient(135deg, #1e3a8a, #0f172a);
          padding: 44px;
          color: white;
          margin-bottom: 40px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
        }

        .buyer-hero-glow {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: radial-gradient(circle at 85% 15%, rgba(59, 130, 246, 0.2), transparent 45%),
                      radial-gradient(circle at 15% 85%, rgba(236, 72, 153, 0.1), transparent 50%);
          z-index: 1;
        }

        .buyer-hero-content {
          position: relative;
          z-index: 2;
        }

        .buyer-hero h1 {
          font-size: 32px;
          font-weight: 850;
          margin: 0 0 10px 0;
          letter-spacing: -0.03em;
        }

        .buyer-hero p {
          color: #93c5fd;
          font-size: 15px;
          margin: 0;
          max-width: 600px;
          line-height: 1.5;
        }

        /* Metrics Strip */
        .buyer-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .buyer-metric-item {
          background: white;
          border-radius: 16px;
          border: 1px solid rgba(229, 231, 235, 0.8);
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .buyer-metric-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .metric-bg-blue {
          background-color: rgba(59, 130, 246, 0.1);
          color: #1d4ed8;
        }

        .metric-bg-green {
          background-color: rgba(16, 185, 129, 0.1);
          color: #047857;
        }

        .metric-bg-amber {
          background-color: rgba(245, 158, 11, 0.1);
          color: #b45309;
        }

        .metric-bg-purple {
          background-color: rgba(139, 92, 246, 0.1);
          color: #6d28d9;
        }

        .buyer-metric-info {
          display: flex;
          flex-direction: column;
        }

        .buyer-metric-value {
          font-size: 20px;
          font-weight: 800;
          color: #111827;
        }

        .buyer-metric-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        /* Columns Grid */
        .buyer-grid-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 36px;
        }

        .buyer-main-column {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .buyer-section-card {
          background: white;
          border-radius: 24px;
          border: 1px solid rgba(229, 231, 235, 0.8);
          padding: 32px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }

        .buyer-section-title-wrap {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .buyer-section-title {
          font-size: 20px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.02em;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Library Search */
        .search-box-buyer {
          display: flex;
          align-items: center;
          position: relative;
          width: 250px;
        }

        .search-box-buyer input {
          width: 100%;
          padding: 8px 12px 8px 32px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          font-size: 13px;
          background: #f9fafb;
        }

        .search-box-buyer input:focus {
          outline: none;
          border-color: #2563eb;
          background-color: white;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .search-icon-buyer {
          position: absolute;
          left: 10px;
          color: #9ca3af;
        }

        /* Owned List */
        .owned-assets-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .owned-asset-card {
          border: 1px solid #f3f4f6;
          border-radius: 16px;
          padding: 16px;
          display: grid;
          grid-template-columns: 56px 1fr auto;
          align-items: center;
          gap: 16px;
          transition: all 0.2s;
        }

        .owned-asset-card:hover {
          border-color: #e5e7eb;
          background-color: #f9fafb;
          transform: translateX(4px);
        }

        .owned-asset-visual {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          flex-shrink: 0;
        }

        .bg-teal-gradient { background: linear-gradient(135deg, #0d9488, #0f766e); }
        .bg-blue-gradient { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
        .bg-rose-gradient { background: linear-gradient(135deg, #db2777, #be185d); }
        .bg-purple-gradient { background: linear-gradient(135deg, #7c3aed, #6d28d9); }

        .owned-asset-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .owned-asset-type {
          font-size: 10px;
          font-weight: 700;
          color: #4f46e5;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .owned-asset-title {
          font-size: 15px;
          font-weight: 750;
          color: #111827;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .owned-asset-creator {
          font-size: 12px;
          color: #6b7280;
        }

        .progress-track-buyer {
          width: 100%;
          background-color: #e2e8f0;
          height: 5px;
          border-radius: 9999px;
          overflow: hidden;
          margin-top: 6px;
        }

        .progress-fill-buyer {
          background-color: #2563eb;
          height: 100%;
          border-radius: 9999px;
        }

        .play-action-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #111827;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .play-action-btn:hover {
          background-color: #2563eb;
          transform: scale(1.08);
        }

        /* Services Grid */
        .services-marketplace-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .service-card-item {
          border: 1px solid #f3f4f6;
          border-radius: 18px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.25s ease;
          background-color: white;
        }

        .service-card-item:hover {
          border-color: #d1d5db;
          transform: translateY(-4px);
          box-shadow: 0 10px 20px -10px rgba(0, 0, 0, 0.08);
        }

        .service-creator-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .service-creator-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 700;
          color: white;
        }

        .service-creator-name {
          font-size: 12px;
          color: #4b5563;
          font-weight: 600;
        }

        .service-title-text {
          font-size: 15px;
          font-weight: 750;
          color: #111827;
          margin: 0;
          line-height: 1.35;
          letter-spacing: -0.01em;
        }

        .service-desc-text {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.45;
          margin: 0;
          flex: 1;
        }

        .service-pricing-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          border-top: 1px solid #f3f4f6;
          padding-top: 12px;
        }

        .service-price-value {
          font-size: 17px;
          font-weight: 800;
          color: #111827;
        }

        .book-service-btn {
          padding: 8px 14px;
          border-radius: 8px;
          background-color: #2563eb;
          color: white;
          border: none;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .book-service-btn:hover {
          background-color: #1d4ed8;
        }

        .book-service-btn:disabled {
          background-color: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .service-booked-success {
          background-color: #d1fae5;
          color: #065f46;
          border: 1px solid rgba(16, 185, 129, 0.2);
          cursor: default;
        }

        .service-booked-success:hover {
          background-color: #d1fae5;
        }

        /* Sidebar Glass */
        .buyer-sidebar {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .sidebar-glass-card {
          background: white;
          border-radius: 20px;
          border: 1px solid rgba(229, 231, 235, 0.8);
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }

        .sidebar-title {
          font-size: 16px;
          font-weight: 800;
          color: #111827;
          margin: 0 0 16px 0;
          letter-spacing: -0.01em;
        }

        .activity-feed-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-feed-item {
          display: flex;
          gap: 10px;
          font-size: 13px;
          color: #4b5563;
          line-height: 1.4;
        }

        .activity-bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #2563eb;
          margin-top: 6px;
          flex-shrink: 0;
        }

        /* Creators Directory List */
        .creators-directory-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .creator-directory-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid #f3f4f6;
        }

        .creator-directory-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .creator-details-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .creator-large-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #3b82f6);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
        }

        .creator-name-meta {
          display: flex;
          flex-direction: column;
        }

        .creator-name-bold {
          font-size: 13.5px;
          font-weight: 750;
          color: #111827;
        }

        .creator-specialty {
          font-size: 11px;
          color: #6b7280;
        }

        .creator-rating-star {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11.5px;
          color: #f59e0b;
          font-weight: 700;
        }

        .empty-library-msg {
          text-align: center;
          padding: 32px 16px;
          color: #9ca3af;
          border: 2px dashed #f3f4f6;
          border-radius: 12px;
        }

        /* Scoped Tab Switcher & Category Styling */
        .dashboard-tabs-wrapper {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 2px solid rgba(229, 231, 235, 0.5);
          padding-bottom: 2px;
        }

        .dashboard-tab-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          font-size: 15px;
          font-weight: 750;
          color: #6b7280;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: -2px;
        }

        .dashboard-tab-trigger:hover {
          color: #1f2937;
        }

        .dashboard-tab-trigger.active {
          color: #2563eb;
          border-bottom-color: #2563eb;
        }

        .categories-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .category-section {
          background: #fdfdfd;
          border: 1px solid rgba(229, 231, 235, 0.6);
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.01);
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 800;
          color: #111827;
          margin-top: 0;
          margin-bottom: 16px;
          border-bottom: 1px solid rgba(243, 244, 246, 0.8);
          padding-bottom: 10px;
        }

        .category-icon {
          font-size: 18px;
        }

        .category-count-badge {
          margin-left: auto;
          font-size: 11px;
          font-weight: 700;
          background: rgba(37, 99, 235, 0.08);
          color: #2563eb;
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .category-empty-text {
          font-size: 13px;
          color: #9ca3af;
          margin: 0;
          padding: 16px;
          text-align: center;
          background: #f9fafb;
          border: 1px dashed rgba(229, 231, 235, 0.7);
          border-radius: 12px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .buyer-grid-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .services-marketplace-grid {
            grid-template-columns: 1fr;
          }
          .buyer-hero {
            padding: 32px 20px;
          }
          .buyer-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}} />

      {/* Header topbar */}
      <header className="buyer-header-minimal">
        <div className="buyer-logo">
          <span className="buyer-logo-badge">Buyer Space</span>
          <span>DigiMart</span>
        </div>
        <div className="user-account-menu">
          <span className="user-email-display">{user.email}</span>
          <button className="logout-btn-custom" onClick={handleLogout} type="button">
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      {/* Hero Welcome banner */}
      <section className="buyer-hero">
        <div className="buyer-hero-glow"></div>
        <div className="buyer-hero-content">
          <h1>Welcome Back, {user.email.split("@")[0]}</h1>
          <p>
            Explore your workspace library of digital guides, or book direct consulting services and custom solutions offered by our verified developer network.
          </p>
        </div>
      </section>

      {/* Metrics Strips */}
      <section className="buyer-metrics">
        <div className="buyer-metric-item">
          <div className="buyer-metric-icon-wrap metric-bg-blue">
            <BookOpen size={20} />
          </div>
          <div className="buyer-metric-info">
            <span className="buyer-metric-value">{ownedItems.length}</span>
            <span className="buyer-metric-label">Library Assets</span>
          </div>
        </div>

        <div className="buyer-metric-item">
          <div className="buyer-metric-icon-wrap metric-bg-green">
            <Clock3 size={20} />
          </div>
          <div className="buyer-metric-info">
            <span className="buyer-metric-value">16.5 hrs</span>
            <span className="buyer-metric-label">Access Time</span>
          </div>
        </div>

        <div className="buyer-metric-item">
          <div className="buyer-metric-icon-wrap metric-bg-amber">
            <CreditCard size={20} />
          </div>
          <div className="buyer-metric-info">
            <span className="buyer-metric-value">
              {ownedItems.filter(i => i.length === "Scheduled").length + 2}
            </span>
            <span className="buyer-metric-label">Active Orders</span>
          </div>
        </div>

        <div className="buyer-metric-item">
          <div className="buyer-metric-icon-wrap metric-bg-purple">
            <ShieldCheck size={20} />
          </div>
          <div className="buyer-metric-info">
            <span className="buyer-metric-value">Secure</span>
            <span className="buyer-metric-label">Entitlement Checked</span>
          </div>
        </div>
      </section>

      {/* Two Column Layout */}
      <div className="buyer-grid-layout">
        
        {/* Main Column */}
        <div className="buyer-main-column">
          
          {/* Tab Switcher */}
          <div className="dashboard-tabs-wrapper">
            <button
              className={`dashboard-tab-trigger ${activeTab === "services" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("services");
                setSearchQuery("");
              }}
              type="button"
            >
              <Zap size={16} />
              Explore Services
            </button>
            <button
              className={`dashboard-tab-trigger ${activeTab === "purchased" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("purchased");
                setSearchQuery("");
              }}
              type="button"
            >
              <FolderOpen size={16} />
              Purchased Services
            </button>
          </div>

          {activeTab === "services" ? (
            /* Section: Creator Services & Storefront */
            <section className="buyer-section-card">
              <div className="buyer-section-title-wrap">
                <h2 className="buyer-section-title">
                  <Zap size={20} style={{ color: "#f59e0b" }} />
                  Premium Services & Assets Offered by Creators
                </h2>
                <div className="search-box-buyer">
                  <Search size={14} className="search-icon-buyer" />
                  <input
                    type="text"
                    placeholder="Search all services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {filteredCreatorServices.length === 0 ? (
                <div className="empty-library-msg">
                  No services found matching "{searchQuery}".
                </div>
              ) : (
                <div className="services-marketplace-grid">
                  {filteredCreatorServices.map((service) => {
                    const isBooked = bookedServices.includes(service.id);
                    const isBooking = bookingServiceId === service.id;

                    return (
                      <div key={service.id} className="service-card-item">
                        <div className="service-creator-row">
                          <div className="service-creator-avatar">
                            {service.creatorInitials}
                          </div>
                          <span className="service-creator-name">{service.creatorName}</span>
                        </div>

                        <h3 className="service-title-text">{service.title}</h3>
                        <p className="service-desc-text">{service.description}</p>

                        <div className="service-pricing-row">
                          <span className="service-price-value">{service.price}</span>
                          
                          <button
                            className={`book-service-btn ${isBooked ? "service-booked-success" : ""}`}
                            disabled={isBooked || isBooking}
                            onClick={() => handleBookService(service)}
                            type="button"
                          >
                            {isBooking ? (
                              "Processing..."
                            ) : isBooked ? (
                              <>
                                <CheckCircle2 size={12} /> Access Granted
                              </>
                            ) : (
                              <>
                                <Plus size={12} /> Book Service
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ) : (
            /* Section: Buyer Library grouped by category */
            <section className="buyer-section-card">
              <div className="buyer-section-title-wrap">
                <h2 className="buyer-section-title">
                  <FolderOpen size={20} style={{ color: "#2563eb" }} />
                  Your Purchased Library
                </h2>
                <div className="search-box-buyer">
                  <Search size={14} className="search-icon-buyer" />
                  <input
                    type="text"
                    placeholder="Search your library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {filteredOwnedItems.length === 0 ? (
                <div className="empty-library-msg">
                  {searchQuery ? `No assets found matching "${searchQuery}".` : "No assets purchased yet. Browse services tab to expand your library!"}
                </div>
              ) : (
                <div className="categories-container">
                  {/* Category 1: Tutorials */}
                  <div className="category-section">
                    <h3 className="category-header">
                      <span className="category-icon">🎓</span>
                      <span>Tutorials & Replays</span>
                      <span className="category-count-badge">{tutorials.length}</span>
                    </h3>
                    {tutorials.length === 0 ? (
                      <p className="category-empty-text">No tutorials purchased</p>
                    ) : (
                      <div className="owned-assets-list">
                        {tutorials.map(renderAssetCard)}
                      </div>
                    )}
                  </div>

                  {/* Category 2: Documents */}
                  <div className="category-section">
                    <h3 className="category-header">
                      <span className="category-icon">📄</span>
                      <span>Documents & Field Notes</span>
                      <span className="category-count-badge">{documents.length}</span>
                    </h3>
                    {documents.length === 0 ? (
                      <p className="category-empty-text">No documents purchased</p>
                    ) : (
                      <div className="owned-assets-list">
                        {documents.map(renderAssetCard)}
                      </div>
                    )}
                  </div>

                  {/* Category 3: Other Sections / Services */}
                  <div className="category-section">
                    <h3 className="category-header">
                      <span className="category-icon">💼</span>
                      <span>Other Sections & Services</span>
                      <span className="category-count-badge">{others.length}</span>
                    </h3>
                    {others.length === 0 ? (
                      <p className="category-empty-text">No other services purchased</p>
                    ) : (
                      <div className="owned-assets-list">
                        {others.map(renderAssetCard)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="buyer-sidebar">
          
          {/* Active Status */}
          <section className="sidebar-glass-card">
            <h2 className="sidebar-title">Security & Account Status</h2>
            <div className="activity-feed-list">
              <div className="activity-feed-item">
                <span className="activity-bullet" style={{ backgroundColor: "#10b981" }} />
                <div>
                  <strong>Stripe Webhook Verified</strong>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
                    All access granted via signature-verified Stripe webhooks.
                  </p>
                </div>
              </div>
              <div className="activity-feed-item">
                <span className="activity-bullet" />
                <div>
                  <strong>Playback session active</strong>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
                    Secure tokens expire every 15 minutes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Creators Directory */}
          <section className="sidebar-glass-card">
            <h2 className="sidebar-title">Featured Verified Creators</h2>
            <div className="creators-directory-list">
              <div className="creator-directory-item">
                <div className="creator-details-box">
                  <div className="creator-large-avatar" style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)" }}>NR</div>
                  <div className="creator-name-meta">
                    <span className="creator-name-bold">Nadia Rahman</span>
                    <span className="creator-specialty">System Architecture</span>
                  </div>
                </div>
                <div className="creator-rating-star">
                  <Star size={11} fill="#f59e0b" stroke="none" /> 4.9
                </div>
              </div>

              <div className="creator-directory-item">
                <div className="creator-details-box">
                  <div className="creator-large-avatar" style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>ML</div>
                  <div className="creator-name-meta">
                    <span className="creator-name-bold">Mason Lee</span>
                    <span className="creator-specialty">NextJS & UI/UX</span>
                  </div>
                </div>
                <div className="creator-rating-star">
                  <Star size={11} fill="#f59e0b" stroke="none" /> 4.8
                </div>
              </div>

              <div className="creator-directory-item">
                <div className="creator-details-box">
                  <div className="creator-large-avatar" style={{ background: "linear-gradient(135deg, #db2777, #be185d)" }}>AC</div>
                  <div className="creator-name-meta">
                    <span className="creator-name-bold">Aria Chen</span>
                    <span className="creator-specialty">Cybersecurity & APIs</span>
                  </div>
                </div>
                <div className="creator-rating-star">
                  <Star size={11} fill="#f59e0b" stroke="none" /> 5.0
                </div>
              </div>
            </div>
          </section>

        </aside>

      </div>
    </main>
  );
}

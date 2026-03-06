import { Toaster } from "@/components/ui/sonner";
import { useSeedEntries } from "@/hooks/useSeedEntries";
import AddEntry from "@/pages/AddEntry";
import Dashboard from "@/pages/Dashboard";
import Entries from "@/pages/Entries";
import NotesHistory from "@/pages/NotesHistory";
import {
  FileText,
  LayoutDashboard,
  Menu,
  PlusCircle,
  TableProperties,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Tab = "dashboard" | "entries" | "add" | "notes";

const navItems: {
  id: Tab;
  label: string;
  icon: React.ElementType;
  shortLabel: string;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    shortLabel: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "entries",
    label: "All Entries",
    shortLabel: "Entries",
    icon: TableProperties,
  },
  {
    id: "add",
    label: "Add Entry",
    shortLabel: "Add",
    icon: PlusCircle,
  },
  {
    id: "notes",
    label: "Notes History",
    shortLabel: "Notes",
    icon: FileText,
  },
];

const pageTitles: Record<Tab, string> = {
  dashboard: "Pipeline Overview",
  entries: "Sales Entries",
  add: "Add New Entry",
  notes: "Notes History",
};

export default function App() {
  useSeedEntries();

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  function renderContent() {
    if (activeTab === "dashboard") return <Dashboard />;
    if (activeTab === "entries") return <Entries />;
    if (activeTab === "add") return <AddEntry />;
    if (activeTab === "notes") return <NotesHistory />;
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-white/90 backdrop-blur-sm sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display font-bold text-base text-foreground tracking-tight">
                  SalesPulse
                </span>
                <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
                  Weekly Report
                </span>
              </div>
            </div>

            {/* Desktop nav */}
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    data-ocid={`nav.${item.id}.link`}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border md:hidden"
            >
              <nav className="px-4 py-2 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      data-ocid={`nav.mobile.${item.id}.link`}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page heading */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>SalesPulse</span>
            <span>/</span>
            <span className="text-foreground capitalize">
              {navItems.find((n) => n.id === activeTab)?.label ?? activeTab}
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground heading-accent">
            {pageTitles[activeTab]}
          </h1>
        </div>

        {/* Page content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom mobile nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-40 flex"
        aria-label="Bottom navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.bottom.${item.id}.link`}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`}
              />
              {item.shortLabel}
            </button>
          );
        })}
      </nav>

      {/* Footer — extra bottom padding on mobile for the nav */}
      <footer className="border-t border-border bg-card/50 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              SalesPulse — Weekly Sales Report
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {currentYear}. Built with ♥ using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <Toaster position="top-right" theme="light" />
    </div>
  );
}

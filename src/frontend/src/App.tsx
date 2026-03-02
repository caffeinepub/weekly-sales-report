import { Toaster } from "@/components/ui/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRBAC } from "@/context/RBACContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import AddEntry from "@/pages/AddEntry";
import Dashboard from "@/pages/Dashboard";
import Entries from "@/pages/Entries";
import Login from "@/pages/Login";
import Settings from "@/pages/Settings";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Settings2,
  TableProperties,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type Tab = "dashboard" | "entries" | "add" | "settings";

export default function App() {
  const { identity, isInitializing, clear } = useInternetIdentity();
  const { registerUser, getMyPermissions, isAdmin } = useRBAC();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPrincipal = identity?.getPrincipal().toString() ?? "";

  // Register user on login
  useEffect(() => {
    if (currentPrincipal) {
      registerUser(currentPrincipal);
    }
  }, [currentPrincipal, registerUser]);

  const currentYear = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  // Loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Auth gate
  if (!identity) {
    return (
      <>
        <Login />
        <Toaster position="top-right" theme="light" />
      </>
    );
  }

  const myPermissions = getMyPermissions(currentPrincipal);
  const adminStatus = isAdmin(currentPrincipal);

  // Build nav items based on permissions
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
    ...(myPermissions.canAdd || adminStatus
      ? [
          {
            id: "add" as Tab,
            label: "Add Entry",
            shortLabel: "Add",
            icon: PlusCircle,
          },
        ]
      : []),
    ...(adminStatus
      ? [
          {
            id: "settings" as Tab,
            label: "Settings",
            shortLabel: "Settings",
            icon: Settings2,
          },
        ]
      : []),
  ];

  // Avatar initials from principal
  const avatarInitials = currentPrincipal.slice(0, 2).toUpperCase();

  function handleLogout() {
    queryClient.clear();
    clear();
    setActiveTab("dashboard");
  }

  // Access denied screen for non-read users
  const isReadRestricted = !myPermissions.canRead && !adminStatus;

  function renderContent() {
    if (activeTab === "settings") {
      return <Settings />;
    }
    if (
      isReadRestricted &&
      (activeTab === "dashboard" || activeTab === "entries")
    ) {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
          <div className="text-center space-y-1">
            <h2 className="font-display font-bold text-lg text-foreground">
              Access Restricted
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              You don't have permission to view this content. Please contact
              your admin to request access.
            </p>
          </div>
        </div>
      );
    }
    if (activeTab === "dashboard") return <Dashboard />;
    if (activeTab === "entries") {
      return (
        <Entries
          canEdit={myPermissions.canWrite || adminStatus}
          canDelete={myPermissions.canDelete || adminStatus}
        />
      );
    }
    if (activeTab === "add") return <AddEntry />;
    return null;
  }

  const pageTitles: Record<Tab, string> = {
    dashboard: "Pipeline Overview",
    entries: "Sales Entries",
    add: "Add New Entry",
    settings: "Access Settings",
  };

  return (
    <TooltipProvider>
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

              {/* Right side: user info + logout */}
              <div className="flex items-center gap-2">
                {/* User avatar */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="hidden md:flex items-center gap-2 cursor-default">
                      <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center border border-primary/20">
                        <span className="text-xs font-bold text-primary leading-none">
                          {avatarInitials}
                        </span>
                      </div>
                      {adminStatus && (
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                          Admin
                        </span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs font-mono bg-popover border-border break-all">
                    {currentPrincipal}
                  </TooltipContent>
                </Tooltip>

                {/* Logout button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      aria-label="Sign out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Sign out</TooltipContent>
                </Tooltip>

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
                  {/* Mobile user info + logout */}
                  <div className="border-t border-border pt-2 mt-1 space-y-1">
                    <div className="flex items-center gap-2.5 px-3 py-2">
                      <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center border border-primary/20 flex-shrink-0">
                        <span className="text-xs font-bold text-primary leading-none">
                          {avatarInitials}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono truncate">
                        {currentPrincipal.slice(0, 12)}…
                      </span>
                      {adminStatus && (
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20 flex-shrink-0">
                          Admin
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
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
    </TooltipProvider>
  );
}

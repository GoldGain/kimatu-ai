"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronRight,
  Menu,
  Moon,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/chat": "Chat",
  "/code": "Code",
  "/projects": "Projects",
  "/plugins": "Plugins",
  "/settings": "Settings",
  "/admin": "Admin",
};

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const base = "/" + (pathname.split("/")[1] || "dashboard");
  const title = titles[base] || "Workspace";

  function onSearchClick() {
    const q = window.prompt("Search chats or go to a page (chat, code, projects, plugins, settings):");
    if (!q) return;
    const value = q.trim().toLowerCase();
    const routes = ["dashboard", "chat", "code", "projects", "plugins", "settings", "admin"];
    if (routes.includes(value)) {
      router.push(`/${value}`);
      return;
    }
    router.push(`/chat?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/[0.07] bg-[#0b0c0f]/85 px-3 backdrop-blur-xl md:px-5">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
        <Link href="/" className="hidden items-center gap-2 text-zinc-400 hover:text-white sm:flex">
          <Sparkles className="h-3.5 w-3.5 text-teal-300" />
          Kimatu
        </Link>
        <ChevronRight className="hidden h-3.5 w-3.5 text-zinc-600 sm:block" />
        <span className="truncate font-medium text-white">{title}</span>
      </div>

      <div className="hidden max-w-md flex-1 items-center md:flex">
        <button
          type="button"
          onClick={onSearchClick}
          className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-zinc-500 transition hover:bg-white/[0.05]"
        >
          <Search className="h-4 w-4" />
          <span>Search chats, projects, plugins…</span>
          <kbd className="ml-auto rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-500">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" aria-label="Theme">
          <Moon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <div
          className={cn(
            "ml-1 flex h-8 w-8 items-center justify-center rounded-full",
            "bg-gradient-to-br from-teal-400 to-indigo-500 text-xs font-semibold text-white"
          )}
        >
          K
        </div>
      </div>
    </header>
  );
}

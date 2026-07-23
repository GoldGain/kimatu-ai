"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const open = useAppStore((s) => s.sidebarOpen);

  return (
    <div className="kimatu-grid-bg flex min-h-screen text-zinc-100">
      <Sidebar />
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          "pb-16 md:pb-0"
        )}
      >
        <Topbar />
        <main className="mx-auto w-full max-w-[1600px] flex-1 overflow-auto p-3 md:p-5">
          {children}
        </main>
      </div>
      <MobileNav />
      {/* keep open state used for layout spacing on desktop via sidebar width */}
      <span className="hidden">{open ? "open" : "closed"}</span>
    </div>
  );
}

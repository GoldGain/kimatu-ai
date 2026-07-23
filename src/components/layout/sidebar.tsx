"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Code2,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Puzzle,
  Settings,
  Shield,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";

const primary = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/code", label: "Code", icon: Code2 },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/plugins", label: "Plugins", icon: Puzzle },
];

const secondary = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const open = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);

  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
  }) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        onClick={() => {
          // close drawer on mobile
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            setSidebarOpen(false);
          }
        }}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
          active
            ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
            : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            active ? "text-teal-300" : "text-zinc-500 group-hover:text-zinc-300"
          )}
        />
        <span className={cn("truncate", !open && "md:hidden")}>{label}</span>
        {open && active && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-teal-300" />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-white/[0.07] bg-[#0e1016] transition-all md:static md:z-0",
          open ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full md:w-[76px] md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-300 via-cyan-400 to-indigo-500 shadow-lg shadow-teal-500/20">
              <Sparkles className="h-5 w-5 text-[#0b0c0f]" />
            </div>
            {open && (
              <div>
                <div className="text-sm font-semibold tracking-tight text-white">
                  Kimatu AI
                </div>
                <div className="text-[11px] text-zinc-500">Agent workspace</div>
              </div>
            )}
          </div>
          <button
            className="rounded-lg p-1 text-zinc-500 hover:bg-white/5 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3">
          <Link href="/chat">
            <Button className={cn("w-full gap-2 rounded-xl bg-white text-[#0b0c0f] hover:bg-zinc-100", open ? "justify-start" : "justify-center px-0") }>
              <Plus className="h-4 w-4" />
              {open && "New chat"}
            </Button>
          </Link>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          <div className="space-y-1">
            {open && (
              <div className="px-3 pb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-600">
                Workspace
              </div>
            )}
            {primary.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
          <div className="space-y-1">
            {open && (
              <div className="px-3 pb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-600">
                System
              </div>
            )}
            {secondary.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        </nav>

        <div className="border-t border-white/[0.07] p-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400/10">
              <Bot className="h-4 w-4 text-teal-300" />
            </div>
            {open && (
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-zinc-100">
                  DeepSeek · live
                </div>
                <div className="truncate text-[11px] text-zinc-500">
                  Multi-agent orchestration
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Code2,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Puzzle,
  Settings,
  Shield,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/code", label: "Code Workspace", icon: Code2 },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/plugins", label: "Plugins", icon: Puzzle },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const open = useAppStore((s) => s.sidebarOpen);

  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 flex-col border-r border-white/10 bg-[#070b14]/90 backdrop-blur-xl transition-all md:flex",
        open ? "w-64" : "w-[76px]"
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        {open && (
          <div>
            <div className="text-sm font-semibold tracking-wide text-white">
              Kimatu AI
            </div>
            <div className="text-xs text-zinc-500">Autonomous workspace</div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                active
                  ? "bg-cyan-500/15 text-cyan-100 ring-1 ring-cyan-400/20"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {open && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <Bot className="h-4 w-4 text-cyan-300" />
          {open && (
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-zinc-200">
                DeepSeek engine
              </div>
              <div className="truncate text-[11px] text-zinc-500">
                Multi-agent ready
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

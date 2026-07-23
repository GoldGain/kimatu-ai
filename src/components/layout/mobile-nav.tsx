"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Code2,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Puzzle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/code", label: "Code", icon: Code2 },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/plugins", label: "Plugins", icon: Puzzle },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0b0c0f]/95 px-2 py-2 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px]",
                active ? "text-teal-200" : "text-zinc-500"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-teal-300")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

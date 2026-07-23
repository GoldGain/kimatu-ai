"use client";

import { create } from "zustand";
import type { AgentName, Conversation } from "@/types";

type AppState = {
  sidebarOpen: boolean;
  selectedAgent: AgentName | "auto";
  activeConversationId: string | null;
  conversations: Conversation[];
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSelectedAgent: (agent: AgentName | "auto") => void;
  setActiveConversationId: (id: string | null) => void;
  setConversations: (items: Conversation[]) => void;
};

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  selectedAgent: "auto",
  activeConversationId: null,
  conversations: [],
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSelectedAgent: (selectedAgent) => set({ selectedAgent }),
  setActiveConversationId: (activeConversationId) => set({ activeConversationId }),
  setConversations: (conversations) => set({ conversations }),
}));

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Check,
  Code2,
  Layers,
  MessageSquare,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Workflow,
  Zap,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Workflow,
    title: "Multi-agent orchestration",
    body: "Planner, Coding, Research, Testing, and Deployment agents collaborate on complex goals.",
  },
  {
    icon: Code2,
    title: "Code workspace",
    body: "Project files, editor-ready structure, and deploy-oriented workflows in one place.",
  },
  {
    icon: Layers,
    title: "Memory + RAG ready",
    body: "Short-term session memory with hooks for pgvector long-term retrieval.",
  },
  {
    icon: Rocket,
    title: "Connectors",
    body: "GitHub, Supabase, Vercel, filesystem, and PDF plugins with secure env configuration.",
  },
  {
    icon: MessageSquare,
    title: "Streaming chat",
    body: "DeepSeek-compatible chat API with agent routing, plans, and markdown responses.",
  },
  {
    icon: Shield,
    title: "Production security",
    body: "Env-only secrets, RLS-ready SQL, and no hardcoded API keys in source.",
  },
];

const steps = [
  { n: "01", title: "Describe the goal", body: "Tell Kimatu what to plan, build, research, test, or deploy." },
  { n: "02", title: "Agents take over", body: "The orchestrator routes work to specialist agents with a clear plan." },
  { n: "03", title: "Ship with connectors", body: "Use code workspace, plugins, and deploy checklists to finish the job." },
];

const pricing = [
  {
    name: "Starter",
    price: "Free",
    detail: "Bootstrap workspace",
    perks: ["Chat workspace", "5 specialist agents", "Agent routing + plans", "Project scaffold"],
  },
  {
    name: "Pro",
    price: "$29",
    detail: "per seat / month",
    highlight: true,
    perks: ["DeepSeek live engine", "Supabase persistence", "Connectors marketplace", "Priority agent runs"],
  },
  {
    name: "Team",
    price: "$99",
    detail: "per workspace / month",
    perks: ["Admin analytics", "Shared projects", "Usage controls", "SSO-ready path"],
  },
];

const testimonials = [
  {
    quote: "Feels like Cursor and a research desk in one shell. The agent routing alone saves hours.",
    name: "Amina K.",
    role: "Founding engineer",
  },
  {
    quote: "We used the scaffold to stand up an internal AI workspace in a weekend.",
    name: "Daniel O.",
    role: "Product lead",
  },
  {
    quote: "Clean dark UI, real API routes, and SQL migrations — not just a chatbot mock.",
    name: "Grace N.",
    role: "Builder",
  },
];

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="kimatu-grid-bg min-h-screen text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0b0c0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-300 to-indigo-500">
              <Sparkles className="h-5 w-5 text-[#0b0c0f]" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Kimatu AI</span>
          </div>

          <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <Link href="/chat" className="hover:text-white">Workspace</Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white">
              Log in
            </Link>
            <Link href="/chat">
              <Button size="sm" className="rounded-full px-4">Open app</Button>
            </Link>
          </div>

          <button
            className="rounded-xl border border-white/10 p-2 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-white/10 px-5 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm text-zinc-300">
              <a href="#features">Features</a>
              <a href="#how">How it works</a>
              <a href="#pricing">Pricing</a>
              <Link href="/chat">Workspace</Link>
              <Link href="/login">Log in</Link>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <Badge className="mb-4 border-teal-300/20 bg-teal-400/10 text-teal-100">
            DeepSeek-powered autonomous workspace
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-[1.05]">
            Build, research, and ship with an AI agent team
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-zinc-400 md:text-lg">
            Kimatu AI combines conversational intelligence with coding, planning,
            testing, and deployment specialists — a serious workspace, not a toy chatbot.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/chat">
              <Button size="lg" className="rounded-full px-6">
                Launch workspace <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="rounded-full px-6">
                Open dashboard
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-teal-300" /> Live DeepSeek</span>
            <span className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-teal-300" /> Supabase production DB</span>
            <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-teal-300" /> Premium dark UI</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.55 }}
          className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#12141a] p-2 shadow-2xl shadow-black/50"
        >
          <div className="rounded-[22px] border border-white/[0.06] bg-[#0e1016] p-5 md:p-8">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Bot className="h-3.5 w-3.5 text-teal-300" />
                Kimatu chat preview
              </div>
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              </div>
            </div>
            <div className="space-y-3 text-left text-sm">
              <div className="ml-auto max-w-md rounded-3xl bg-gradient-to-br from-teal-300 to-indigo-400 px-4 py-3 text-[#071018]">
                Plan a secure Next.js AI SaaS MVP with Supabase auth.
              </div>
              <div className="max-w-xl rounded-3xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-zinc-300">
                <div className="mb-2 text-xs text-teal-300">Planner agent</div>
                Breaking this into auth, chat API, agent routing, billing hooks, and deploy checklist…
              </div>
              <div className="max-w-xl rounded-3xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-zinc-300">
                <div className="mb-2 text-xs text-teal-300">Coding agent</div>
                Scaffolding App Router routes, Zod-validated APIs, and a DeepSeek client wrapper with streaming support.
              </div>
            </div>
          </div>
        </motion.div>

        <section id="features" className="mt-24">
          <div className="mb-8 text-center">
            <Badge className="mb-3">Features</Badge>
            <h2 className="text-3xl font-semibold text-white">Everything an agent platform needs</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 transition hover:border-teal-300/20">
                <f.icon className="mb-3 h-5 w-5 text-teal-300" />
                <h3 className="text-lg font-medium text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="mt-24">
          <div className="mb-8 text-center">
            <Badge className="mb-3">How it works</Badge>
            <h2 className="text-3xl font-semibold text-white">From prompt to shipped work</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-6">
                <div className="text-sm font-semibold text-teal-300">{s.n}</div>
                <h3 className="mt-2 text-lg font-medium text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mt-24">
          <div className="mb-8 text-center">
            <Badge className="mb-3">Pricing</Badge>
            <h2 className="text-3xl font-semibold text-white">Simple plans for builders</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {pricing.map((p) => (
              <div
                key={p.name}
                className={`rounded-3xl border p-6 ${
                  p.highlight
                    ? "border-teal-300/40 bg-teal-400/10 shadow-lg shadow-teal-950/30"
                    : "border-white/[0.08] bg-white/[0.03]"
                }`}
              >
                <div className="text-sm text-zinc-400">{p.name}</div>
                <div className="mt-2 text-3xl font-semibold text-white">{p.price}</div>
                <div className="text-xs text-zinc-500">{p.detail}</div>
                <ul className="mt-5 space-y-2">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="h-4 w-4 text-teal-300" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-6 block">
                  <Button className="w-full rounded-full" variant={p.highlight ? "default" : "secondary"}>
                    Choose {p.name}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <div className="mb-8 text-center">
            <Badge className="mb-3">Testimonials</Badge>
            <h2 className="text-3xl font-semibold text-white">Built for serious product work</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
                <p className="text-sm leading-relaxed text-zinc-300">“{t.quote}”</p>
                <div className="mt-4 text-sm font-medium text-white">{t.name}</div>
                <div className="text-xs text-zinc-500">{t.role}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 rounded-[32px] border border-white/[0.08] bg-gradient-to-r from-teal-400/10 to-indigo-500/10 p-8 md:p-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-teal-200">
                <Shield className="h-4 w-4" />
                Production-ready stack
              </div>
              <h2 className="text-2xl font-semibold text-white md:text-3xl">
                Not a demo. Live DeepSeek + Supabase.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-zinc-400">
                Typed Next.js app, multi-agent chat, connectors, SQL migrations, and secure env-only secrets.
              </p>
            </div>
            <Link href="/chat">
              <Button size="lg" className="rounded-full px-6">
                Start building <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} Kimatu AI · Built for autonomous work
      </footer>
    </div>
  );
}

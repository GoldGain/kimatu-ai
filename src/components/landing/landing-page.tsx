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
} from "lucide-react";
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
  {
    n: "01",
    title: "Describe the goal",
    body: "Tell Kimatu what to plan, build, research, test, or deploy.",
  },
  {
    n: "02",
    title: "Agents take over",
    body: "The orchestrator routes work to specialist agents with a clear plan.",
  },
  {
    n: "03",
    title: "Ship with connectors",
    body: "Use code workspace, plugins, and deploy checklists to finish the job.",
  },
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
    perks: [
      "DeepSeek live engine",
      "Supabase persistence",
      "Connectors marketplace",
      "Priority agent runs",
    ],
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
    quote:
      "Feels like Cursor and a research desk in one shell. The agent routing alone saves hours.",
    name: "Amina K.",
    role: "Founding engineer",
  },
  {
    quote:
      "We used the scaffold to stand up an internal AI workspace in a weekend.",
    name: "Daniel O.",
    role: "Product lead",
  },
  {
    quote:
      "Clean dark UI, real API routes, and SQL migrations — not just a chatbot mock.",
    name: "Grace N.",
    role: "Builder",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05070d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-[-10%] h-[420px] w-[420px] rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Kimatu AI</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#how" className="hover:text-white">
            How it works
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-white">
            Log in
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pb-24 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <Badge className="mb-4">DeepSeek-powered autonomous workspace</Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Build, research, and ship with an AI agent team
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-zinc-400 md:text-lg">
            Kimatu AI combines conversational intelligence with coding,
            planning, testing, and deployment specialists — closer to Cursor +
            Manus than a plain chatbot.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button size="lg">
                Open dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/chat">
              <Button size="lg" variant="secondary">
                Try chat workspace
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-cyan-300" /> Fast agent routing
            </span>
            <span className="inline-flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-cyan-300" /> Secrets in env only
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-cyan-300" /> Premium dark UI
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.55 }}
          className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-2 shadow-2xl shadow-cyan-950/40"
        >
          <div className="rounded-[1.25rem] border border-white/10 bg-[#0a1020] p-5 md:p-8">
            <div className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
              <Bot className="h-3.5 w-3.5 text-cyan-300" />
              Live agent preview
            </div>
            <div className="space-y-3 text-left text-sm">
              <div className="ml-auto max-w-md rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 px-4 py-3">
                Plan a secure Next.js AI SaaS MVP with Supabase auth.
              </div>
              <div className="max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-zinc-300">
                <div className="mb-2 text-xs text-cyan-300">Planner agent</div>
                Breaking this into auth, chat API, agent routing, billing hooks,
                and deploy checklist…
              </div>
              <div className="max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-zinc-300">
                <div className="mb-2 text-xs text-cyan-300">Coding agent</div>
                Scaffolding App Router routes, Zod-validated APIs, and a
                DeepSeek client wrapper with streaming support.
              </div>
            </div>
          </div>
        </motion.div>

        <section id="features" className="mt-20">
          <div className="mb-8 text-center">
            <Badge className="mb-3">Features</Badge>
            <h2 className="text-3xl font-semibold text-white">
              Everything an agent platform needs
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition hover:border-cyan-400/20"
              >
                <f.icon className="mb-3 h-5 w-5 text-cyan-300" />
                <h3 className="text-lg font-medium text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="mt-20">
          <div className="mb-8 text-center">
            <Badge className="mb-3">How it works</Badge>
            <h2 className="text-3xl font-semibold text-white">
              From prompt to shipped work
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6"
              >
                <div className="text-sm font-semibold text-cyan-300">{s.n}</div>
                <h3 className="mt-2 text-lg font-medium text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mt-20">
          <div className="mb-8 text-center">
            <Badge className="mb-3">Pricing</Badge>
            <h2 className="text-3xl font-semibold text-white">
              Simple plans for builders
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              UI pricing cards — connect billing when you go multi-tenant.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {pricing.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl border p-6 ${
                  p.highlight
                    ? "border-cyan-400/40 bg-cyan-500/10 shadow-lg shadow-cyan-950/40"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="text-sm text-zinc-400">{p.name}</div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {p.price}
                </div>
                <div className="text-xs text-zinc-500">{p.detail}</div>
                <ul className="mt-5 space-y-2">
                  {p.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-center gap-2 text-sm text-zinc-300"
                    >
                      <Check className="h-4 w-4 text-cyan-300" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-6 block">
                  <Button
                    className="w-full"
                    variant={p.highlight ? "default" : "secondary"}
                  >
                    Choose {p.name}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-8 text-center">
            <Badge className="mb-3">Testimonials</Badge>
            <h2 className="text-3xl font-semibold text-white">
              Built for serious product work
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <p className="text-sm leading-relaxed text-zinc-300">
                  “{t.quote}”
                </p>
                <div className="mt-4 text-sm font-medium text-white">{t.name}</div>
                <div className="text-xs text-zinc-500">{t.role}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 p-8 md:p-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-cyan-200">
                <Shield className="h-4 w-4" />
                Secrets stay in env vars
              </div>
              <h2 className="text-2xl font-semibold text-white md:text-3xl">
                Production scaffold, not a toy demo
              </h2>
              <p className="mt-2 max-w-xl text-sm text-zinc-400">
                Typed Next.js app, live DeepSeek inference, Supabase persistence,
                connectors, and secure env-only secrets.
              </p>
            </div>
            <Link href="/signup">
              <Button size="lg">
                Start building <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} Kimatu AI · Built for autonomous work
      </footer>
    </div>
  );
}

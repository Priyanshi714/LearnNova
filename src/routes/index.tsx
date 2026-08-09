import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Sparkles,
  ArrowRight,
  Layers,
  GitBranch,
  BookMarked,
  RefreshCw,
  LineChart,
  Code2,
  Github,
  Check,
  Menu,
  X,
} from "lucide-react";
import { AnimatedCounter } from "@/components/design-system";
import { cn } from "@/lib/utils";

import leetcodeIcon from "../assets/leetcode.svg";
import geeksforgeeksIcon from "../assets/geeksforgeeks.svg";
import codechefIcon from "../assets/codechef.svg";
import codeforcesIcon from "../assets/codeforces.svg";
import hackerrankIcon from "../assets/hackerrank.svg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LearnNova — Master patterns, not just problems" },
      {
        name: "description",
        content:
          "Your personal code journal for DSA tracking and revision. Organize problems from LeetCode, GFG, Codeforces and more.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how" },
    { name: "Get Started", href: "#cta" },
  ];

  return (
    <div className="min-h-screen w-screen overflow-x-hidden relative bg-[#09090b] text-foreground font-display">
      {/* Background glow layers container (perfectly clipped to page boundaries) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Top-left shape */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 transform-gpu overflow-hidden blur-3xl sm:-top-80 min-h-screen"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              background: "linear-gradient(to top right, oklch(0.7 0.15 280), oklch(0.6 0.2 320))",
            }}
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] min-h-screen"
          />
        </div>

        {/* Bottom-right shape */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)] min-h-screen"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              background: "linear-gradient(to top right, oklch(0.7 0.15 280), oklch(0.6 0.2 320))",
            }}
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] min-h-screen"
          />
        </div>
      </div>

      {/* Header / Navbar positioning */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          aria-label="Global"
          className="flex items-center justify-between px-6 sm:px-12 w-full max-w-7xl mx-auto h-24"
        >
          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link to="/" className="flex items-center gap-2 group -m-1.5 p-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow shadow-ds-glow group-hover:scale-105 transition duration-300">
                <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <span className="font-extrabold tracking-tight text-white text-lg group-hover:text-primary-glow transition duration-300">
                LearnNova
              </span>
            </Link>
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <span className="sr-only">Open main menu</span>
              <Menu aria-hidden="true" className="size-6" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex lg:gap-x-10">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Desktop Right Side CTA - Plain Sign in Link with arrow */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link
              to="/login"
              className="text-sm font-semibold text-neutral-300 hover:text-white transition-colors flex items-center gap-x-1.5"
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>

        {/* Mobile menu Drawer */}
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogContent className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[#030209]/95 backdrop-blur-xl px-4 py-4 sm:px-6 sm:py-6 sm:max-w-sm sm:ring-1 sm:ring-border lg:hidden">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center gap-2 group -m-1.5 p-1.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow shadow-ds-glow">
                  <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                <span className="font-extrabold tracking-tight text-white text-lg">LearnNova</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <span className="sr-only">Close menu</span>
                <X aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-2 flow-root">
              <div className="-my-6 divide-y divide-border">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6 space-y-4">
                  <Link
                    to="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/home"
                    className="block text-center rounded-lg bg-primary px-3 py-2.5 text-base/7 font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get started
                  </Link>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Hero section matching HeroLanding layout, vertical positioning, and alignment */}
      <div className="relative isolate px-6 pt-40 sm:pt-48 pb-20 sm:pb-32 overflow-hidden flex flex-col items-center">
        <div className="mx-auto max-w-5xl">
          {/* Announcement pill matching reference screenshot colors & style */}
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-4 py-1.5 text-xs sm:text-sm text-neutral-300 ring-1 ring-white/10 bg-white/[0.03] hover:ring-white/20 transition-all inline-flex items-center gap-x-2">
              <span>🚀 Your DSA second brain — now in private beta</span>
              <Link
                to="/home"
                className="text-white font-semibold hover:text-neutral-200 flex items-center gap-x-1"
              >
                Learn more <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold tracking-tight text-white leading-[1.08]">
              Your personal{" "}
              <span className="inline-block bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                code journal
              </span>
              <br />
              for DSA tracking & revision.
            </h1>
            <p className="mt-8 text-base sm:text-lg md:text-xl text-neutral-400 leading-[1.6] max-w-3xl mx-auto font-medium">
              Solve anywhere. Organize, journal, and revise inside LearnNova.{" "}
              <span className="text-white font-semibold">Master patterns, not just problems.</span>
            </p>

            {/* Call to action buttons matching size, shape (rounded-lg) and layout */}
            <div className="mt-10 flex items-center justify-center gap-x-8">
              <Link
                to="/home"
                className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm hover:bg-neutral-200 transition-colors"
              >
                Get started
              </Link>
              <Link
                to="/login"
                className="text-sm font-semibold text-white hover:text-neutral-300 transition-colors flex items-center gap-x-1.5"
              >
                Log in <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sections below hero section restyled to use the same design language */}

      {/* 1. Dashboard Mockup Section */}
      <section className="relative px-6 py-12 sm:py-16 -mt-20 sm:-mt-24 max-w-4xl mx-auto">
        <div className="relative w-full z-20">
          {/* Ambient Glow backing */}
          <div className="absolute -inset-x-6 -top-10 bottom-10 -z-10 rounded-[3rem] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl opacity-80 pointer-events-none" />

          {/* Browser Chrome Container */}
          <div className="glass-premium overflow-hidden rounded-2xl shadow-2xl border border-white/5 backdrop-blur-xl animate-float">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-white/5 bg-black/40 px-4 py-3">
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="rounded bg-white/5 px-4 py-0.5 text-[10px] text-muted-foreground/60 font-mono tracking-wide select-none">
                learnnova.app / dashboard
              </div>
              <div className="w-12" /> {/* spacer */}
            </div>

            {/* Dashboard Mock Grid Content */}
            <div className="grid gap-6 p-6 md:grid-cols-3 text-left">
              {[
                {
                  label: "Problems Solved",
                  value: 248,
                  suffix: " solved",
                  desc: "+12 this week",
                  color: "text-primary-glow",
                },
                {
                  label: "Topics Covered",
                  value: 14,
                  suffix: " / 17",
                  desc: "Patterns mapped",
                  color: "text-primary-glow",
                },
                {
                  label: "Streak Count",
                  value: 23,
                  suffix: " days",
                  prefix: "🔥 ",
                  desc: "Personal best",
                  color: "text-orange-400",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-5 shadow-inner"
                >
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    {item.label}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    {item.prefix && <span className="text-2xl font-bold">{item.prefix}</span>}
                    <span className="text-3xl font-black text-white tracking-tight">
                      <AnimatedCounter value={item.value} duration={1200} />
                    </span>
                    <span className="text-sm font-bold text-neutral-400">{item.suffix}</span>
                  </div>
                  <div
                    className={cn("text-[10px] font-bold mt-2 uppercase tracking-wide", item.color)}
                  >
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem Stat Section */}
      <section className="relative py-20 sm:py-24 max-w-4xl mx-auto px-6">
        {/* Glow backing */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 to-transparent blur-3xl rounded-full opacity-60" />

        <div className="text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            The Problem
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-white">
            Your DSA work is scattered across six tabs.
          </h2>
          <p className="mx-auto max-w-2xl text-neutral-400 leading-relaxed text-sm sm:text-base pt-2">
            You solve on LeetCode, GFG, your college portal, CodeChef, Codeforces, HackerRank — and
            forget the patterns by next week. LearnNova centralizes everything into a single,
            searchable, revisable second brain.
          </p>
          <div className="pt-12 pb-8 flex flex-wrap items-center justify-center gap-x-8 md:gap-x-12 gap-y-12 px-4 max-w-5xl mx-auto">
            {[
              {
                name: "LeetCode",
                animateClass: "animate-float-node-1",
                glowColor: "group-hover:shadow-[0_0_25px_rgba(255,161,22,0.25)]",
                glowBg: "from-[#FFA116]/[0.08] to-transparent",
                borderColor: "border-[#FFA116]/15 group-hover:border-[#FFA116]/40",
                particleBg: "bg-[#FFA116] shadow-[0_0_8px_#FFA116]",
                icon: <img src={leetcodeIcon} className="w-8 h-8 object-contain" alt="LeetCode" />,
              },
              {
                name: "GeeksforGeeks",
                animateClass: "animate-float-node-2",
                glowColor: "group-hover:shadow-[0_0_25px_rgba(47,141,70,0.25)]",
                glowBg: "from-[#2F8D46]/[0.08] to-transparent",
                borderColor: "border-[#2F8D46]/15 group-hover:border-[#2F8D46]/40",
                particleBg: "bg-[#2F8D46] shadow-[0_0_8px_#2F8D46]",
                icon: (
                  <img
                    src={geeksforgeeksIcon}
                    className="w-8 h-8 object-contain"
                    alt="GeeksforGeeks"
                  />
                ),
              },
              {
                name: "College Portal",
                animateClass: "animate-float-node-3",
                glowColor: "group-hover:shadow-[0_0_25px_rgba(129,140,248,0.25)]",
                glowBg: "from-[#818CF8]/[0.08] to-transparent",
                borderColor: "border-[#818CF8]/15 group-hover:border-[#818CF8]/40",
                particleBg: "bg-[#818CF8] shadow-[0_0_8px_#818CF8]",
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    className="w-8 h-8 text-[#818CF8]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M3 22h18" />
                    <path d="M5 12v7M9 12v7M15 12v7M19 12v7" />
                    <path d="M3 12h18" />
                    <path d="M12 2L2 9h20z" />
                  </svg>
                ),
              },
              {
                name: "CodeChef",
                animateClass: "animate-float-node-4",
                glowColor: "group-hover:shadow-[0_0_25px_rgba(91,70,54,0.25)]",
                glowBg: "from-[#5B4636]/[0.08] to-transparent",
                borderColor: "border-[#5B4636]/15 group-hover:border-[#5B4636]/40",
                particleBg: "bg-[#5B4636] shadow-[0_0_8px_#5B4636]",
                icon: <img src={codechefIcon} className="w-8 h-8 object-contain" alt="CodeChef" />,
              },
              {
                name: "Codeforces",
                animateClass: "animate-float-node-5",
                glowColor: "group-hover:shadow-[0_0_25px_rgba(31,138,203,0.25)]",
                glowBg: "from-[#1F8ACB]/[0.08] to-transparent",
                borderColor: "border-[#1F8ACB]/15 group-hover:border-[#1F8ACB]/40",
                particleBg: "bg-[#1F8ACB] shadow-[0_0_8px_#1F8ACB]",
                icon: (
                  <img src={codeforcesIcon} className="w-8 h-8 object-contain" alt="Codeforces" />
                ),
              },
              {
                name: "HackerRank",
                animateClass: "animate-float-node-6",
                glowColor: "group-hover:shadow-[0_0_25px_rgba(0,234,100,0.25)]",
                glowBg: "from-[#00EA64]/[0.08] to-transparent",
                borderColor: "border-[#00EA64]/15 group-hover:border-[#00EA64]/40",
                particleBg: "bg-[#00EA64] shadow-[0_0_8px_#00EA64]",
                icon: (
                  <img src={hackerrankIcon} className="w-8 h-8 object-contain" alt="HackerRank" />
                ),
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className={cn(
                  "group relative flex flex-col items-center justify-center transition-all duration-300",
                  p.animateClass,
                )}
              >
                {/* Orbit Accent Ring (dotted spinner spinning very slowly) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[92px] h-[92px] rounded-full border border-dashed border-primary/20 animate-slow-spin pointer-events-none group-hover:border-primary/50 transition duration-300">
                  {/* Rotating connector particle dot sitting directly on the spin ring */}
                  <div
                    className={cn(
                      "absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full",
                      p.particleBg,
                    )}
                  />
                </div>

                {/* Glowing Aura backdrop */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-primary/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Circular Glassmorphism Logo Node */}
                <div
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center border bg-gradient-to-br shadow-lg shadow-black/40 transition-all duration-300 group-hover:scale-110",
                    p.borderColor,
                    p.glowBg,
                    p.glowColor,
                  )}
                >
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    {p.icon}
                  </div>
                </div>

                {/* Permanently visible platform text label */}
                <span className="mt-4 text-xs font-semibold text-neutral-400 tracking-wide select-none group-hover:text-white transition-colors duration-300">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section id="features" className="relative py-20 sm:py-24 max-w-4xl mx-auto px-6">
        <div className="text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Features</p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-white">
            Built for serious learners.
          </h2>
        </div>
        <div className="mt-12 sm:mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Layers,
              title: "Multi-Platform Tracking",
              desc: "LeetCode, GFG, Codeforces, college portals — one unified inbox.",
            },
            {
              icon: GitBranch,
              title: "Pattern-Based Learning",
              desc: "Group problems by primary and secondary topics. Master templates.",
            },
            {
              icon: Code2,
              title: "Multiple Solutions",
              desc: "Store multiple approaches per problem (brute-force, optimal, alt languages).",
            },
            {
              icon: BookMarked,
              title: "Personal Journal",
              desc: "Record key logic takeaways, corner cases, and common bugs.",
            },
            {
              icon: RefreshCw,
              title: "Revision System",
              desc: "Review queue with spaced repetition algorithms to keep knowledge fresh.",
            },
            {
              icon: LineChart,
              title: "Analytics Dashboard",
              desc: "Streaks, topic distribution, revision velocity — inspect your stats.",
            },
          ].map((feat, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-6 shadow-sm transition-all hover:border-white/10 duration-300"
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 opacity-0 blur-2xl transition group-hover:opacity-100" />
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                <feat.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-white text-sm sm:text-base tracking-tight">
                {feat.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. How It Works Timeline */}
      <section id="how" className="relative py-20 sm:py-24 max-w-4xl mx-auto px-6">
        <div className="text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-white">
            The flow that makes patterns stick.
          </h2>
        </div>
        <ol className="mt-12 sm:mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              step: 1,
              title: "Solve Problems Anywhere",
              desc: "Solve questions on any coding portal as usual.",
            },
            {
              step: 2,
              title: "Add to LearnNova Journal",
              desc: "Create a reference card and log your notes.",
            },
            {
              step: 3,
              title: "Store Multiple Implementations",
              desc: "Record optimal logic templates and languages.",
            },
            {
              step: 4,
              title: "Record mistakes & journal",
              desc: "List edge cases, performance bugs, and lessons.",
            },
            {
              step: 5,
              title: "Automated Revision Queue",
              desc: "LearnNova reminds you when revisions are due.",
            },
            {
              step: 6,
              title: "Achieve Pattern Mastery",
              desc: "Incorporate algorithms into your second brain.",
              completed: true,
            },
          ].map((item, idx) => (
            <li
              key={idx}
              className="relative rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    Step {item.step}
                  </span>
                  {item.completed && <Check className="h-4 w-4 text-success" />}
                </div>
                <h4 className="mt-2 font-bold text-white text-sm tracking-tight">{item.title}</h4>
                <p className="mt-1 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 5. Final CTA */}
      <section id="cta" className="relative py-20 sm:py-24 max-w-4xl mx-auto px-6">
        <div className="relative text-center">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-8 md:p-12 shadow-2xl backdrop-blur-md space-y-6">
            <h2 className="text-balance text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-white leading-[1.1]">
              Ready to Master{" "}
              <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent font-black">
                DSA Patterns?
              </span>
            </h2>
            <p className="mx-auto max-w-xl text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
              Stop solving and forgetting. Build your personal DSA knowledge system.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto pt-4 text-left">
              {[
                { title: "Track Problems", desc: "Multi-platform sync" },
                { title: "Store Solutions", desc: "Brute, optimal, alt code" },
                { title: "Schedule Revisions", desc: "Spaced repetition prediction" },
                { title: "Master Patterns", desc: "Visualize key paradigms" },
              ].map((feat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-primary/20 transition duration-300"
                >
                  <div className="flex items-center gap-1.5 font-bold text-white text-xs md:text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{feat.title}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1">{feat.desc}</div>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <Link
                to="/home"
                className="rounded-lg bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-black shadow-sm hover:bg-neutral-200 transition-colors inline-flex items-center gap-2"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer matching design style */}
      <footer className="relative border-t border-white/5 bg-[#07040f] pt-16 pb-10 z-10">
        <div className="mx-auto max-w-4xl px-6 grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1.2fr] text-sm pb-10 border-b border-white/5">
          {/* Left branding col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow shadow-ds-glow">
                <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <span className="font-extrabold tracking-tight text-white text-base">LearnNova</span>
            </Link>
            <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
              Your DSA Second Brain
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
              Organize, journal, and revise code patterns. Solve anywhere, master patterns, and
              compile success.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">Platform</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link to="/home" className="hover:text-primary transition-colors">
                  Problems
                </Link>
              </li>
              <li>
                <Link to="/home" className="hover:text-primary transition-colors">
                  Topics
                </Link>
              </li>
              <li>
                <Link to="/home" className="hover:text-primary transition-colors">
                  Revisions
                </Link>
              </li>
              <li>
                <Link to="/home" className="hover:text-primary transition-colors">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">
              Resources
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Pattern Roadmap
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  DSA Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Social / Company */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">Social</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <Github className="h-3.5 w-3.5" /> GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mx-auto max-w-4xl px-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div>© 2026 LearnNova. Built for developers mastering DSA.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

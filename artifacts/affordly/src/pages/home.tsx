import { Link } from "wouter";
import { ArrowRight, LineChart, BrainCircuit, ShieldCheck, Zap, Check, TrendingUp, BarChart3, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: LineChart,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    title: "12-Month Cashflow Projection",
    description: "Visualise exactly how a purchase erodes — or grows — your savings over the next year. Interactive charts, no spreadsheets required.",
  },
  {
    icon: BrainCircuit,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    title: "AI-Powered Insight",
    description: "Get an honest, data-driven verdict on your decision. Our engine analyses income, expenses, debt, and cashflow to surface the real risk.",
  },
  {
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    title: "Affordability Score",
    description: "Every simulation produces a 0–100 score and a clear risk label — Safe, Moderate, Risky, or Dangerous — so you know exactly where you stand.",
  },
  {
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "Instant Results",
    description: "Run a simulation in under 60 seconds. Enter your income, expenses, and the decision cost — we handle the maths and return results immediately.",
  },
];

const steps = [
  { num: "01", title: "Enter your finances", desc: "Add your monthly income, key expenses, current savings, and any outstanding debt." },
  { num: "02", title: "Describe the decision", desc: "Name the purchase or commitment you're evaluating and enter the total cost." },
  { num: "03", title: "Get your verdict", desc: "Receive an affordability score, 12-month projection chart, and personalised AI insight in seconds." },
];

const plans = [
  {
    name: "Free",
    price: "£0",
    period: "forever",
    description: "Explore the basics. No credit card required.",
    features: ["3 simulations per month", "12-month cashflow chart", "Affordability score", "Risk level badge"],
    cta: "Start for free",
    href: "/simulate",
    highlight: false,
  },
  {
    name: "Pro",
    price: "£12",
    period: "per month",
    description: "For people who take their finances seriously.",
    features: ["Unlimited simulations", "AI-generated insight", "Decision comparison", "Export to PDF", "Priority support"],
    cta: "Get Pro",
    href: "/simulate",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Business",
    price: "£49",
    period: "per month",
    description: "For advisors and small finance teams.",
    features: ["Everything in Pro", "Team workspace (5 seats)", "API access", "White-label reports", "Dedicated support"],
    cta: "Contact us",
    href: "/simulate",
    highlight: false,
  },
];

const stats = [
  { value: "0–100", label: "Affordability score range" },
  { value: "12 mo", label: "Cashflow projection" },
  { value: "<60s", label: "Time to run a simulation" },
  { value: "4", label: "Risk levels assessed" },
];

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">

      {/* Hero */}
      <section className="relative overflow-hidden hero-grid">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[700px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
        </div>

        <div className="relative container mx-auto px-4 md:px-8 max-w-6xl pt-24 pb-28 md:pt-32 md:pb-36 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-semibold mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <BrainCircuit className="w-3.5 h-3.5" />
            AI-powered financial decision simulator
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-600 delay-100 max-w-4xl">
            <span className="text-foreground">See how today's money</span>
            <br />
            <span className="gradient-text">decisions affect your future</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-10 animate-in fade-in slide-in-from-bottom-6 duration-600 delay-200 leading-relaxed">
            Enter your income, expenses, and a decision cost. Affordly runs the numbers and tells you — with an affordability score, 12-month projection, and AI insight — whether you can really afford it.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-600 delay-300">
            <Button size="lg" className="h-12 px-8 text-base font-semibold w-full sm:w-auto shadow-xl shadow-primary/25 hover:shadow-primary/35 transition-shadow" asChild>
              <Link href="/simulate">
                Run your first simulation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 text-foreground" asChild>
              <Link href="/dashboard">View demo dashboard</Link>
            </Button>
          </div>

          <p className="mt-8 text-xs text-muted-foreground/60">
            No account required. Educational use only — not financial advice.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/[0.06] bg-card/50 py-6">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-white/[0.07]">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center px-4">
                <span className="text-2xl md:text-3xl font-bold text-foreground font-mono">{s.value}</span>
                <span className="text-xs text-muted-foreground mt-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-muted-foreground text-xs font-medium mb-4">
              <BarChart3 className="w-3.5 h-3.5" />
              Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to make<br />a confident financial call
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
              Built for the moment before you commit — a car, holiday, renovation, or business investment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f) => (
              <div key={f.title} className={`card-hover rounded-xl border border-white/[0.07] bg-card p-6 flex flex-col gap-4`}>
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${f.bg}`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-card/30 border-y border-white/[0.05]">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">How it works</h2>
            <p className="text-muted-foreground text-sm md:text-base">Three steps. Under a minute.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-4xl font-bold text-primary/30">{step.num}</span>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent mt-1" />
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Button size="lg" className="h-11 px-8 font-semibold shadow-lg shadow-primary/20" asChild>
              <Link href="/simulate">
                Try it now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 md:py-32" id="pricing">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-muted-foreground text-xs font-medium mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Start free. Upgrade when you're ready.
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
              No trial periods. Cancel anytime. All plans include the core simulation engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-6 flex flex-col gap-6 transition-all ${
                  plan.highlight
                    ? "border-primary/50 bg-primary/8 shadow-2xl shadow-primary/10 glow-blue"
                    : "border-white/[0.07] bg-card"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{plan.name}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        plan.highlight ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground"
                      }`}>
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-muted-foreground">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={plan.highlight ? "default" : "outline"}
                  className={`w-full h-10 font-semibold ${
                    plan.highlight
                      ? "shadow-lg shadow-primary/25"
                      : "border-white/10 bg-white/5 hover:bg-white/10 text-foreground"
                  }`}
                  disabled
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground/50 mt-8 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            Payments powered by Stripe. Placeholder — no real checkout is configured.
          </p>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 border-t border-white/[0.05]">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Stop guessing. Start knowing.
          </h2>
          <p className="text-muted-foreground mb-8 text-sm md:text-base">
            Run your first simulation in under 60 seconds — for free, no account required.
          </p>
          <Button size="lg" className="h-12 px-10 text-base font-semibold shadow-xl shadow-primary/25" asChild>
            <Link href="/simulate">
              Run your first simulation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { Plus, ArrowRight, ShieldCheck, AlertTriangle, AlertCircle, Activity, PiggyBank, Banknote, Calculator, TrendingUp, TrendingDown } from "lucide-react";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(val);

function getRiskConfig(level: string) {
  switch (level) {
    case "Safe": return { label: "Safe", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25", bar: "bg-emerald-500", dot: "bg-emerald-400", icon: ShieldCheck };
    case "Moderate": return { label: "Moderate", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/25", bar: "bg-amber-500", dot: "bg-amber-400", icon: AlertCircle };
    case "Risky": return { label: "Risky", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/25", bar: "bg-orange-500", dot: "bg-orange-400", icon: AlertTriangle };
    case "Dangerous": return { label: "Dangerous", color: "text-red-400", bg: "bg-red-500/10 border-red-500/25", bar: "bg-red-500", dot: "bg-red-400", icon: AlertTriangle };
    default: return { label: level, color: "text-muted-foreground", bg: "bg-muted/50 border-border", bar: "bg-muted", dot: "bg-muted-foreground", icon: Activity };
  }
}

function ScoreRing({ score }: { score: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 75 ? "#34d399" : score >= 50 ? "#fbbf24" : score >= 25 ? "#fb923c" : "#f87171";

  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="flex-shrink-0">
      <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle
        cx="26" cy="26" r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
        style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
      />
      <text x="26" y="30" textAnchor="middle" fontSize="10" fontWeight="700" fill={color} fontFamily="JetBrains Mono, monospace">
        {score}
      </text>
    </svg>
  );
}

const miniChartData = Array.from({ length: 12 }, (_, i) => ({ m: i + 1, v: 2000 + Math.sin(i * 0.6) * 400 + i * 80 }));

interface RecentSim {
  id: string;
  scenarioName: string;
  affordabilityScore: number;
  riskLevel: string;
  createdAt: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();

  const [recent, setRecent] = useState<RecentSim[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/recent")
      .then(r => r.json())
      .then(data => {
        setRecent(
          (data.simulations || []).map((s: any) => ({
            id: s.id,
            scenarioName: s.scenario_name,
            affordabilityScore: Number(s.affordability_score),
            riskLevel: s.risk_level,
            createdAt: s.created_at,
          }))
        );
      })
      .catch(() => setRecent([]))
      .finally(() => setIsLoadingRecent(false));
  }, []);

  const riskRows = [
    { key: "safeCount", label: "Safe" },
    { key: "moderateCount", label: "Moderate" },
    { key: "riskyCount", label: "Risky" },
    { key: "dangerousCount", label: "Dangerous" },
  ] as const;

  const total = summary?.totalSimulations || 1;
  const avgScore = summary?.avgAffordabilityScore ? Math.round(summary.avgAffordabilityScore) : 0;
  const cashflowPositive = (summary?.avgMonthlyCashflow || 0) >= 0;

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your financial simulations at a glance.</p>
        </div>
        <Button asChild className="h-9 text-sm font-semibold shadow-lg shadow-primary/20 self-start sm:self-auto">
          <Link href="/simulate">
            <Plus className="w-4 h-4 mr-1.5" />
            New Simulation
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total simulations */}
        <div className="rounded-xl border border-white/[0.07] bg-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Simulations</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
            </div>
          </div>
          {isLoadingSummary ? <Skeleton className="h-8 w-12 bg-white/5" /> : (
            <span className="text-3xl font-bold text-foreground font-mono">{summary?.totalSimulations || 0}</span>
          )}
        </div>

        {/* Avg score */}
        <div className="rounded-xl border border-white/[0.07] bg-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Avg Score</span>
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            </div>
          </div>
          {isLoadingSummary ? <Skeleton className="h-8 w-20 bg-white/5" /> : (
            <div className="flex items-end gap-1.5">
              <span className="text-3xl font-bold text-foreground font-mono">{avgScore}</span>
              <span className="text-sm text-muted-foreground mb-0.5">/100</span>
            </div>
          )}
        </div>

        {/* Avg cashflow */}
        <div className="rounded-xl border border-white/[0.07] bg-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Avg Cashflow</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cashflowPositive ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
              {cashflowPositive
                ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
            </div>
          </div>
          {isLoadingSummary ? <Skeleton className="h-8 w-24 bg-white/5" /> : (
            <span className={`text-3xl font-bold font-mono ${cashflowPositive ? "text-emerald-400" : "text-red-400"}`}>
              {formatCurrency(summary?.avgMonthlyCashflow || 0)}
            </span>
          )}
        </div>

        {/* Avg savings rate */}
        <div className="rounded-xl border border-white/[0.07] bg-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Avg Savings Rate</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <PiggyBank className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>
          {isLoadingSummary ? <Skeleton className="h-8 w-16 bg-white/5" /> : (
            <span className="text-3xl font-bold text-foreground font-mono">
              {summary?.avgSavingsRate ? summary.avgSavingsRate.toFixed(1) : "0"}%
            </span>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent simulations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Recent Simulations</h2>
            <span className="text-xs text-muted-foreground">{recent?.length || 0} shown</span>
          </div>

          {isLoadingRecent ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl bg-white/5" />)}
            </div>
          ) : recent.length > 0 ? (
            <div className="space-y-3">
              {recent.map(sim => {
                const risk = getRiskConfig(sim.riskLevel);
                const RiskIcon = risk.icon;
                return (
                  <div
                    key={sim.id}
                    className="group rounded-xl border border-white/[0.07] bg-card p-4 flex items-center gap-4 cursor-pointer card-hover"
                    onClick={() => setLocation(`/simulations/${sim.id}`)}
                  >
                    <ScoreRing score={sim.affordabilityScore} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-foreground text-sm truncate">{sim.scenarioName}</span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-semibold ${risk.bg} ${risk.color}`}>
                          <RiskIcon className="w-2.5 h-2.5" />
                          {risk.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{format(new Date(sim.createdAt), "d MMM yyyy")}</span>
                        <span className="opacity-40">·</span>
                        <span className={`font-mono font-semibold ${
                          sim.affordabilityScore >= 75 ? "text-emerald-400"
                          : sim.affordabilityScore >= 50 ? "text-amber-400"
                          : sim.affordabilityScore >= 25 ? "text-orange-400"
                          : "text-red-400"
                        }`}>{sim.affordabilityScore}/100</span>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/[0.08] bg-card/50 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">No simulations yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                Run your first simulation.
              </p>
              <Button asChild size="sm" className="font-semibold">
                <Link href="/simulate">Create simulation</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Mini sparkline chart */}
          <div>
            <h2 className="text-base font-semibold text-foreground mb-4">Savings Trend</h2>
            <div className="rounded-xl border border-white/[0.07] bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">Projected trajectory</span>
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Positive
                </span>
              </div>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={miniChartData}>
                    <defs>
                      <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="m" hide />
                    <Tooltip
                      contentStyle={{ background: "hsl(224 42% 8%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "11px", color: "#e2e8f0" }}
                      formatter={(v: number) => [formatCurrency(v), "Savings"]}
                      labelFormatter={() => ""}
                    />
                    <Area dataKey="v" stroke="#60a5fa" strokeWidth={1.5} fill="url(#sparkGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Risk breakdown */}
          <div>
            <h2 className="text-base font-semibold text-foreground mb-4">Risk Breakdown</h2>
            <div className="rounded-xl border border-white/[0.07] bg-card p-5 space-y-4">
              {isLoadingSummary ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-full bg-white/5" />)}
                </div>
              ) : (
                riskRows.map(({ key, label }) => {
                  const risk = getRiskConfig(label);
                  const count = summary?.[key] || 0;
                  const pct = Math.round((count / total) * 100);
                  const RiskIcon = risk.icon;
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <RiskIcon className={`w-3.5 h-3.5 ${risk.color}`} />
                          <span className="text-xs font-medium text-foreground/80">{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold font-mono ${risk.color}`}>{count}</span>
                          <span className="text-[10px] text-muted-foreground">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${risk.bar}`}
                          style={{ width: `${pct}%`, opacity: 0.8 }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick action */}
          <div className="rounded-xl border border-primary/20 bg-primary/8 p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Banknote className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Ready to run another?</p>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">Add a new financial decision and see the impact instantly.</p>
                <Button asChild size="sm" className="h-7 text-xs font-semibold px-3 shadow-md shadow-primary/20">
                  <Link href="/simulate">
                    Start simulation
                    <ArrowRight className="w-3 h-3 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

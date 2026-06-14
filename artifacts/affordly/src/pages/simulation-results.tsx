import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  XCircle,
  BrainCircuit,
  Info,
  ArrowLeft,
  Trash2,
  TrendingUp,
  TrendingDown,
  Banknote,
  PiggyBank,
} from "lucide-react";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(val);

const formatPct = (val: number) => `${(val * 100).toFixed(1)}%`;

interface LocalSimulation {
  id: string;
  scenarioName: string;
  monthlyIncome: number;
  monthlyRent: number;
  monthlyFood: number;
  monthlyTransport: number;
  monthlySubscriptions: number;
  monthlyOther: number;
  savingsBalance: number;
  debtBalance: number;
  decisionCost: number;
  monthlyExtraCost: number | null;
  affordabilityScore: number;
  riskLevel: string;
  monthlyCashflow: number;
  savingsRate: number;
  totalMonthlyExpenses: number;
  monthsSavingsLast: number | null;
  projectedSavings12m: number[];
  savingsAfterDecision: number;
  recommendations: string[];
  aiInsight: string;
  createdAt: string;
}

function ScoreMeter({ score }: { score: number }) {
  const color =
    score >= 75 ? "#16a34a"
    : score >= 50 ? "#d97706"
    : score >= 25 ? "#ea580c"
    : "#dc2626";

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-36 h-36" data-testid="score-meter">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle
          cx="60" cy="60" r="54" fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-3xl font-bold font-mono" style={{ color }} data-testid="text-affordability-score">
          {score}
        </div>
        <div className="text-xs text-muted-foreground font-medium">/100</div>
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  switch (level) {
    case "Safe":
      return (
        <Badge className="text-sm px-3 py-1 bg-green-100 text-green-800 border-green-200 hover:bg-green-100 gap-1.5" data-testid="badge-risk-level">
          <ShieldCheck className="w-3.5 h-3.5" />Safe
        </Badge>
      );
    case "Moderate":
      return (
        <Badge className="text-sm px-3 py-1 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 gap-1.5" data-testid="badge-risk-level">
          <AlertCircle className="w-3.5 h-3.5" />Moderate
        </Badge>
      );
    case "Risky":
      return (
        <Badge className="text-sm px-3 py-1 bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100 gap-1.5" data-testid="badge-risk-level">
          <AlertTriangle className="w-3.5 h-3.5" />Risky
        </Badge>
      );
    case "Dangerous":
      return (
        <Badge className="text-sm px-3 py-1 bg-red-100 text-red-800 border-red-200 hover:bg-red-100 gap-1.5" data-testid="badge-risk-level">
          <XCircle className="w-3.5 h-3.5" />Dangerous
        </Badge>
      );
    default:
      return null;
  }
}

export default function SimulationResults() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [, setLocation] = useLocation();
  const [sim, setSim] = useState<LocalSimulation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(`affordly_sim_${id}`);
    if (raw) {
      try {
        setSim(JSON.parse(raw) as LocalSimulation);
      } catch {
        setSim(null);
      }
    }
    setIsLoading(false);
  }, [id]);

  const handleDelete = () => {
    if (window.confirm("Delete this simulation?")) {
      localStorage.removeItem(`affordly_sim_${id}`);
      setLocation("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!sim) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-24 max-w-4xl text-center">
        <h2 className="text-2xl font-bold mb-4">Simulation not found</h2>
        <p className="text-muted-foreground mb-6">This simulation may have been deleted or was run in a different browser.</p>
        <Button asChild>
          <Link href="/simulate">Run a New Simulation</Link>
        </Button>
      </div>
    );
  }

  const chartData = sim.projectedSavings12m.map((val, i) => ({
    month: `M${i + 1}`,
    savings: val,
  }));

  const scoreColor =
    sim.affordabilityScore >= 75 ? "text-green-700"
    : sim.affordabilityScore >= 50 ? "text-amber-700"
    : sim.affordabilityScore >= 25 ? "text-orange-700"
    : "text-red-700";

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl space-y-6 pb-16">
      {/* Back nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild size="sm" className="text-muted-foreground -ml-2">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          data-testid="button-delete-simulation"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{sim.scenarioName}</h1>
        <p className="text-muted-foreground mt-1">Decision cost: {formatCurrency(sim.decisionCost)}</p>
      </div>

      {/* Score card */}
      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex flex-col items-center gap-3 shrink-0">
              <ScoreMeter score={Math.round(sim.affordabilityScore)} />
              <RiskBadge level={sim.riskLevel} />
              <p className="text-xs text-muted-foreground text-center">Affordability Score</p>
            </div>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 gap-4 w-full">
              <div className="p-4 rounded-xl bg-muted/50 border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  {sim.monthlyCashflow >= 0
                    ? <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                    : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                  Monthly Cashflow
                </div>
                <div className={`text-xl font-bold font-mono ${sim.monthlyCashflow >= 0 ? "text-green-700" : "text-red-600"}`} data-testid="text-monthly-cashflow">
                  {formatCurrency(sim.monthlyCashflow)}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <PiggyBank className="w-3.5 h-3.5" />
                  Savings Rate
                </div>
                <div className="text-xl font-bold font-mono" data-testid="text-savings-rate">
                  {formatPct(sim.savingsRate)}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Banknote className="w-3.5 h-3.5" />
                  Total Expenses
                </div>
                <div className="text-xl font-bold font-mono" data-testid="text-total-expenses">
                  {formatCurrency(sim.totalMonthlyExpenses)}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Months Savings Last
                </div>
                <div className="text-xl font-bold font-mono" data-testid="text-months-savings">
                  {sim.monthsSavingsLast != null ? `${Math.round(sim.monthsSavingsLast)} mo` : "—"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 12-Month Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">12-Month Savings Projection</CardTitle>
          <CardDescription>
            Projected savings balance over the next 12 months at your current cashflow of{" "}
            <span className={sim.monthlyCashflow >= 0 ? "text-green-700 font-medium" : "text-red-600 font-medium"}>
              {formatCurrency(sim.monthlyCashflow)}/mo
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-56" data-testid="chart-savings-projection">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                  tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), "Savings"]}
                  labelFormatter={(l) => `Month ${l.replace("M", "")}`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ fill: "hsl(var(--primary))", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI Insight */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">AI Insight</CardTitle>
              <CardDescription>Powered by Affordly AI</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground/90" data-testid="text-ai-insight">{sim.aiInsight}</p>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3" data-testid="list-recommendations">
            {sim.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">{i + 1}</span>
                </div>
                <span className="text-muted-foreground leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Full Breakdown</CardTitle>
          <CardDescription>Input values used in this simulation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
            {[
              { label: "Monthly Income", value: formatCurrency(sim.monthlyIncome) },
              { label: "Rent / Housing", value: formatCurrency(sim.monthlyRent) },
              { label: "Food & Groceries", value: formatCurrency(sim.monthlyFood) },
              { label: "Transport", value: formatCurrency(sim.monthlyTransport) },
              { label: "Subscriptions", value: formatCurrency(sim.monthlySubscriptions) },
              { label: "Other Expenses", value: formatCurrency(sim.monthlyOther) },
              ...(sim.monthlyExtraCost != null
                ? [{ label: "Extra Monthly Cost", value: formatCurrency(sim.monthlyExtraCost) }]
                : []),
              { label: "Savings Balance", value: formatCurrency(sim.savingsBalance) },
              { label: "Debt Balance", value: formatCurrency(sim.debtBalance) },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-muted-foreground text-xs mb-0.5">{item.label}</div>
                <div className="font-semibold font-mono">{item.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/60 border border-border/50">
        <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          This tool provides educational simulations only and is not financial advice. Results are for informational purposes and should not be relied upon to make financial decisions without consulting a qualified financial adviser.
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button asChild>
          <Link href="/simulate">Run Another Simulation</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { Plus, ArrowRight, ShieldCheck, AlertTriangle, AlertCircle, Activity, PiggyBank, CreditCard, Banknote, Trash2 } from "lucide-react";
import { useGetDashboardSummary, useGetRecentSimulations, useDeleteSimulation, getGetDashboardSummaryQueryKey, getGetRecentSimulationsQueryKey, getListSimulationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(val);

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: recent, isLoading: isLoadingRecent } = useGetRecentSimulations();
  const deleteSim = useDeleteSimulation();

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this simulation?")) {
      deleteSim.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentSimulationsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListSimulationsQueryKey() });
        }
      });
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'Safe': return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Safe</Badge>;
      case 'Moderate': return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">Moderate</Badge>;
      case 'Risky': return <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100">Risky</Badge>;
      case 'Dangerous': return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">Dangerous</Badge>;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Review your recent simulations and overall financial health.</p>
        </div>
        <Button asChild size="lg">
          <Link href="/simulate">
            <Plus className="w-5 h-5 mr-2" />
            New Simulation
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Simulations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold">{summary?.totalSimulations || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Affordability</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-3xl font-bold">{summary?.avgAffordabilityScore ? Math.round(summary.avgAffordabilityScore) : 0}/100</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Cashflow</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-3xl font-bold">{formatCurrency(summary?.avgMonthlyCashflow || 0)}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Savings Rate</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-3xl font-bold">{summary?.avgSavingsRate ? summary.avgSavingsRate.toFixed(1) : 0}%</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Simulations</h2>
          </div>
          
          {isLoadingRecent ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : recent && recent.length > 0 ? (
            <div className="space-y-4">
              {recent.map(sim => (
                <Card key={sim.id} className="overflow-hidden transition-colors hover:bg-muted/50 cursor-pointer" onClick={() => setLocation(`/simulations/${sim.id}`)}>
                  <div className="flex flex-col sm:flex-row p-6 items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{sim.scenarioName}</h3>
                        {getRiskBadge(sim.riskLevel)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(sim.createdAt), 'MMM d, yyyy')} • Cost: {formatCurrency(sim.decisionCost)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="font-mono text-xl font-bold text-primary">{sim.affordabilityScore}/100</div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(sim.id); }} disabled={deleteSim.isPending}>
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">No simulations yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                Create your first simulation to see if you can afford that new car, house, or vacation.
              </p>
              <Button asChild>
                <Link href="/simulate">Create Simulation</Link>
              </Button>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold">Risk Breakdown</h2>
          <Card>
            <CardContent className="p-6">
              {isLoadingSummary ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <span className="font-medium">Safe</span>
                      </div>
                      <span className="font-bold">{summary?.safeCount || 0}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(summary?.totalSimulations ? (summary.safeCount / summary.totalSimulations) * 100 : 0)}%` }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span className="font-medium">Moderate</span>
                      </div>
                      <span className="font-bold">{summary?.moderateCount || 0}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(summary?.totalSimulations ? (summary.moderateCount / summary.totalSimulations) * 100 : 0)}%` }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">Risky</span>
                      </div>
                      <span className="font-bold">{summary?.riskyCount || 0}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(summary?.totalSimulations ? (summary.riskyCount / summary.totalSimulations) * 100 : 0)}%` }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="font-medium">Dangerous</span>
                      </div>
                      <span className="font-bold">{summary?.dangerousCount || 0}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(summary?.totalSimulations ? (summary.dangerousCount / summary.totalSimulations) * 100 : 0)}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

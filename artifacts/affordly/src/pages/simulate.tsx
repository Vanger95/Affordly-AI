import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateSimulation, getListSimulationsQueryKey, getGetDashboardSummaryQueryKey, getGetRecentSimulationsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Calculator, PoundSterling, Info } from "lucide-react";

const simulationSchema = z.object({
  scenarioName: z.string().min(1, "Scenario name is required"),
  monthlyIncome: z.coerce.number().min(0, "Must be 0 or more"),
  monthlyRent: z.coerce.number().min(0, "Must be 0 or more"),
  monthlyFood: z.coerce.number().min(0, "Must be 0 or more"),
  monthlyTransport: z.coerce.number().min(0, "Must be 0 or more"),
  monthlySubscriptions: z.coerce.number().min(0, "Must be 0 or more"),
  monthlyOther: z.coerce.number().min(0, "Must be 0 or more"),
  savingsBalance: z.coerce.number().min(0, "Must be 0 or more"),
  debtBalance: z.coerce.number().min(0, "Must be 0 or more"),
  decisionCost: z.coerce.number().min(1, "Decision cost must be greater than 0"),
  monthlyExtraCost: z.coerce.number().min(0).optional().or(z.literal("")),
});

type SimulationFormData = z.infer<typeof simulationSchema>;

function CurrencyField({ label, name, description, form }: {
  label: string;
  name: keyof SimulationFormData;
  description?: string;
  form: ReturnType<typeof useForm<SimulationFormData>>;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">£</span>
              <Input
                {...field}
                type="number"
                min="0"
                step="1"
                className="pl-7"
                data-testid={`input-${name}`}
                value={field.value as number | string}
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default function Simulate() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createSim = useCreateSimulation();

  const form = useForm<SimulationFormData>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      scenarioName: "",
      monthlyIncome: 3500,
      monthlyRent: 900,
      monthlyFood: 300,
      monthlyTransport: 100,
      monthlySubscriptions: 50,
      monthlyOther: 150,
      savingsBalance: 10000,
      debtBalance: 2000,
      decisionCost: 5000,
      monthlyExtraCost: "" as unknown as number,
    },
  });

  const onSubmit = (data: SimulationFormData) => {
    createSim.mutate(
      {
        data: {
          scenarioName: data.scenarioName,
          monthlyIncome: data.monthlyIncome,
          monthlyRent: data.monthlyRent,
          monthlyFood: data.monthlyFood,
          monthlyTransport: data.monthlyTransport,
          monthlySubscriptions: data.monthlySubscriptions,
          monthlyOther: data.monthlyOther,
          savingsBalance: data.savingsBalance,
          debtBalance: data.debtBalance,
          decisionCost: data.decisionCost,
          monthlyExtraCost: data.monthlyExtraCost !== "" && data.monthlyExtraCost !== undefined ? data.monthlyExtraCost : null,
        },
      },
      {
        onSuccess: (simulation) => {
          queryClient.invalidateQueries({ queryKey: getListSimulationsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentSimulationsQueryKey() });
          setLocation(`/simulations/${simulation.id}`);
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">New Simulation</h1>
        </div>
        <p className="text-muted-foreground">
          Enter your financial details to simulate a decision and get an affordability score.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Scenario */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scenario Details</CardTitle>
              <CardDescription>Name the financial decision you're evaluating.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="scenarioName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scenario Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Buy a £12,000 used car"
                        data-testid="input-scenarioName"
                      />
                    </FormControl>
                    <FormDescription>Describe the purchase or decision you're simulating.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CurrencyField label="Decision Cost" name="decisionCost" description="Total upfront cost of the purchase." form={form} />
                <CurrencyField label="Optional Monthly Extra Cost" name="monthlyExtraCost" description="e.g. loan repayment, running costs." form={form} />
              </div>
            </CardContent>
          </Card>

          {/* Income */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Income</CardTitle>
              <CardDescription>Your take-home income after tax.</CardDescription>
            </CardHeader>
            <CardContent>
              <CurrencyField label="Monthly Take-Home Income" name="monthlyIncome" form={form} />
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Expenses</CardTitle>
              <CardDescription>Your regular monthly outgoings.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CurrencyField label="Rent / Housing" name="monthlyRent" form={form} />
              <CurrencyField label="Food & Groceries" name="monthlyFood" form={form} />
              <CurrencyField label="Transport" name="monthlyTransport" form={form} />
              <CurrencyField label="Subscriptions" name="monthlySubscriptions" form={form} />
              <CurrencyField label="Other Expenses" name="monthlyOther" form={form} />
            </CardContent>
          </Card>

          {/* Savings & Debt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial Position</CardTitle>
              <CardDescription>Your current savings and debt balances.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CurrencyField label="Savings Balance" name="savingsBalance" description="Total savings available." form={form} />
              <CurrencyField label="Total Debt Balance" name="debtBalance" description="Outstanding debt (loans, credit cards)." form={form} />
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/60 border border-border/50">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              This tool provides educational simulations only and is not financial advice. Results are based on the inputs you provide and should not be used to make financial decisions without consulting a qualified financial adviser.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={createSim.isPending}
              data-testid="button-submit-simulation"
            >
              {createSim.isPending ? "Running Simulation..." : "Run Simulation"}
              <Calculator className="w-4 h-4 ml-2" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

import { Link } from "wouter";
import { Check, Zap, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: "£0",
    period: "forever",
    description: "Perfect for getting started and running your first simulations.",
    icon: Sparkles,
    features: [
      "5 simulations per month",
      "Basic affordability scoring",
      "12-month cashflow projection",
      "AI insight summaries",
      "Export results as PDF",
    ],
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
    highlighted: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "£9",
    period: "per month",
    description: "For individuals who want unlimited simulations and deeper insights.",
    icon: Zap,
    features: [
      "Unlimited simulations",
      "Advanced AI insights",
      "Scenario comparison",
      "Historical analysis",
      "Priority support",
      "CSV/JSON export",
    ],
    cta: "Coming Soon",
    ctaVariant: "default" as const,
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Business",
    price: "£29",
    period: "per month",
    description: "For teams and financial planners managing multiple clients.",
    icon: Building2,
    features: [
      "Everything in Pro",
      "Team workspace (up to 5 users)",
      "Client management",
      "White-label reports",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Coming Soon",
    ctaVariant: "outline" as const,
    highlighted: false,
    badge: null,
  },
];

export default function Pricing() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <section className="py-16 md:py-24 px-4 md:px-8 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
          <Zap className="w-4 h-4" />
          Simple Pricing
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Start free. Upgrade when you need to.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Affordly AI is free to try. Pro and Business tiers are coming soon — sign up to be notified when they launch.
        </p>
      </section>

      {/* Plans */}
      <section className="px-4 md:px-8 pb-24 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${plan.highlighted ? "ring-2 ring-primary shadow-xl shadow-primary/10" : ""}`}
                data-testid={`card-plan-${plan.name.toLowerCase()}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-4xl font-bold font-mono">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">/{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2 leading-relaxed">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  {plan.name === "Free" ? (
                    <Button
                      asChild
                      variant={plan.ctaVariant}
                      className="w-full"
                      data-testid={`button-plan-${plan.name.toLowerCase()}`}
                    >
                      <Link href="/simulate">{plan.cta}</Link>
                    </Button>
                  ) : (
                    <Button
                      variant={plan.ctaVariant}
                      className="w-full"
                      disabled
                      data-testid={`button-plan-${plan.name.toLowerCase()}`}
                    >
                      {plan.cta}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Note on Stripe */}
        <p className="text-center text-xs text-muted-foreground mt-10 max-w-lg mx-auto">
          Pro and Business plans are placeholders. Stripe subscription billing will be enabled at launch. All plans include the educational disclaimer: this tool is not financial advice.
        </p>
      </section>

      {/* FAQ */}
      <section className="border-t bg-muted/30 py-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Common Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                q: "Is my financial data stored?",
                a: "Your simulation data is stored to power your dashboard. We do not sell or share it with third parties.",
              },
              {
                q: "Is this real financial advice?",
                a: "No. Affordly AI provides educational simulations only. Always consult a qualified financial adviser before making financial decisions.",
              },
              {
                q: "When are paid plans launching?",
                a: "Pro and Business plans are coming soon. The Free tier is fully functional and includes all core simulation features.",
              },
              {
                q: "Can I cancel at any time?",
                a: "Yes. When paid plans launch, you'll be able to cancel anytime with no hidden fees.",
              },
            ].map((item) => (
              <div key={item.q}>
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

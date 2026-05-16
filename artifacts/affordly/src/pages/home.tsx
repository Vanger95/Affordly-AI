import { Link } from "wouter";
import { ArrowRight, ShieldCheck, Zap, LineChart, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="px-4 py-24 md:py-32 md:px-8 max-w-6xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <BrainCircuit className="w-4 h-4" />
          <span>Your Financial Co-Pilot</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          Ask "Can I afford this?" and get an honest answer.
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 leading-relaxed">
          Stop guessing with spreadsheets. Affordly AI simulates your financial decisions against your real cashflow and gives you clear, actionable insights.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
          <Button size="lg" className="h-14 px-8 text-base w-full sm:w-auto" asChild>
            <Link href="/simulate">
              Start Simulation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-base w-full sm:w-auto bg-background" asChild>
            <Link href="/dashboard">View Dashboard</Link>
          </Button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground max-w-md">
          This tool provides educational simulations only and is not financial advice. Your data is not sold or shared.
        </p>
      </section>

      {/* Value Props Section */}
      <section className="bg-muted/50 border-y py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <LineChart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">12-Month Projections</h3>
              <p className="text-muted-foreground leading-relaxed">
                See exactly how a purchase will impact your savings over the next year. No more mental math.
              </p>
            </div>
            
            <div className="flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <BrainCircuit className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI-Powered Insights</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get honest feedback on your decision. We analyze your cashflow to tell you if you're taking on too much risk.
              </p>
            </div>
            
            <div className="flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Clear Risk Scoring</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every decision gets a score from 0 to 100, mapped to clear risk levels so you know exactly where you stand.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Briefcase, ArrowRight, BarChart3, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isDashboard = location.startsWith("/dashboard") || location.startsWith("/simulate") || location.startsWith("/simulations");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-primary-foreground" />
            </div>
            <span>Affordly AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isDashboard ? (
              <Button asChild size="sm">
                <Link href="/simulate">
                  <Calculator className="w-4 h-4 mr-2" />
                  New Simulation
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/dashboard">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/simulate">
                    Try a Demo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Briefcase className="w-5 h-5" />
            <span className="font-bold tracking-tight">Affordly AI</span>
          </div>
          
          <div className="text-sm text-muted-foreground max-w-lg text-center md:text-right">
            This tool provides educational simulations only and is not financial advice.
          </div>
        </div>
      </footer>
    </div>
  );
}

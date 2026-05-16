import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Sparkles, ArrowRight, LayoutDashboard, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isDashboard = location.startsWith("/dashboard") || location.startsWith("/simulate") || location.startsWith("/simulations");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between max-w-7xl">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">Affordly</span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/15 text-primary border border-primary/20 ml-0.5">AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/dashboard">
              <button className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.startsWith('/dashboard') 
                  ? 'bg-white/10 text-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}>
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </button>
            </Link>
            <Link href="/pricing">
              <button className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location === '/pricing'
                  ? 'bg-white/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}>
                Pricing
              </button>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isDashboard ? (
              <Button asChild size="sm" className="h-8 text-sm font-medium shadow-lg shadow-primary/20">
                <Link href="/simulate">
                  <Calculator className="w-3.5 h-3.5 mr-1.5" />
                  New Simulation
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex h-8 text-sm text-muted-foreground hover:text-foreground">
                  <Link href="/dashboard">Log in</Link>
                </Button>
                <Button asChild size="sm" className="h-8 text-sm font-medium shadow-lg shadow-primary/20">
                  <Link href="/simulate">
                    Run a simulation
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
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

      <footer className="border-t border-white/[0.06] py-10 bg-background">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary" />
            </div>
            <span className="font-semibold text-sm text-foreground/60">Affordly AI</span>
          </div>

          <p className="text-xs text-muted-foreground text-center max-w-sm">
            This tool provides educational simulations only and is not financial advice. Your data is not sold or shared.
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <span className="opacity-30">·</span>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <span className="opacity-30">·</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

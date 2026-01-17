import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn("w-full border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50", className)}>
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <a href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <span className="text-title text-foreground font-semibold tracking-tight">
            Veritas
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-caption text-muted-foreground hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#" className="text-caption text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
        </nav>
      </div>
    </header>
  );
}

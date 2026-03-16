import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn("w-full border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50", className)}>
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <a href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-md bg-secondary/70 ring-1 ring-border group-hover:ring-primary/70 transition-colors">
            <img
              src="/bias-lens.png"
              alt="BiasLens logo"
              className="h-6 w-6 object-contain"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-[1.05rem] tracking-[0.12em] uppercase">
              BiasLens
            </span>
            <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              See through the spin.
            </span>
          </div>
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

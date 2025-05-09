// src/components/site-header.tsx
import Link from 'next/link';
import { Puzzle } from 'lucide-react'; 

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-lg shadow-sm supports-[backdrop-filter]:bg-background/75">
      <div className="container flex h-16 max-w-screen-xl items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="mr-6 flex items-center space-x-2.5 group">
          <Puzzle className="h-7 w-7 text-primary transition-transform duration-300 ease-out group-hover:rotate-12" />
          <span className="font-bold sm:inline-block text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
            PuzzlePal
          </span>
        </Link>
        {/* Future navigation items can go here. For example:
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/archive" className="text-muted-foreground hover:text-foreground transition-colors">
            Archive
          </Link>
        </nav>
        */}
      </div>
    </header>
  );
}

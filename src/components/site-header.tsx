import Link from 'next/link';
import { Puzzle } from 'lucide-react'; // Using Puzzle icon for branding

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Puzzle className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg">
            PuzzlePal
          </span>
        </Link>
        {/* Future navigation items can go here */}
      </div>
    </header>
  );
}

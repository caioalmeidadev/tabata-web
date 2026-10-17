import Link from "next/link";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  rightSlot?: React.ReactNode;
  className?: string;
}

export function AppHeader({ rightSlot, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-md",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#83FF36] text-[#0A0A0A] transition-transform group-hover:scale-105">
            <Timer className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl uppercase tracking-wider leading-none text-white">
              TABATA<span className="text-[#83FF36]">PRO</span>
            </span>
            <span className="font-condensed text-[11px] uppercase tracking-widest text-[#9CA3AF]">
              HIIT Interval Timer
            </span>
          </div>
        </Link>

        {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
      </div>
    </header>
  );
}

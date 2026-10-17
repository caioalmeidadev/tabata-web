import * as React from "react";
import { cn } from "@/lib/utils";

interface BottomActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function BottomActions({
  children,
  className,
  ...props
}: BottomActionsProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 mt-auto border-t border-white/10 bg-[#0A0A0A]/95 px-4 py-4 backdrop-blur-md md:px-8",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-end gap-3">
        {children}
      </div>
    </div>
  );
}

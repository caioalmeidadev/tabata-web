import * as React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function PageContainer({
  children,
  className,
  ...props
}: PageContainerProps) {
  return (
    <main
      className={cn(
        "mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 md:px-8 md:py-10",
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
}

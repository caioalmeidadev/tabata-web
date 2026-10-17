import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-condensed uppercase tracking-wider font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83FF36] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#83FF36] text-[#0A0A0A] hover:bg-[#9aff57] shadow-lg shadow-[#83FF36]/10",
        prepare:
          "bg-[#FFFF2E] text-[#0A0A0A] hover:bg-[#ffff5c]",
        destructive:
          "bg-[#FF3B30] text-white hover:bg-[#ff564d]",
        secondary:
          "bg-[#232323] text-white hover:bg-[#2f2f2f] border border-white/10",
        outline:
          "border border-white/20 bg-transparent text-white hover:bg-white/10",
        ghost:
          "bg-transparent text-white hover:bg-white/10",
      },
      size: {
        default: "h-11 px-5 py-2.5 text-base",
        sm: "h-9 rounded-lg px-3.5 text-sm",
        lg: "h-14 rounded-2xl px-8 text-lg",
        icon: "h-11 w-11",
        "icon-lg": "h-16 w-16 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };

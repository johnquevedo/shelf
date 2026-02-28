import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent text-slate-950 hover:bg-[#ffcb85]",
        secondary: "bg-white/10 text-white hover:bg-white/15",
        outline: "border border-slate-300 bg-white text-slate-950 hover:bg-slate-50",
        ghost: "text-white hover:bg-white/10",
        light: "bg-slate-950 text-white hover:bg-slate-800"
      },
      size: {
        md: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);

Button.displayName = "Button";

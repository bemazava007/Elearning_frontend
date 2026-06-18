"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 active:scale-95 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl",
        destructive: "bg-red-500 text-white hover:bg-red-600 rounded-xl",
        outline:
          "border-2 border-slate-200 bg-white hover:border-emerald-500 text-slate-900 rounded-xl",
        secondary: "bg-slate-900 text-white hover:bg-slate-800 rounded-xl",
        ghost: "hover:bg-slate-50 text-slate-600 rounded-xl",
        link: "text-emerald-600 underline-offset-4 hover:underline",
        premium:
          "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-100 hover:opacity-95 rounded-full",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg", // <-- Ajouté pour vos boutons principaux
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/92 hover:shadow-md",
        primary: "bg-primary text-primary-foreground shadow-md hover:bg-primary/92 hover:shadow-lg hover:shadow-primary/25",
        accent: "bg-accent text-accent-foreground shadow-md hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/25",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent/15 hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline: "border border-border bg-background/50 backdrop-blur-sm hover:bg-muted hover:border-primary/40 text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "border border-white/25 bg-white/12 text-white backdrop-blur-md hover:bg-white/22 shadow-lg",
      },
      size: {
        sm: "h-8 rounded-full px-3.5 text-xs",
        md: "h-10 rounded-full px-5 text-sm",
        lg: "h-12 rounded-full px-8 text-base",
        icon: "h-10 w-10 rounded-full",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp: React.ElementType = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
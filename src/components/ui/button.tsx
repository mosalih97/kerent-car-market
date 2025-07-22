import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform active:scale-95",
  {
    variants: {
      variant: {
        default: "btn-primary hover:scale-105 hover:shadow-xl",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105 shadow-lg",
        outline:
          "border-2 border-border bg-transparent hover:bg-accent hover:text-accent-foreground hover:scale-105 backdrop-blur-sm",
        secondary:
          "btn-secondary hover:scale-105 hover:shadow-xl",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-105 rounded-xl",
        link: "text-primary underline-offset-4 hover:underline hover:scale-105",
        premium: "premium-badge hover:scale-110 shadow-xl",
        neon: "neon-border bg-transparent text-accent hover:bg-accent/10 hover:scale-105",
        cyber: "bg-card/20 backdrop-blur-xl border border-primary/30 text-primary hover:bg-primary/10 hover:scale-105 shadow-lg",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-lg px-4",
        lg: "h-14 rounded-xl px-8 text-base",
        icon: "h-12 w-12",
        xl: "h-16 px-10 text-lg rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

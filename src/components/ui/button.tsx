import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-display font-semibold transition-[transform,background-color,box-shadow,color,border-color] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-paper active:not-disabled:scale-[0.96] active:not-disabled:shadow-none",
  {
    variants: {
      variant: {
        default: "bg-coral text-coral-fg shadow-pop hover:bg-coral-hot",
        leaf: "bg-leaf text-leaf-fg shadow-pop hover:bg-leaf-hot",
        sun: "bg-sun text-ink shadow-pop hover:bg-sun-hot",
        outline:
          "border-2 border-ink/15 bg-card text-ink shadow-pop hover:bg-paper-2",
        ghost: "text-ink hover:bg-ink/6",
        ink: "bg-ink text-paper shadow-pop hover:bg-ink-soft",
      },
      size: {
        default: "h-11 rounded-full px-5 text-sm",
        sm: "h-9 rounded-full px-3 text-xs",
        lg: "h-12 rounded-full px-7 text-base",
        xl: "h-14 rounded-full px-8 text-lg",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

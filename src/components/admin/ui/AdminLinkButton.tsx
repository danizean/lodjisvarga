import type { ReactNode } from "react";
import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAdminButtonSizeClass } from "@/components/admin/ui/AdminButton";

type AdminLinkButtonProps = {
  href: string;
  children: ReactNode;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
  title?: string;
  prefetch?: boolean;
};

export function AdminLinkButton({
  href,
  children,
  variant = "outline",
  size = "sm",
  className,
  title,
  prefetch,
}: AdminLinkButtonProps) {
  return (
    <Link
      href={href}
      title={title}
      prefetch={prefetch}
      className={cn(
        buttonVariants({ variant, size }),
        getAdminButtonSizeClass(size),
        className
      )}
    >
      {children}
    </Link>
  );
}

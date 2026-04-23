import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminButtonSize = ComponentProps<typeof Button>["size"];

export function getAdminButtonSizeClass(size: AdminButtonSize) {
  if (size === "sm") {
    return "admin-btn-sm";
  }

  if (size === "lg") {
    return "admin-btn-lg";
  }

  if (size === "default") {
    return "admin-btn";
  }

  return undefined;
}

export function AdminButton({
  size = "sm",
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      size={size}
      className={cn(getAdminButtonSizeClass(size), className)}
      {...props}
    />
  );
}

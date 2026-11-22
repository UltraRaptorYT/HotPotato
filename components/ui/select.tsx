"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { ReactNode } from "react";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  children,
  className = "",
  ...props
}: SelectPrimitive.SelectTriggerProps & { children: ReactNode; className?: string }) {
  return (
    <SelectPrimitive.Trigger className={`select-trigger ${className}`} {...props}>
      {children}
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  children,
  className = "",
  ...props
}: SelectPrimitive.SelectContentProps & { children: ReactNode; className?: string }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content className={`select-content ${className}`} position="popper" sideOffset={6} {...props}>
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  children,
  className = "",
  ...props
}: SelectPrimitive.SelectItemProps & { children: ReactNode; className?: string }) {
  return (
    <SelectPrimitive.Item className={`select-item ${className}`} {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="select-item-indicator" aria-hidden="true">✓</SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

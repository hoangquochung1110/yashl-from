"use client"

import * as React from "react"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({ 
  id, 
  checked, 
  onCheckedChange, 
  className = "", 
  disabled,
  ...props 
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className={`h-4 w-4 rounded border border-gray-300 
        focus:outline-none focus:ring-2 focus:ring-blue-500 
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}`}
      disabled={disabled}
      {...props}
    />
  )
} 
"use client";

import { Check, ChevronDown } from "lucide-react";
import { Select as RadixSelect } from "radix-ui";
import type { ReactElement } from "react";

export interface SelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
  disabled?: boolean;
}

interface BrandedSelectProps<TValue extends string> {
  value: TValue;
  options: readonly SelectOption<TValue>[];
  onValueChange: (value: TValue) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  describedBy?: string;
  ariaLabel?: string;
  className?: string;
}

/** A controlled single-select with a brand-styled, keyboard-accessible popup. */
export function BrandedSelect<TValue extends string>({
  value,
  options,
  onValueChange,
  id,
  name,
  placeholder = "Choose an option…",
  disabled = false,
  required = false,
  invalid = false,
  describedBy,
  ariaLabel,
  className = "",
}: BrandedSelectProps<TValue>): ReactElement {
  return (
    <RadixSelect.Root
      value={value || undefined}
      onValueChange={(nextValue: string): void => onValueChange(nextValue as TValue)}
      name={name}
      disabled={disabled}
      required={required}
    >
      <RadixSelect.Trigger
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-label={ariaLabel}
        className={`brand-select-trigger ${className}`}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className="brand-select-chevron" aria-hidden="true">
          <ChevronDown size={15} strokeWidth={1.8} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          align="start"
          className="brand-select-content"
        >
          <RadixSelect.Viewport className="brand-select-viewport">
            {options.map((option: SelectOption<TValue>): ReactElement => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                textValue={option.label}
                className="brand-select-item"
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="brand-select-indicator" aria-hidden="true">
                  <Check size={14} strokeWidth={2.2} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

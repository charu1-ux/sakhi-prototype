"use client";

import { ArrowUp, Mic, Paperclip } from "lucide-react";
import * as React from "react";

import { Textarea } from "@/components/atoms/Textarea";
import { Button } from "@/components/primitives/Button";
import { cn } from "@/lib/cn";

export interface ChatInputDockProps extends React.HTMLAttributes<HTMLFormElement> {
  onSend?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInputDock({
  onSend,
  placeholder = "Ask anything…",
  disabled,
  className,
  ...rest
}: ChatInputDockProps) {
  const [value, setValue] = React.useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend?.(trimmed);
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "border-border bg-bg/90 pb-safe sticky bottom-0 z-20 flex w-full items-end gap-2 border-t p-3 backdrop-blur",
        className,
      )}
      {...rest}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Attach file"
        disabled={disabled}
      >
        <Paperclip className="h-5 w-5" aria-hidden />
      </Button>
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        className="min-h-10 flex-1 resize-none"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Voice input"
        disabled={disabled}
      >
        <Mic className="h-5 w-5" aria-hidden />
      </Button>
      <Button type="submit" size="icon" aria-label="Send" disabled={disabled || !value.trim()}>
        <ArrowUp className="h-5 w-5" aria-hidden />
      </Button>
    </form>
  );
}

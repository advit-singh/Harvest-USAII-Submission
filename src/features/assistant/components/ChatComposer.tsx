"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  chatMessageSchema,
  type ChatMessageInput,
} from "@/features/assistant/schemas/chat.schema";

interface ChatComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatComposer({
  onSend,
  disabled = false,
  placeholder = "Ask about waste trends, forecasts, inventory, or donations...",
}: ChatComposerProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatMessageInput>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: { message: "" },
  });

  const submit = handleSubmit((data) => {
    onSend(data.message);
    reset();
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="border-t bg-background p-4"
    >
      <Label htmlFor="assistant-message" className="sr-only">
        Message to AI Assistant
      </Label>
      <div className="flex gap-2">
        <textarea
          id="assistant-message"
          rows={2}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "assistant-message-error" : undefined}
          className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...register("message")}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled}
          aria-label="Send message"
          className="shrink-0 self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {errors.message && (
        <p id="assistant-message-error" className="mt-1 text-xs text-destructive">
          {errors.message.message}
        </p>
      )}
    </form>
  );
}

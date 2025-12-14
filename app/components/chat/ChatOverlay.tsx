"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useSmoothText, useUIMessages } from "@convex-dev/agent/react";
import { useAction } from "convex/react";
import { Bot, MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CONVERSATION_STARTERS = [
  "Was sind meine größten Ausgaben?",
  "Wo kann ich Kosten sparen?",
  "Erstelle einen Finanzreport",
  "Wie ist meine aktuelle Bilanz?",
];

function MessageBubble({
  role,
  text,
  isStreaming,
}: {
  role: "user" | "assistant";
  text: string;
  isStreaming?: boolean;
}) {
  const [smoothText] = useSmoothText(text, {
    startStreaming: isStreaming ?? false,
  });

  const isUser = role === "user";

  return (
    <div className={cn("flex", isUser && "justify-end")}>
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{smoothText || text}</p>
      </div>
    </div>
  );
}

export function ChatOverlay({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendMessage = useAction(api.ai.actions.sendMessage);

  const { results: messages } = useUIMessages(
    api.ai.queries.listMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 50, stream: true }
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pendingMessage]);

  useEffect(() => {
    if (pendingMessage && messages.some((m) => m.role === "user" && m.text === pendingMessage)) {
      setPendingMessage(null);
    }
  }, [messages, pendingMessage]);

  const handleSend = async (prompt: string) => {
    if (!prompt.trim() || pendingMessage) return;

    const trimmedPrompt = prompt.trim();
    setInput("");
    setPendingMessage(trimmedPrompt);

    const newThreadId = await sendMessage({
      threadId: threadId ?? undefined,
      prompt: trimmedPrompt,
    });
    if (!threadId) setThreadId(newThreadId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const showEmptyState = messages.length === 0 && !pendingMessage;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Budgy
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
          <div className="flex flex-col gap-4">
            {showEmptyState && (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Hallo! Ich bin Budgy, dein Budget-Assistent.
                </p>
                <p className="text-sm text-muted-foreground mt-1 mb-6">
                  Frag mich zu Transaktionen, Kategorien oder Finanzen.
                </p>
                <div className="flex flex-col gap-2">
                  {CONVERSATION_STARTERS.map((starter) => (
                    <Button
                      key={starter}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto py-2 px-3"
                      onClick={() => handleSend(starter)}
                    >
                      {starter}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message) => {
              if (!message.text) return null;
              return (
                <MessageBubble
                  key={message.key}
                  role={message.role as "user" | "assistant"}
                  text={message.text}
                  isStreaming={message.status === "streaming"}
                />
              );
            })}
            {pendingMessage && (
              <>
                <MessageBubble role="user" text={pendingMessage} />
                <div className="flex">
                  <div className="rounded-lg px-4 py-2 bg-muted flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nachricht eingeben..."
              disabled={!!pendingMessage}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              disabled={!!pendingMessage || !input.trim()}
            >
              {pendingMessage ? (
                <div className="flex gap-0.5">
                  <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 bg-current rounded-full animate-bounce" />
                </div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function ChatTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 h-9 w-9 rounded-lg shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      <ChatOverlay open={open} onOpenChange={setOpen} />
    </>
  );
}

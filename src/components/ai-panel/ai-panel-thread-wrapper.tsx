"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useThreadRuntime } from "@assistant-ui/react";
import { useAiPanel } from "./ai-panel-context";
import { Thread } from "@/components/thread";
import { getDynamicPageContextForRoute } from "@/lib/ai/page-context";

/**
 * Renders the Thread with page-context-aware suggestions.
 * Must be rendered inside an AssistantRuntimeProvider.
 */
export function AiPanelThreadWrapper() {
  const pathname = usePathname();
  const { activePageContext, setMessages } = useAiPanel();
  const threadRuntime = useThreadRuntime();

  const dynamicInfo = getDynamicPageContextForRoute(pathname);

  // Get suggestions from page context or use dynamic route defaults
  const suggestions =
    activePageContext?.suggestedActions && activePageContext.suggestedActions.length > 0
      ? activePageContext.suggestedActions.map((a) => a.label).slice(0, 5)
      : dynamicInfo.defaultSuggestions;

  const description = dynamicInfo.description;

  // Sync thread messages to context for sharing with full page
  const messagesRef = useRef<string>("");

  useEffect(() => {
    const unsubscribe = threadRuntime.subscribe(() => {
      const msgs = threadRuntime.getState().messages;
      const serialized = JSON.stringify(
        msgs.map((m) => ({
          role: m.role,
          content:
            typeof m.content === "string"
              ? m.content
              : Array.isArray(m.content)
                ? m.content
                    .filter((part: any) => part.type === "text")
                    .map((part: any) => part.text)
                    .join("")
                : "",
        })),
      );
      if (serialized !== messagesRef.current) {
        messagesRef.current = serialized;
        setMessages(
          msgs.map((m) => ({
            role: m.role as "user" | "assistant",
            content:
              typeof m.content === "string"
                ? m.content
                : Array.isArray(m.content)
                  ? m.content
                      .filter((part: any) => part.type === "text")
                      .map((part: any) => part.text)
                      .join("")
                  : "",
          })),
        );
      }
    });
    return unsubscribe;
  }, [threadRuntime, setMessages]);

  return (
    <Thread
      suggestions={suggestions}
      description={description}
      compact
    />
  );
}

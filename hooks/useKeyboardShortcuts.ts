"use client";

import { useEffect } from "react";

export interface ShortcutBinding {
  /** e.g. "mod+k", "t", "1", "ArrowUp". "mod" matches Cmd on Mac or Ctrl elsewhere. */
  combo: string;
  handler: (event: KeyboardEvent) => void;
  enabled?: boolean;
}

function matches(event: KeyboardEvent, combo: string): boolean {
  const parts = combo.toLowerCase().split("+");
  const key = parts[parts.length - 1];
  const needsMod = parts.includes("mod");
  const needsShift = parts.includes("shift");

  const eventKey = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (eventKey !== key && event.key.toLowerCase() !== key) return false;
  if (needsMod && !(event.metaKey || event.ctrlKey)) return false;
  if (!needsMod && (event.metaKey || event.ctrlKey)) return false;
  if (needsShift && !event.shiftKey) return false;

  return true;
}

function isTypingInField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

/** Binds global keyboard shortcuts while the owning component is mounted. Ignores keys typed into form fields. */
export function useKeyboardShortcuts(bindings: ShortcutBinding[]) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isTypingInField(event.target)) return;
      for (const binding of bindings) {
        if (binding.enabled === false) continue;
        if (matches(event, binding.combo)) {
          event.preventDefault();
          binding.handler(event);
          return;
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bindings]);
}

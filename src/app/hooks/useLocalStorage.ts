"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      // Private browsing can deny storage access; in-memory state still works.
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Keep the app usable if storage is unavailable.
    }
  }, [hydrated, key, value]);

  const update = useCallback((next: T | ((previous: T) => T)) => {
    setValue((previous) => typeof next === "function" ? (next as (previous: T) => T)(previous) : next);
  }, []);

  return [value, update, hydrated] as const;
}

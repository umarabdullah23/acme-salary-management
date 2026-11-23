"use client";

import { useEffect, useState } from "react";
import { request } from "./api";

export interface ApiState<T> {
  data: T | undefined;
  error: string | undefined;
  loading: boolean;
}

interface Settled<T> {
  key: string;
  data: T | undefined;
  error: string | undefined;
}

/**
 * Fetches `url` (skipped when null). Keeps the previous data while reloading and ignores
 * stale responses. `loading` is derived: the latest request key has not settled yet.
 */
export function useApi<T>(url: string | null, reloadKey = 0): ApiState<T> {
  const key = `${reloadKey}:${url}`;
  const [settled, setSettled] = useState<Settled<T>>({ key: "", data: undefined, error: undefined });

  useEffect(() => {
    if (url === null) return;
    let stale = false;
    request<T>(url)
      .then((data) => !stale && setSettled({ key, data, error: undefined }))
      .catch(
        (e: unknown) =>
          !stale &&
          setSettled((s) => ({ key, data: s.data, error: e instanceof Error ? e.message : "Request failed" })),
      );
    return () => {
      stale = true;
    };
  }, [url, key]);

  const current = settled.key === key;
  return {
    data: settled.data,
    error: current ? settled.error : undefined,
    loading: url !== null && !current,
  };
}

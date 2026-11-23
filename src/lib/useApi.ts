"use client";

import { useEffect, useState } from "react";
import { request } from "./api";

export interface ApiState<T> {
  data: T | undefined;
  error: string | undefined;
  loading: boolean;
}

/** Fetches `url` (skipped when null) and ignores stale responses when the url changes. */
export function useApi<T>(url: string | null, reloadKey = 0): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({ data: undefined, error: undefined, loading: url !== null });

  useEffect(() => {
    if (url === null) return;
    let stale = false;
    setState((s) => ({ ...s, loading: true, error: undefined }));
    request<T>(url)
      .then((data) => !stale && setState({ data, error: undefined, loading: false }))
      .catch(
        (e: unknown) =>
          !stale &&
          setState({ data: undefined, error: e instanceof Error ? e.message : "Request failed", loading: false }),
      );
    return () => {
      stale = true;
    };
  }, [url, reloadKey]);

  return state;
}

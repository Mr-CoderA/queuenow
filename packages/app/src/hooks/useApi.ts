import { useCallback, useState } from "react";
import { ApiError, apiClient } from "../lib/api-client";

export function useApi() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Request failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { api: apiClient, error, setError, loading, run };
}

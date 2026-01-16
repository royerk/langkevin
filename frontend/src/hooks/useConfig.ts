import { useState, useEffect } from "react";
import type { AppConfig } from "../types/api";
import { fetchConfig } from "../lib/api";

interface UseConfig {
  config: AppConfig | null;
  loading: boolean;
  error: string | null;
}

export function useConfig(): UseConfig {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchConfig();
        setConfig(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load config");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { config, loading, error };
}

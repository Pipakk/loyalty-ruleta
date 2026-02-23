"use client";

import { useEffect, useState } from "react";
import type { BusinessConfig } from "@/lib/CONFIG_SCHEMA";

export type BusinessConfigResponse = {
  business: { id: string; slug: string; name: string; logo_url: string | null };
  config: BusinessConfig;
  issues: string[];
};

export function useBusinessConfig(slug: string) {
  const [data, setData] = useState<BusinessConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchConfig = async () => {
      const res = await fetch(`/api/business-config?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error");
      return json as BusinessConfigResponse;
    };
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const json = await fetchConfig();
        if (!cancelled) setData(json);
      } catch (e: unknown) {
        await new Promise((r) => setTimeout(r, 600));
        if (cancelled) return;
        try {
          const json = await fetchConfig();
          if (!cancelled) setData(json);
        } catch (e2) {
          if (!cancelled) setError(e2 instanceof Error ? e2.message : "Error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { data, loading, error };
}


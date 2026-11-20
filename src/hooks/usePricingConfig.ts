"use client";

import { useEffect, useState } from "react";
import {
  getPricingConfig,
  refreshPricingConfig,
  type ClientPricingConfig,
} from "@/lib/pricing-client";

export function usePricingConfig() {
  const [config, setConfig] = useState<ClientPricingConfig | null>(null);

  useEffect(() => {
    let active = true;
    const load = (refresh = false) => {
      const request = refresh ? refreshPricingConfig() : getPricingConfig();
      request.then((nextConfig) => {
        if (active) setConfig(nextConfig);
      }).catch(() => {
        // Mantém a última configuração válida quando a rede falha temporariamente.
      });
    };
    const onFocus = () => load(true);

    load();
    const interval = window.setInterval(() => load(true), 30_000);
    window.addEventListener("focus", onFocus);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return config;
}

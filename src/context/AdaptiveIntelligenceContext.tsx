"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  type CustomerPersona,
  type PlatformInterest,
  type BehavioralProfile,
  type PersonaStrategy,
  INITIAL_PROFILE,
  classifyPersona,
  getPersonaStrategy,
} from "@/lib/adaptive-engine";
import { usePathname } from "next/navigation";

interface AdaptiveIntelligenceContextType {
  profile: BehavioralProfile;
  persona: CustomerPersona;
  platform: PlatformInterest;
  strategy: PersonaStrategy;
  recordEvent: (
    type: "SIMULATE" | "CART_UPDATE" | "PROVINCE_SELECT" | "TUTORIAL_VIEW" | "ORDER_CREATED" | "WHATSAPP_CLICK" | "EXIT_INTENT",
    metadata?: any
  ) => void;
  showRecoveryModal: boolean;
  closeRecoveryModal: () => void;
}

const AdaptiveIntelligenceContext = createContext<AdaptiveIntelligenceContextType | undefined>(undefined);

const STORAGE_KEY = "importeasy_adaptive_profile";

export function AdaptiveIntelligenceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<BehavioralProfile>(INITIAL_PROFILE);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Carrega dados persistentes do utilizador
  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: BehavioralProfile = JSON.parse(stored);
          const updated: BehavioralProfile = {
            ...parsed,
            visitCount: (parsed.visitCount || 1) + 1,
            lastVisitTimestamp: Date.now(),
          };
          const { persona, platform, confidence } = classifyPersona(updated);
          updated.detectedPersona = persona;
          updated.detectedPlatform = platform;
          updated.confidenceScore = confidence;
          if (!cancelled) setProfile(updated);
        } else if (!cancelled) {
          setProfile({ ...INITIAL_PROFILE, lastVisitTimestamp: Date.now() });
        }
      } catch {
        if (!cancelled) setProfile(INITIAL_PROFILE);
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  // 2. Salva perfil quando é atualizado
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } catch (err) {
        console.error("Erro ao salvar perfil adaptativo:", err);
      }
    }
  }, [profile, isLoaded]);

  // 3. Medidor de Tempo no Site (Engajamento / Dwell Time)
  useEffect(() => {
    const timer = setInterval(() => {
      setProfile((prev) => {
        const newTime = prev.timeSpentSeconds + 10;
        const updated = { ...prev, timeSpentSeconds: newTime };
        const { persona, platform, confidence } = classifyPersona(updated);
        return {
          ...updated,
          detectedPersona: persona,
          detectedPlatform: platform,
          confidenceScore: confidence,
        };
      });
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // 4. Detetor Inteligente de Exit-Intent (Intenção de Abandono)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !profile.exitIntentTriggered) {
        // Só dispara se o utilizador já tiver artigos no carrinho ou tiver simulado algum link
        if (profile.cartItemCount > 0 || profile.simulatedLinksCount > 0 || profile.hasPendingOrder) {
          setShowRecoveryModal(true);
          setProfile((prev) => ({ ...prev, exitIntentTriggered: true }));
        }
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [profile]);

  // 5. Função de Registo de Ações Comportamentais (Aprendizagem da Máquina Multi-Plataforma)
  const recordEvent = useCallback(
    (
      type: "SIMULATE" | "CART_UPDATE" | "PROVINCE_SELECT" | "TUTORIAL_VIEW" | "ORDER_CREATED" | "WHATSAPP_CLICK" | "EXIT_INTENT",
      metadata?: any
    ) => {
      setProfile((prev) => {
        const next: BehavioralProfile = { ...prev };

        if (type === "SIMULATE") {
          next.simulatedLinksCount += 1;
          if (metadata?.priceUsd) next.lastSimulatedPriceUsd = Number(metadata.priceUsd);

          // Detect platform from explicit field OR fall back to URL detection
          const platField = String(metadata?.platform || "").toLowerCase();
          const platUrl = String(metadata?.url || "").toLowerCase();
          const plat = platField || platUrl;
          if (plat.includes("vinted")) {
            next.vintedCount = (next.vintedCount || 0) + 1;
          } else if (plat.includes("aliexpress") || plat.includes("ali")) {
            next.aliexpressCount = (next.aliexpressCount || 0) + 1;
          } else if (plat.includes("shein") || plat.includes("sheglam")) {
            next.sheinCount = (next.sheinCount || 0) + 1;
          } else {
            // Generic / unknown — count as SHEIN (default platform)
            next.sheinCount = (next.sheinCount || 0) + 1;
          }
        } else if (type === "CART_UPDATE") {
          next.cartItemCount = Number(metadata?.count ?? prev.cartItemCount);
          next.cartTotalKz = Number(metadata?.totalKz ?? prev.cartTotalKz);
        } else if (type === "PROVINCE_SELECT") {
          next.selectedProvince = metadata?.province || "Luanda";
        } else if (type === "TUTORIAL_VIEW") {
          next.viewedTutorial = true;
        } else if (type === "ORDER_CREATED") {
          next.hasPendingOrder = true;
          next.pendingOrderReference = metadata?.reference;
        } else if (type === "WHATSAPP_CLICK") {
          next.clickedWhatsApp = true;
        } else if (type === "EXIT_INTENT") {
          next.exitIntentTriggered = true;
        }

        const { persona, platform, confidence } = classifyPersona(next);
        next.detectedPersona = persona;
        next.detectedPlatform = platform;
        next.confidenceScore = confidence;
        return next;
      });
    },
    []
  );

  const strategy = getPersonaStrategy(profile.detectedPersona, profile.detectedPlatform, profile);

  return (
    <AdaptiveIntelligenceContext.Provider
      value={{
        profile,
        persona: profile.detectedPersona,
        platform: profile.detectedPlatform,
        strategy,
        recordEvent,
        showRecoveryModal,
        closeRecoveryModal: () => setShowRecoveryModal(false),
      }}
    >
      {children}
    </AdaptiveIntelligenceContext.Provider>
  );
}

export function useAdaptiveIntelligence() {
  const context = useContext(AdaptiveIntelligenceContext);
  if (!context) {
    throw new Error("useAdaptiveIntelligence must be used within an AdaptiveIntelligenceProvider");
  }
  return context;
}

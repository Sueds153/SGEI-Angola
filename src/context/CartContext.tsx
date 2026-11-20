"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { clientCalculatePrice } from "@/lib/pricing-client";
import { usePricingConfig } from "@/hooks/usePricingConfig";

export interface CartItem {
  id: string; // ID único (timestamp ou hash)
  title: string;
  priceUsd: number;
  priceKz: number;
  originalCurrency?: string;
  image?: string;
  platform: string; // "Shein" | "AliExpress" | "Vinted" | "Catálogo"
  sourceUrl?: string;
  variantColor?: string;
  variantSize?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  totalKz: number;
  totalUsd: number;
  itemCount: number;
  freightSavedKz: number; // Valor poupado em frete individual coletivo
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREIGHT_PER_ORDER_SAVED_KZ = 4500; // Valor economizado por aderir à mala coletiva

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const pricingConfig = usePricingConfig();

  // Carrega do localStorage no cliente
  useEffect(() => {
    const loadCart = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem("importeasy_cart");
        if (stored) {
          setItems(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Erro ao carregar carrinho:", e);
      } finally {
        setIsLoaded(true);
      }
    }, 0);
    return () => window.clearTimeout(loadCart);
  }, []);

  const pricedItems = useMemo(() => {
    if (!pricingConfig) return items;
    return items.map((item) => {
      const pricing = clientCalculatePrice(
        {
          productPrice: item.priceUsd || 0,
          productCurrency: (item.originalCurrency || "USD") as "USD" | "EUR" | "CNY" | "AOA",
          quantity: 1,
        },
        pricingConfig
      );
      const priceKz = pricing.totalCents / 100;
      return priceKz === item.priceKz ? item : { ...item, priceKz };
    });
  }, [items, pricingConfig]);

  // Salva no localStorage sempre que mudar
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("importeasy_cart", JSON.stringify(pricedItems));
      } catch (e) {
        console.error("Erro ao salvar carrinho:", e);
      }
    }
  }, [pricedItems, isLoaded]);

  const addItem = (item: Omit<CartItem, "id">) => {
    const newItem: CartItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      quantity: item.quantity || 1,
    };
    setItems((prev) => [newItem, ...prev]);
    setIsOpen(true); // Abre a mala coletiva imediatamente para dar feedback visual
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalKz = pricedItems.reduce((acc, i) => acc + i.priceKz * i.quantity, 0);
  const totalUsd = pricedItems.reduce((acc, i) => acc + (i.priceUsd || 0) * i.quantity, 0);
  const itemCount = pricedItems.reduce((acc, i) => acc + i.quantity, 0);
  const freightSavedKz = itemCount > 0 ? FREIGHT_PER_ORDER_SAVED_KZ : 0;

  return (
    <CartContext.Provider
      value={{
        items: pricedItems,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        setIsOpen,
        totalKz,
        totalUsd,
        itemCount,
        freightSavedKz,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}

"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import type { JSX } from "react";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  /** Delay in ms */
  delay?: number;
  /** Duration in ms */
  duration?: number;
  direction?: Direction;
  /** Amount the element moves when hidden (px) */
  amount?: number;
  /** If true, the element will be blurred in */
  blur?: boolean;
  /** If true, once revealed, don't un-reveal when scrolling back */
  once?: boolean;
  /** Custom inline styles */
  style?: CSSProperties;
}

/**
 * Revela o conteúdo com translate + fade (+ blur opcional) quando entra no viewport.
 * Respeita `prefers-reduced-motion`.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  duration = 700,
  direction = "up",
  amount = 22,
  blur = false,
  once = true,
  style,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const offset = (() => {
    if (!visible && direction !== "none") {
      switch (direction) {
        case "up":
          return `translate3d(0, ${amount}px, 0)`;
        case "down":
          return `translate3d(0, -${amount}px, 0)`;
        case "left":
          return `translate3d(${amount}px, 0, 0)`;
        case "right":
          return `translate3d(-${amount}px, 0, 0)`;
      }
    }
    return "translate3d(0,0,0)";
  })();

  const Component: any = Tag;
  return (
    <Component
      ref={ref as any}
      className={cn(className)}
      style={{
        ...style,
        transform: offset,
        opacity: visible ? 1 : 0,
        filter: blur && !visible ? "blur(10px)" : "blur(0)",
        transition: `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, filter ${duration + 200}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: "transform, opacity, filter",
      }}
    >
      {children}
    </Component>
  );
}

/** Revela palavra a palavra com blur + fade */
export function WordReveal({
  text,
  className,
  delay = 0,
  stagger = 60,
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: keyof JSX.IntrinsicElements;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [visible, setVisible] = useState(false);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Component: any = Tag;
  return (
    <Component ref={ref as any} className={className}>
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden={false}
          className="inline-block mr-[0.25em] align-baseline"
          style={{
            opacity: visible ? 1 : 0,
            filter: visible ? "blur(0)" : "blur(8px)",
            transform: visible ? "translate3d(0,0,0)" : "translate3d(0, 10px, 0)",
            transition: `opacity 600ms cubic-bezier(0.22, 1, 0.36, 1) ${delay + i * stagger}ms, transform 600ms cubic-bezier(0.22, 1, 0.36, 1) ${delay + i * stagger}ms, filter 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay + i * stagger}ms`,
            willChange: "transform, opacity, filter",
          }}
        >
          {w}
        </span>
      ))}
    </Component>
  );
}

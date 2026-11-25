import type { ReactNode } from "react";

/** A short, consistent entrance for route content across the storefront. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-transition">{children}</div>;
}

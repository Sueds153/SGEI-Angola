"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "1859426622080634";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: (...args: unknown[]) => void;
  }
}

function FacebookPixelInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname, searchParams]);

  return (
    <>
      <Script
        id="facebook-pixel-sdk"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
        />
      </noscript>
    </>
  );
}

export function FacebookPixel() {
  return (
    <Suspense fallback={null}>
      <FacebookPixelInner />
    </Suspense>
  );
}

// Helper functions for tracking events
export function trackEvent(eventName: string, parameters?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, parameters);
  }
}

export function trackCustomEvent(eventName: string, parameters?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", eventName, parameters);
  }
}

// E-commerce event helpers
export function trackAddToCart(value: number, currency = "AOA", contentId?: string, contentName?: string) {
  trackEvent("AddToCart", {
    value,
    currency,
    content_ids: contentId ? [contentId] : undefined,
    content_name: contentName,
  });
}

export function trackInitiateCheckout(value: number, currency = "AOA", contentIds?: string[], contentType = "product") {
  trackEvent("InitiateCheckout", {
    value,
    currency,
    content_ids: contentIds,
    content_type: contentType,
    num_items: contentIds?.length,
  });
}

export function trackPurchase(value: number, currency = "AOA", orderId?: string, contentIds?: string[], numItems?: number) {
  trackEvent("Purchase", {
    value,
    currency,
    order_id: orderId,
    content_ids: contentIds,
    num_items: numItems,
  });
}

export function trackViewContent(value: number, currency = "AOA", contentId?: string, contentName?: string, contentType = "product") {
  trackEvent("ViewContent", {
    value,
    currency,
    content_ids: contentId ? [contentId] : undefined,
    content_name: contentName,
    content_type: contentType,
  });
}

export function trackSearch(searchString: string) {
  trackEvent("Search", {
    search_string: searchString,
  });
}

export function trackContact() {
  trackEvent("Contact");
}

export function trackLead() {
  trackEvent("Lead");
}

export function trackCompleteRegistration() {
  trackEvent("CompleteRegistration");
}
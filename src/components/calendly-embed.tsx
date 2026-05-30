"use client";

import Script from "next/script";
import { useCallback, useEffect } from "react";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
      }) => void;
    };
  }
}

const calendlyUrl = "https://calendly.com/contact-slowebdesign/30min";

export function CalendlyEmbed() {
  const initializeCalendly = useCallback(() => {
    const parentElement = document.querySelector<HTMLElement>(
      ".calendly-inline-widget",
    );

    if (parentElement && window.Calendly && !parentElement.childElementCount) {
      window.Calendly.initInlineWidget({
        url: calendlyUrl,
        parentElement,
      });
    }
  }, []);

  useEffect(() => {
    initializeCalendly();
  }, [initializeCalendly]);

  return (
    <>
      <div
        className="calendly-inline-widget"
        data-url={calendlyUrl}
        style={{ minWidth: "320px", height: "700px" }}
      />
      <Script
        type="text/javascript"
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
        async
        onLoad={initializeCalendly}
      />
    </>
  );
}

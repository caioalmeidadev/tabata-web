"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DISMISSED_KEY = "tabata.pwaDismissed";

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standaloneMatch =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;

    setIsStandalone(standaloneMatch);

    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice =
      /iphone|ipad|ipod/.test(ua) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIos(iosDevice);

    try {
      const savedDismiss = window.localStorage.getItem(DISMISSED_KEY);
      if (savedDismiss === "1") {
        setIsDismissed(true);
      }
    } catch {
      // Ignore storage access errors
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
        return true;
      }
    } catch {
      // Ignore prompt errors
    }
    return false;
  };

  const dismissBanner = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(DISMISSED_KEY, "1");
      } catch {
        // Ignore storage errors
      }
    }
  };

  const canInstallNative = !isStandalone && deferredPrompt !== null;
  const showIosGuide = !isStandalone && isIos && !deferredPrompt;

  return {
    isStandalone,
    canInstallNative,
    showIosGuide,
    isDismissed,
    triggerInstall,
    dismissBanner,
  };
}

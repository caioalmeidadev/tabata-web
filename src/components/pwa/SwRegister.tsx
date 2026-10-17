"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function SwRegister() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Ignore SW registration errors in restricted environments
      });
    }

    // Track online/offline status
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    updateOnlineStatus();
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#FFFF2E]/40 bg-[#171717]/95 px-4 py-1.5 text-xs font-condensed font-bold uppercase tracking-widest text-[#FFFF2E] shadow-xl backdrop-blur-md"
    >
      <WifiOff className="h-3.5 w-3.5" />
      <span>Modo Offline Ativo</span>
    </div>
  );
}

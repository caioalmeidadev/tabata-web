"use client";

import { Download, Share, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/use-pwa-install";

export function InstallPwaBanner() {
  const {
    isStandalone,
    canInstallNative,
    showIosGuide,
    isDismissed,
    triggerInstall,
    dismissBanner,
  } = usePwaInstall();

  if (isStandalone || isDismissed || (!canInstallNative && !showIosGuide)) {
    return null;
  }

  return (
    <section
      aria-label="Instalar aplicativo TabataPro"
      className="relative flex flex-col justify-between gap-4 rounded-2xl border border-[#249CFF]/35 bg-gradient-to-r from-[#171717] via-[#1c2430] to-[#171717] p-4 sm:flex-row sm:items-center md:p-5"
    >
      <div className="flex items-start gap-3.5 sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#249CFF]/20 text-[#249CFF]">
          <Smartphone className="h-6 w-6" />
        </div>

        <div className="flex flex-col pr-6 sm:pr-0">
          <span className="font-display text-lg uppercase tracking-wide text-white">
            Instale o App TabataPro
          </span>
          {canInstallNative ? (
            <p className="text-xs text-[#9CA3AF] md:text-sm">
              Adicione à sua tela inicial para acesso em 1 toque, tela cheia e
              funcionamento 100% offline.
            </p>
          ) : (
            <p className="flex flex-wrap items-center gap-1 text-xs text-[#9CA3AF] md:text-sm">
              No Safari, toque em{" "}
              <span className="inline-flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5 font-semibold text-white">
                <Share className="h-3.5 w-3.5 text-[#249CFF]" /> Compartilhar
              </span>{" "}
              e selecione{" "}
              <span className="font-semibold text-white">
                &ldquo;Adicionar à Tela de Início&rdquo;
              </span>
              .
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {canInstallNative && (
          <Button
            size="sm"
            onClick={triggerInstall}
            className="bg-[#249CFF] text-[#0A0A0A] hover:bg-[#4eb0ff]"
          >
            <Download className="h-4 w-4" />
            Instalar App
          </Button>
        )}

        <button
          type="button"
          onClick={dismissBanner}
          aria-label="Fechar aviso de instalação"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-white/10 hover:text-white sm:static cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

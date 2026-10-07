"use client";

import { createElement, useEffect } from "react";

/**
 * Player de vídeo VSL da Wistia (web component). Carrega os scripts oficiais
 * uma única vez e renderiza o elemento <wistia-player>.
 */
export function WistiaVsl({
  mediaId,
  aspect = "0.5625", // 9:16 (vertical)
}: {
  mediaId: string;
  aspect?: string;
}) {
  useEffect(() => {
    const add = (src: string, asModule?: boolean) => {
      if (document.querySelector(`script[src="${src}"]`)) return;
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      if (asModule) s.type = "module";
      document.head.appendChild(s);
    };
    add("https://fast.wistia.com/player.js");
    add(`https://fast.wistia.com/embed/${mediaId}.js`, true);
  }, [mediaId]);

  // createElement evita precisar declarar o custom element no JSX/TS.
  return createElement("wistia-player", {
    "media-id": mediaId,
    aspect,
  });
}

import type { MetadataRoute } from "next";

/**
 * Manifesto web (PWA). Deixa o app "instalável" no futuro.
 * Nesta versão não usamos service worker (offline) para manter o MVP
 * simples; isso pode ser adicionado na Fase 2.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agenda — Agendamento automotivo",
    short_name: "Agenda",
    description:
      "Agendamento para lava-jatos, detalhamento e estética automotiva.",
    start_url: "/inicio",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0a84ff",
    lang: "pt-BR",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}

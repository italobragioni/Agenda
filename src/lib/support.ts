/** Link do WhatsApp de suporte da Carvi (dono do sistema). */
export const SUPPORT_WHATSAPP_URL = "https://wa.me/message/SHD2D5BYJKLYJ1";

/**
 * Mensagem de boas-vindas/acompanhamento que o admin envia ao dono de um
 * estabelecimento no WhatsApp. Usa o primeiro nome quando disponível.
 */
export function onboardingWhatsappMessage(fullName?: string | null): string {
  const firstName = (fullName ?? "").trim().split(/\s+/)[0] || "";
  const saudacao = firstName ? `Oi, ${firstName}! Tudo bem?` : "Oi! Tudo bem?";
  return (
    `${saudacao} Aqui é o Ítalo, criador da Carvi 👋\n\n` +
    "Vi que você começou a usar a plataforma e queria saber como está sendo sua experiência até agora. Conseguiu configurar sua agenda e cadastrar seus serviços direitinho?\n\n" +
    "Se tiver qualquer dúvida ou sentir falta de alguma coisa, pode me falar por aqui mesmo. Quero acompanhar de perto quem está usando a Carvi e ajudar no que precisar. 🚗💙\n\n" +
    "Qualquer coisa, é só me chamar por aqui!"
  );
}

/**
 * Mensagem de CONVERSÃO para quem criou a conta mas ainda não assinou um plano.
 * Objetivo: mostrar valor, remover risco e levar a pessoa a assinar hoje.
 */
export function conversionWhatsappMessage(fullName?: string | null): string {
  const firstName = (fullName ?? "").trim().split(/\s+/)[0] || "";
  const saudacao = firstName ? `Oi, ${firstName}! Tudo bem?` : "Oi! Tudo bem?";
  return (
    `${saudacao} Aqui é o Ítalo, criador da Carvi 👋\n\n` +
    "Vi que você criou sua conta na Carvi, mas ainda não escolheu um plano pra deixar tudo funcionando de verdade. 🙌\n\n" +
    "Com a Carvi, o seu cliente agenda sozinho pelo seu link, 24h por dia, sem lotar o seu WhatsApp — e você acompanha a agenda e o faturamento na palma da mão.\n\n" +
    "Os planos começam em R$ 19,90/mês (menos que uma lavagem simples), sem fidelidade, no cartão ou Pix, e o acesso libera na hora. Um único cliente que você deixaria de perder já paga o plano. 🚗💙\n\n" +
    "Quer que eu te ajude a escolher o plano ideal e deixar sua agenda no ar ainda hoje? É só me responder por aqui que eu te guio no passo a passo. 😊"
  );
}

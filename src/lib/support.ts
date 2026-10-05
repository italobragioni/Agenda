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
    "Vi que você começou a testar a plataforma e queria saber como está sendo sua experiência até agora. Conseguiu configurar sua agenda e cadastrar seus serviços direitinho?\n\n" +
    "Se tiver qualquer dúvida ou sentir falta de alguma coisa, pode me falar por aqui mesmo. Quero acompanhar de perto quem está começando a usar a Carvi e ajudar no que precisar. 🚗💙\n\n" +
    "Aproveita bem esses 7 dias grátis e depois me conta o que achou!"
  );
}

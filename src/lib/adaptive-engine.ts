/**
 * ImportEasy Adaptive Behavioral Intelligence Engine (Multi-Platform Machine Learning Classifier)
 * 
 * Modela os padrões reais de comportamento dos clientes em Angola para:
 * - SHEIN (Moda feminina, vestidos, conjuntos, calçado)
 * - ALIEXPRESS (Eletrónica, gadgets, relógios, perucas, ferramentas, bijuteria)
 * - VINTED (iPhones seminovos da Europa, ténis/sapatilhas de marca, artigos de luxo originais)
 * 
 * Personas:
 * 1. FIRST_TIME_SKEPTIC: Desconfiado(a), primeira visita, medo de burla, busca referências e provas físicas.
 * 2. BARGAIN_HUNTER: Procura frete grátis, compra em grupo (Mala Coletiva), partilha com amigos no WhatsApp.
 * 3. RESELLER_PRO: Lojista / sacoleira / revendedora informal, simula 3+ peças, pedidos de valor alto, foco em margem de lucro.
 * 4. PROVINCE_BUYER: Fora de Luanda (Benguela, Huambo, Lubango, etc.), foco em segurança do despacho e tempo de envio.
 * 5. PAYMENT_HESITATOR: Gerou referência ou tem artigos no carrinho; pode precisar de ajuda para concluir.
 */

export type CustomerPersona =
  | "FIRST_TIME_SKEPTIC"
  | "BARGAIN_HUNTER"
  | "RESELLER_PRO"
  | "PROVINCE_BUYER"
  | "PAYMENT_HESITATOR";

export type PlatformInterest = "SHEIN" | "ALIEXPRESS" | "VINTED" | "ALL";

export interface BehavioralProfile {
  visitCount: number;
  lastVisitTimestamp: number;
  timeSpentSeconds: number;
  simulatedLinksCount: number;
  lastSimulatedPriceUsd?: number;
  cartItemCount: number;
  cartTotalKz: number;
  selectedProvince?: string;
  hasPendingOrder: boolean;
  pendingOrderReference?: string;
  viewedTutorial: boolean;
  clickedWhatsApp: boolean;
  exitIntentTriggered: boolean;
  detectedPersona: CustomerPersona;
  detectedPlatform: PlatformInterest;
  sheinCount: number;
  aliexpressCount: number;
  vintedCount: number;
  confidenceScore: number; // 0 a 100
}

export const INITIAL_PROFILE: BehavioralProfile = {
  visitCount: 1,
  lastVisitTimestamp: Date.now(),
  timeSpentSeconds: 0,
  simulatedLinksCount: 0,
  cartItemCount: 0,
  cartTotalKz: 0,
  selectedProvince: "Luanda",
  hasPendingOrder: false,
  viewedTutorial: false,
  clickedWhatsApp: false,
  exitIntentTriggered: false,
  detectedPersona: "FIRST_TIME_SKEPTIC",
  detectedPlatform: "ALL",
  sheinCount: 0,
  aliexpressCount: 0,
  vintedCount: 0,
  confidenceScore: 50,
};

/**
 * Classificador Heurístico / Scoring Matrix:
 * Analisa o vetor de características comportamentais e classifica a persona e plataforma de maior interesse.
 */
export function classifyPersona(profile: BehavioralProfile): {
  persona: CustomerPersona;
  platform: PlatformInterest;
  confidence: number;
} {
  const scores: Record<CustomerPersona, number> = {
    PAYMENT_HESITATOR: 0,
    RESELLER_PRO: 0,
    PROVINCE_BUYER: 0,
    BARGAIN_HUNTER: 0,
    FIRST_TIME_SKEPTIC: 0,
  };

  // 1. Condição Forte de Hesitante de Pagamento
  if (profile.hasPendingOrder && profile.pendingOrderReference) {
    scores.PAYMENT_HESITATOR += 95;
  } else if (profile.cartItemCount > 0 && profile.timeSpentSeconds > 90) {
    scores.PAYMENT_HESITATOR += 65;
  }

  // 2. Condição de Revendedora / Sacoleira (Múltiplas simulações, carrinho grande, valor alto)
  if (profile.simulatedLinksCount >= 3) {
    scores.RESELLER_PRO += 40 + Math.min(profile.simulatedLinksCount * 10, 40);
  }
  if (profile.cartItemCount >= 3 || profile.cartTotalKz > 60000) {
    scores.RESELLER_PRO += 50;
  }
  if (profile.lastSimulatedPriceUsd && profile.lastSimulatedPriceUsd > 80) {
    scores.RESELLER_PRO += 30;
  }

  // 3. Condição de Província (Fora de Luanda)
  if (profile.selectedProvince && profile.selectedProvince !== "Luanda") {
    scores.PROVINCE_BUYER += 85;
  }

  // 4. Condição de Caçadora de Frete Grátis / Compras em Grupo
  if (profile.cartItemCount === 1 || profile.cartItemCount === 2) {
    scores.BARGAIN_HUNTER += 45;
  }
  if (profile.simulatedLinksCount === 1 || profile.simulatedLinksCount === 2) {
    scores.BARGAIN_HUNTER += 30;
  }

  // 5. Condição de Primeira Vez Desconfiada
  if (profile.visitCount === 1 && !profile.hasPendingOrder) {
    scores.FIRST_TIME_SKEPTIC += 40;
    if (profile.viewedTutorial) scores.FIRST_TIME_SKEPTIC += 25;
    if (profile.timeSpentSeconds < 60 && profile.simulatedLinksCount <= 1) scores.FIRST_TIME_SKEPTIC += 20;
  }

  // Seleciona a persona mais provável
  let topPersona: CustomerPersona = "FIRST_TIME_SKEPTIC";
  let maxScore = -1;

  for (const [p, score] of Object.entries(scores) as [CustomerPersona, number][]) {
    if (score > maxScore) {
      maxScore = score;
      topPersona = p;
    }
  }

  // Determina preferência de plataforma (SHEIN vs AliExpress vs Vinted)
  let topPlatform: PlatformInterest = "ALL";
  const { sheinCount, aliexpressCount, vintedCount } = profile;
  if (vintedCount > sheinCount && vintedCount > aliexpressCount) {
    topPlatform = "VINTED";
  } else if (aliexpressCount > sheinCount && aliexpressCount > vintedCount) {
    topPlatform = "ALIEXPRESS";
  } else if (sheinCount > 0) {
    topPlatform = "SHEIN";
  }

  const confidence = Math.min(100, Math.max(30, maxScore));
  return { persona: topPersona, platform: topPlatform, confidence };
}

/**
 * Gatilhos Adaptativos e Copy Personalizado considerando Persona e Plataforma
 */
export interface PersonaStrategy {
  badgeText: string;
  bannerTitle: string;
  bannerDescription: string;
  ctaText: string;
  ctaHref: string;
  whatsAppPrompt: string;
  floatingTooltip: string;
  urgencyLevel: "HIGH" | "MEDIUM" | "REASSURING";
}

export function getPersonaStrategy(
  persona: CustomerPersona,
  platform: PlatformInterest,
  profile: BehavioralProfile
): PersonaStrategy {
  // Se houver foco evidente em Vinted (iPhones / Roupas da Europa)
  if (platform === "VINTED" && persona !== "PAYMENT_HESITATOR") {
    return {
      badgeText: "Especialista Vinted Europa (França & Portugal)",
      bannerTitle: "Quer importar iPhones originais ou sapatilhas da Europa?",
      bannerDescription:
        "A equipa verifica os detalhes do anúncio e confirma a possibilidade de compra, envio e custos antes do pagamento.",
      ctaText: "Simular Link da Vinted",
      ctaHref: "/importar",
      whatsAppPrompt: "Olá ImportEasy! Tenho um artigo/iPhone na Vinted Europa e gostaria de encomendar para Angola.",
      floatingTooltip: "Vinted: confirme os detalhes do anúncio e do envio antes de avançar.",
      urgencyLevel: "MEDIUM",
    };
  }

  // Se houver foco evidente em AliExpress (Eletrónica / Gadgets / Revenda)
  if (platform === "ALIEXPRESS" && persona !== "PAYMENT_HESITATOR") {
    return {
      badgeText: "Especialista AliExpress (China → Luanda)",
      bannerTitle: "Eletrónica, relógios, perucas e ferramentas do AliExpress!",
      bannerDescription:
        "Não arrisque perder encomendas nos correios. Tratamos da desalfandegagem no Aeroporto 4 de Fevereiro e entregamos na sua mão.",
      ctaText: "Simular Link do AliExpress",
      ctaHref: "/importar",
      whatsAppPrompt: "Olá ImportEasy! Quero encomendar produtos do AliExpress sem ter problemas com a alfândega em Luanda.",
      floatingTooltip: "Confirma custos e possibilidade de envio do teu artigo antes de pagar.",
      urgencyLevel: "MEDIUM",
    };
  }

  // Estratégias por Persona
  switch (persona) {
    case "PAYMENT_HESITATOR":
      return {
        badgeText: "Apoio ao teu pedido",
        bannerTitle: "Ainda tens a tua encomenda pendente de confirmação!",
        bannerDescription: profile.pendingOrderReference
          ? `O teu pedido #${profile.pendingOrderReference} está registado. Consulta o estado e confirma as instruções de pagamento antes de enviar o comprovativo.`
          : "Tens artigos no carrinho. Se precisares, a equipa pode esclarecer dúvidas sobre disponibilidade, custos e próximos passos.",
        ctaText: profile.pendingOrderReference ? "Ver o meu pedido" : "Rever o carrinho",
        ctaHref: profile.pendingOrderReference ? `/pedido/${profile.pendingOrderReference}` : "/carrinho",
        whatsAppPrompt: `Olá ImportEasy! Gostaria de confirmar o pagamento do meu pedido ${profile.pendingOrderReference || "no carrinho"} via Multicaixa Express.`,
        floatingTooltip: "Precisas de ajuda com o pedido ou com as instruções de pagamento?",
        urgencyLevel: "REASSURING",
      };

    case "RESELLER_PRO":
      return {
        badgeText: "Canal Especial para Revendedores & Lojistas",
        bannerTitle: "Compras em Quantidade (SHEIN ou AliExpress)? Ganha Desconto!",
        bannerDescription:
          "Se revendes roupas, bijuteria, perucas ou eletrónica em Luanda, consolidamos os teus pedidos com frete reduzido por Kg e despacho VIP.",
        ctaText: "Falar com Apoio VIP Revenda",
        ctaHref: "https://wa.me/244922058136?text=Ol%C3%A1%20ImportEasy!%20Revendo%20artigos%20em%20Angola%20e%20quero%20condi%C3%A7%C3%B5es%20especiais%20de%20frete.",
        whatsAppPrompt: "Olá ImportEasy! Sou revendedor(a) em Angola e tenho vários artigos para importar da SHEIN/AliExpress. Que condições têm para atacado?",
        floatingTooltip: "Revenda? Clica aqui para condições especiais de frete com desconto por atacado!",
        urgencyLevel: "MEDIUM",
      };

    case "PROVINCE_BUYER":
      const prov = profile.selectedProvince || "Província";
      return {
        badgeText: `Envio Seguro para ${prov}`,
        bannerTitle: `Entregamos compras da SHEIN, AliExpress e Vinted em ${prov}!`,
        bannerDescription:
          "Desalfandegamos no Aeroporto 4 de Fevereiro e despachamos para a tua morada com guia e rastreio passo a passo.",
        ctaText: "Simular Encomenda para " + prov,
        ctaHref: "/importar",
        whatsAppPrompt: `Olá ImportEasy! Sou de ${prov} e gostaria de confirmar como funciona a entrega e o prazo para a minha cidade.`,
        floatingTooltip: `Envios diretos para ${prov}! Tens alguma dúvida sobre o prazo de entrega?`,
        urgencyLevel: "MEDIUM",
      };

    case "BARGAIN_HUNTER":
      return {
        badgeText: "Opção de Mala Coletiva",
        bannerTitle: "Junta artigos no mesmo pedido",
        bannerDescription:
          "Podes solicitar a consolidação de artigos da SHEIN, AliExpress ou Vinted. A equipa confirma disponibilidade e custos aplicáveis ao teu pedido.",
        ctaText: "Adicionar à Mala Coletiva",
        ctaHref: "/carrinho",
        whatsAppPrompt: "Olá ImportEasy! Gostaria de saber as opções e custos para juntar artigos no mesmo pedido.",
        floatingTooltip: "Junta artigos e pergunta à equipa sobre as opções de envio.",
        urgencyLevel: "MEDIUM",
      };

    case "FIRST_TIME_SKEPTIC":
    default:
      return {
        badgeText: "Apoio para encomendas em Angola",
        bannerTitle: "Importe da SHEIN, AliExpress e Vinted sem complicações!",
        bannerDescription:
          "A equipa confirma o valor total, as instruções de pagamento e as opções de entrega antes de avançar com a encomenda.",
        ctaText: "Como Funciona (3 Passos)",
        ctaHref: "/como-funciona",
        whatsAppPrompt: "Olá ImportEasy! É a minha primeira vez no site e quero tirar uma dúvida sobre encomendas da SHEIN, AliExpress ou Vinted.",
        floatingTooltip: "Primeira vez aqui? Podes pagar por Express ou Referência oficial e acompanhar tudo pelo site!",
        urgencyLevel: "REASSURING",
      };
  }
}

export interface CommunityPost {
  id: number;
  user: string;
  avatar: string;
  location: string;
  product: string;
  platform: "SHEIN" | "VINTED" | "ALIEXPRESS" | "ZARA" | "IMPORTEASY";
  category: string;
  message: string;
  likes: number;
  timeAgo: string;
  verified: boolean;
  status: "ENTREGUE" | "EM_TRANSITO" | "PENDENTE" | "EM_ANALISE" | "PERGUNTA";
  ref: string;
  isOwn?: boolean;
}

export function generateInitialsAvatar(name: string, seed: number): string {
  const initials = name
    .split(/[-_\s]+/)
    .map((w) => w[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  const hues = [160, 195, 215, 25, 45, 280]; // Tons sóbrios (esmeralda, azul petróleo, marrom suave, ardósia)
  const hue = hues[seed % hues.length];
  const bg = `hsl(${hue}, 40%, 30%)`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="50" fill="${bg}"/><text x="50" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="600" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials || "IE"}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 1,
    user: "Maria Fernanda",
    avatar: generateInitialsAvatar("Maria Fernanda", 1),
    location: "Luanda, Talatona",
    product: "Vestido Midi Plissado",
    platform: "SHEIN",
    category: "Moda",
    message: "Recebi a encomenda da SHEIN em Talatona. O tecido corresponde às fotografias do site e o acabamento é bom. O processo de desalfandegamento foi tratado diretamente pela equipa e a entrega demorou 16 dias úteis.",
    likes: 24,
    timeAgo: "há 2 horas",
    verified: true,
    status: "ENTREGUE",
    ref: "IE-84920",
  },
  {
    id: 2,
    user: "João Pedro",
    avatar: generateInitialsAvatar("João Pedro", 2),
    location: "Benguela",
    product: "Casaco de Lã Vintage",
    platform: "VINTED",
    category: "Moda",
    message: "Primeira encomenda feita na Vinted. O valor com a proteção do comprador foi respeitado na simulação em Kwanzas. A peça chegou bem acondicionada em Benguela sem qualquer taxa adicional de alfândega.",
    likes: 19,
    timeAgo: "há 5 horas",
    verified: true,
    status: "ENTREGUE",
    ref: "IE-84887",
  },
  {
    id: 3,
    user: "Ana Silva",
    avatar: generateInitialsAvatar("Ana Silva", 3),
    location: "Luanda, Kilamba",
    product: "Carregador Rápido 65W GaN",
    platform: "ALIEXPRESS",
    category: "Tech",
    message: "A encomenda do AliExpress chegou ontem a Luanda. Fiz o pagamento por Multicaixa Express e o comprovativo foi confirmado no mesmo dia. Funciona perfeitamente no portátil e no telemóvel.",
    likes: 31,
    timeAgo: "há 1 dia",
    verified: true,
    status: "ENTREGUE",
    ref: "IE-84732",
  },
  {
    id: 4,
    user: "Carlos Eduardo",
    avatar: generateInitialsAvatar("Carlos Eduardo", 4),
    location: "Huambo",
    product: "Sapatilhas Desportivas",
    platform: "ALIEXPRESS",
    category: "Calçados",
    message: "O código de rastreio atualizou para 'Em trânsito para Angola'. A equipa no WhatsApp confirmou que a carga já está no lote aéreo desta semana. Aguardo a chegada ao Huambo.",
    likes: 12,
    timeAgo: "há 1 dia",
    verified: true,
    status: "EM_TRANSITO",
    ref: "IE-84615",
  },
  {
    id: 5,
    user: "Carla Nascimento",
    avatar: generateInitialsAvatar("Carla Nascimento", 5),
    location: "Luanda, Maianga",
    product: "Conjunto de Malas para Viagem",
    platform: "SHEIN",
    category: "Bolsas",
    message: "Segunda vez que utilizo o serviço. A mala coletiva permitiu poupar nos portes internacionais. Entrega realizada na morada indicada na Maianga sem complicações.",
    likes: 27,
    timeAgo: "há 2 dias",
    verified: true,
    status: "ENTREGUE",
    ref: "IE-84501",
  },
  {
    id: 6,
    user: "Pedro Miguel",
    avatar: generateInitialsAvatar("Pedro Miguel", 6),
    location: "Lubango",
    product: "Blusão de Pele Segunda Mão",
    platform: "VINTED",
    category: "Moda",
    message: "Artigo adquirido na Vinted Europa. O vendedor demorou dois dias a expedir para o entreposto europeu, mas após o embarque aéreo a entrega decorreu conforme a estimativa comunicada.",
    likes: 15,
    timeAgo: "há 3 dias",
    verified: true,
    status: "ENTREGUE",
    ref: "IE-84392",
  },
  {
    id: 7,
    user: "Beatriz Almeida",
    avatar: generateInitialsAvatar("Beatriz Almeida", 7),
    location: "Luanda, Belas",
    product: "Conjunto de Pincéis e Acessórios",
    platform: "SHEIN",
    category: "Beleza",
    message: "Submeti o link no simulador, transferi o valor total em Kwanzas e acompanhei o estado pelo painel do cliente. Tudo transparente e sem custos surpresa na receção.",
    likes: 18,
    timeAgo: "há 4 dias",
    verified: true,
    status: "ENTREGUE",
    ref: "IE-84210",
  },
  {
    id: 8,
    user: "Filipe Domingos",
    avatar: generateInitialsAvatar("Filipe Domingos", 8),
    location: "Cabinda",
    product: "Cabo HDMI 4K e Adaptador USB-C",
    platform: "ALIEXPRESS",
    category: "Tech",
    message: "Tinha dúvidas sobre envios para Cabinda. O apoio ao cliente esclareceu a rota de ligação após Luanda. A mercadoria chegou em boas condições.",
    likes: 14,
    timeAgo: "há 5 dias",
    verified: true,
    status: "ENTREGUE",
    ref: "IE-84088",
  },
];

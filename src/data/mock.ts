import type { Attachment, Call, Channel, DirectThread, Message, Person } from './types'

// ---------------------------------------------------------------------------
// Conjuntos Unsplash curados (IDs já verificados no monorepo).
// ---------------------------------------------------------------------------

const IMG: Record<string, string[]> = {
  work: [
    '1497366216548-37526070297c',
    '1497366811353-6870744d04b2',
    '1542744173-8e7e53415bb0',
    '1568992687947-868a62a9f521',
    '1521737711867-e3b97375f902',
    '1504384308090-c894fdcc538d',
    '1560264280-88b68371db39',
    '1486312338219-ce68d2c6f44d',
    '1521791136064-7986c2920216',
    '1560472354-b33ff0c44a43',
    '1516321318423-f06f85e504b3',
    '1600880292203-757bb62b4baf',
  ],
  people: [
    '1500648767791-00dcc994a43e',
    '1494790108377-be9c29b29330',
    '1507003211169-0a1dd7228f2d',
    '1438761681033-6461ffad8d80',
    '1633332755192-727a05c4013d',
    '1573496359142-b8d87734a5a2',
  ],
}

function imgHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function imgCategory(seed: string): string {
  const s = seed.toLowerCase()
  if (/author|avatar|member|people|person|profile|staff|team|user/.test(s)) return 'people'
  return 'work'
}

function unsplash(id: string, w: number, h: number): string {
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=70&auto=format`
}

/** URL determinística por seed — o mesmo seed sempre devolve a mesma foto. */
export function chImage(seed: string, w = 960, h = 640): string {
  const ids = IMG[imgCategory(seed)]
  return unsplash(ids[imgHash('ch-' + seed) % ids.length], w, h)
}

const av = (seed: string) => unsplash(IMG.people[imgHash('ch-av-' + seed) % IMG.people.length], 120, 120)

// ---------------------------------------------------------------------------
// Relógio da simulação: as conversas são ancoradas no "agora" para que a
// timeline sempre mostre hoje / ontem, e não uma data congelada de 2026.
// ---------------------------------------------------------------------------

const NOW = new Date()

/** ISO de `daysAgo` dias atrás, no horário `h:m`. */
function at(daysAgo: number, h: number, m: number): string {
  const d = new Date(NOW)
  d.setDate(d.getDate() - daysAgo)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

/** ISO de `n` minutos atrás — usado no "visto por último". */
function minsAgo(n: number): string {
  return new Date(NOW.getTime() - n * 60_000).toISOString()
}

/** Dia (YYYY-MM-DD) em que os dados foram semeados. */
export const SEEDED_ON = NOW.toISOString().slice(0, 10)

// ---------------------------------------------------------------------------
// Pessoas — a de id 1 é a conta demo (você).
// ---------------------------------------------------------------------------

export const CURRENT_USER_ID = 1

export const PEOPLE: Person[] = [
  {
    id: 1,
    name: 'Marina Alencar',
    handle: 'marina',
    role: 'Gerente de produto',
    avatar: av('marina'),
    presence: 'online',
    timezone: 'America/Sao_Paulo',
    lastSeenAt: minsAgo(0),
  },
  {
    id: 2,
    name: 'Rafael Duarte',
    handle: 'rafael',
    role: 'Líder técnico',
    avatar: av('rafael'),
    presence: 'online',
    timezone: 'America/Sao_Paulo',
    lastSeenAt: minsAgo(3),
  },
  {
    id: 3,
    name: 'Bianca Correia',
    handle: 'bianca',
    role: 'Designer de produto',
    avatar: av('bianca'),
    presence: 'ausente',
    timezone: 'America/Sao_Paulo',
    lastSeenAt: minsAgo(24),
  },
  {
    id: 4,
    name: 'Tiago Nakamura',
    handle: 'tiago',
    role: 'Engenheiro de back-end',
    avatar: av('tiago'),
    presence: 'ocupado',
    timezone: 'America/Recife',
    lastSeenAt: minsAgo(7),
  },
  {
    id: 5,
    name: 'Larissa Fontes',
    handle: 'larissa',
    role: 'Analista de dados',
    avatar: av('larissa'),
    presence: 'online',
    timezone: 'Europe/Lisbon',
    lastSeenAt: minsAgo(1),
  },
  {
    id: 6,
    name: 'Otávio Bastos',
    handle: 'otavio',
    role: 'Suporte ao cliente',
    avatar: av('otavio'),
    presence: 'offline',
    timezone: 'America/Sao_Paulo',
    lastSeenAt: minsAgo(190),
  },
  {
    id: 7,
    name: 'Camila Prado',
    handle: 'camila',
    role: 'Head de marketing',
    avatar: av('camila'),
    presence: 'online',
    timezone: 'America/Sao_Paulo',
    lastSeenAt: minsAgo(2),
  },
  {
    id: 8,
    name: 'Henrique Sales',
    handle: 'henrique',
    role: 'Qualidade',
    avatar: av('henrique'),
    presence: 'ausente',
    timezone: 'America/Manaus',
    lastSeenAt: minsAgo(46),
  },
]

// ---------------------------------------------------------------------------
// Canais
// ---------------------------------------------------------------------------

export const CHANNELS: Channel[] = [
  {
    id: 1,
    slug: 'geral',
    name: 'geral',
    topic: 'Avisos que valem para todo mundo',
    description:
      'Canal aberto a toda a empresa. Use para avisos, combinados de agenda e qualquer coisa que não caiba em um canal de time.',
    private: false,
    memberIds: [1, 2, 3, 4, 5, 6, 7, 8],
    unread: 0,
    muted: false,
    responsive: false,
  },
  {
    id: 2,
    slug: 'produto',
    name: 'produto',
    topic: 'Descoberta, roadmap e decisões de escopo',
    description:
      'Onde as decisões de produto acontecem. Pesquisa, priorização e o que entra em cada versão. Decisão fechada aqui vira card no board.',
    private: false,
    memberIds: [1, 2, 3, 4, 5, 7],
    unread: 3,
    muted: false,
    responsive: true,
  },
  {
    id: 3,
    slug: 'engenharia',
    name: 'engenharia',
    topic: 'Deploys, incidentes e revisão de código',
    description:
      'Time de engenharia. Alertas de deploy, acompanhamento de incidente e as discussões técnicas que precisam de contexto compartilhado.',
    private: false,
    memberIds: [1, 2, 4, 8],
    unread: 0,
    muted: false,
    responsive: true,
  },
  {
    id: 4,
    slug: 'design',
    name: 'design',
    topic: 'Críticas, protótipos e o design system',
    description:
      'Crítica de design, evolução do design system e tudo que precisa de olhos antes de virar tela. Peça o contexto junto do link.',
    private: false,
    memberIds: [1, 3, 7, 8],
    unread: 0,
    muted: false,
    responsive: false,
  },
  {
    id: 5,
    slug: 'lancamento-2-4',
    name: 'lançamento 2.4',
    topic: 'Coordenação da virada da versão 2.4',
    description:
      'Canal temporário para a versão 2.4: checklist, riscos e a decisão de subir ou adiar. Fecha quando a versão estiver no ar.',
    private: true,
    memberIds: [1, 2, 7, 8],
    unread: 2,
    muted: false,
    responsive: false,
  },
  {
    id: 6,
    slug: 'suporte',
    name: 'suporte',
    topic: 'Tickets escalados e contas em risco',
    description:
      'Chamados que passaram do primeiro nível e precisam de alguém de produto ou engenharia. Sempre com o número do ticket.',
    private: false,
    memberIds: [1, 4, 5, 6],
    unread: 5,
    muted: true,
    responsive: true,
  },
]

// ---------------------------------------------------------------------------
// Mensagens diretas
// ---------------------------------------------------------------------------

export const DIRECT_THREADS: DirectThread[] = [
  { id: 1, personId: 2, unread: 0, lastMessageAt: at(1, 16, 24) },
  { id: 2, personId: 3, unread: 2, lastMessageAt: at(0, 10, 3) },
  { id: 3, personId: 5, unread: 0, lastMessageAt: at(2, 11, 21) },
  { id: 4, personId: 6, unread: 1, lastMessageAt: at(0, 9, 12) },
]

// ---------------------------------------------------------------------------
// Anexos
// ---------------------------------------------------------------------------

const ATT_RESUMO: Attachment = {
  id: 1,
  name: 'Resumo do trimestre — Q1',
  kind: 'link',
  url: 'https://exemplo.elo.app/resumo-q1',
  sizeKb: 0,
}

const ATT_CONVITE: Attachment = {
  id: 2,
  name: 'convite-time-v1.png',
  kind: 'image',
  url: chImage('anexo-convite', 960, 640),
  sizeKb: 412,
  width: 960,
  height: 640,
}

const ATT_ESPACAMENTO: Attachment = {
  id: 3,
  name: 'espacamento-formulario.png',
  kind: 'image',
  url: chImage('anexo-formulario', 960, 640),
  sizeKb: 388,
  width: 960,
  height: 640,
}

const ATT_POSTMORTEM: Attachment = {
  id: 4,
  name: 'post-mortem-fila-email.pdf',
  kind: 'file',
  url: '#',
  sizeKb: 946,
}

const ATT_CSV: Attachment = {
  id: 5,
  name: 'exportacao-com-erro.csv',
  kind: 'file',
  url: '#',
  sizeKb: 27,
}

const ATT_CARD: Attachment = {
  id: 6,
  name: 'card-plano-sem-selo.png',
  kind: 'image',
  url: chImage('anexo-card-plano', 960, 640),
  sizeKb: 274,
  width: 960,
  height: 640,
}

// ---------------------------------------------------------------------------
// Mensagens
// ---------------------------------------------------------------------------

interface Draft {
  id: number
  ch?: number
  dm?: number
  by: number
  at: string
  body: string
  parent?: number
  reactions?: [string, number[]][]
  attachments?: Attachment[]
  pinned?: boolean
  editedAt?: string
}

function build(list: Draft[]): Message[] {
  return list.map((d) => ({
    id: d.id,
    channelId: d.ch ?? null,
    dmId: d.dm ?? null,
    authorId: d.by,
    body: d.body,
    createdAt: d.at,
    editedAt: d.editedAt ?? null,
    parentId: d.parent ?? null,
    reactions: (d.reactions ?? []).map(([emoji, personIds]) => ({ emoji, personIds })),
    attachments: d.attachments ?? [],
    pinned: d.pinned ?? false,
  }))
}

export const MESSAGES: Message[] = build([
  // ---- #geral -------------------------------------------------------------
  {
    id: 1,
    ch: 1,
    by: 7,
    at: at(3, 9, 12),
    body: 'Bom dia, gente. Sexta tem retrospectiva geral às 16h — já bloqueei a agenda de todo mundo.',
  },
  {
    id: 2,
    ch: 1,
    by: 7,
    at: at(3, 9, 13),
    body: 'Se alguém tiver conflito, me avisa até quinta que eu remanejo.',
  },
  {
    id: 3,
    ch: 1,
    by: 2,
    at: at(3, 9, 31),
    body: 'Fechado. Vou levar o resumo dos incidentes do mês para não gastarmos a reunião reconstruindo o que aconteceu.',
  },
  {
    id: 4,
    ch: 1,
    by: 6,
    at: at(2, 11, 5),
    body: 'Pessoal, a máquina de café do quarto andar parou de novo. Já abri chamado com a administração do prédio.',
    reactions: [['😅', [3, 5, 8]]],
  },
  { id: 5, ch: 1, by: 3, at: at(2, 11, 22), body: 'Tragédia nacional.', reactions: [['😂', [1, 6, 7]]] },
  {
    id: 6,
    ch: 1,
    by: 7,
    at: at(1, 8, 40),
    body: 'Publiquei o resumo do trimestre. Leiam antes da retro, principalmente a parte de retenção.',
    attachments: [ATT_RESUMO],
    pinned: true,
  },
  {
    id: 7,
    ch: 1,
    by: 1,
    at: at(1, 8, 52),
    body: 'Acabei de ler. A leitura de retenção ficou muito mais clara do que no trimestre passado, obrigada.',
  },
  {
    id: 8,
    ch: 1,
    by: 8,
    at: at(0, 9, 5),
    body: 'Bom dia! Lembrete: o congelamento de deploy começa quinta às 18h e vai até a virada da 2.4.',
    reactions: [['👍', [1, 2, 4]]],
  },

  // ---- #produto -----------------------------------------------------------
  {
    id: 9,
    ch: 2,
    by: 1,
    at: at(2, 14, 2),
    body: 'Terminei as cinco entrevistas de onboarding. O padrão se repetiu nas cinco: ninguém entende o passo de convidar o time.',
  },
  {
    id: 10,
    ch: 2,
    by: 1,
    at: at(2, 14, 4),
    body: 'Três pessoas tentaram digitar o e-mail do colega direto no campo de busca e ficaram esperando alguma coisa acontecer.',
    reactions: [['😮', [3, 2]]],
  },
  {
    id: 11,
    ch: 2,
    by: 3,
    at: at(2, 14, 19),
    body: 'Isso bate com o teste de usabilidade de março. O campo de busca tem cara de campo de convite — mesma largura, mesmo ícone.',
  },
  {
    id: 12,
    ch: 2,
    by: 2,
    at: at(2, 14, 35),
    body: 'Dá para separar as duas coisas sem mexer no back-end? Se for só front, eu encaixo nesta sprint.',
    pinned: true,
  },
  {
    id: 13,
    ch: 2,
    by: 1,
    at: at(2, 14, 41),
    parent: 12,
    body: 'Acho que sim. O convite já tem endpoint próprio desde a 2.1, só não está exposto na interface.',
  },
  {
    id: 14,
    ch: 2,
    by: 3,
    at: at(2, 14, 50),
    parent: 12,
    body: 'Eu desenho os dois estados até amanhã de manhã: lista vazia e lista com gente já convidada.',
  },
  {
    id: 15,
    ch: 2,
    by: 2,
    at: at(2, 15, 2),
    parent: 12,
    body: 'Perfeito. Marco como candidato para a 2.4 então.',
    reactions: [['👍', [1, 3]]],
  },
  {
    id: 16,
    ch: 2,
    by: 5,
    at: at(1, 10, 12),
    body: 'Puxei o funil das contas criadas nos últimos 90 dias: 41% nunca convidam ninguém na primeira semana.',
  },
  {
    id: 17,
    ch: 2,
    by: 5,
    at: at(1, 10, 13),
    body: 'E nas contas que convidam pelo menos uma pessoa, a retenção de 30 dias é 2,3 vezes maior.',
    reactions: [
      ['🔥', [1, 2, 3, 7]],
      ['👀', [4]],
    ],
  },
  {
    id: 18,
    ch: 2,
    by: 1,
    at: at(1, 10, 20),
    body: 'Esse número entra na retro. É exatamente o argumento que faltava para priorizar o convite.',
  },
  {
    id: 19,
    ch: 2,
    by: 7,
    at: at(1, 16, 44),
    body: 'Se vocês arrumarem isso até o lançamento, eu escrevo um post contando a mudança. Dá uma boa história.',
  },
  {
    id: 20,
    ch: 2,
    by: 2,
    at: at(0, 9, 22),
    body: 'Subi o protótipo do novo passo de convite no ambiente de teste. Está atrás da flag `invite-v2`.',
  },
  {
    id: 21,
    ch: 2,
    by: 3,
    at: at(0, 9, 40),
    body: 'Duas telas: convite vazio e convite com três pessoas já adicionadas. O botão principal mudou de lugar.',
    attachments: [ATT_CONVITE],
    reactions: [['❤️', [1, 7]]],
  },
  {
    id: 22,
    ch: 2,
    by: 1,
    at: at(0, 9, 58),
    body: 'Gostei bastante. Só trocaria "Adicionar pessoas" por "Convidar o time" no botão principal — deixa claro que sai e-mail.',
  },
  {
    id: 23,
    ch: 2,
    by: 4,
    at: at(0, 10, 15),
    body: 'Do lado do back-end não muda nada. O endpoint já aceita uma lista de e-mails, então é só o front montar o payload.',
  },
  {
    id: 24,
    ch: 2,
    by: 3,
    at: at(0, 10, 31),
    body: 'Ajustei o texto do botão e reescrevi o estado vazio. Subi como versão 2 no arquivo compartilhado.',
  },
  {
    id: 25,
    ch: 2,
    by: 2,
    at: at(0, 10, 44),
    body: 'Beleza, então isso entra na 2.4. Alguém consegue escrever os critérios de aceite ainda hoje?',
  },

  // ---- #engenharia --------------------------------------------------------
  {
    id: 26,
    ch: 3,
    by: 4,
    at: at(2, 8, 31),
    body: 'Resumo do incidente de ontem à noite: o worker de e-mail travou porque a fila encheu depois da importação da Vega.',
  },
  {
    id: 27,
    ch: 3,
    by: 4,
    at: at(2, 8, 33),
    body: 'Já subi um limite por lote e um alerta quando a fila passar de cinco mil itens.',
    reactions: [['🙏', [2, 8]]],
  },
  {
    id: 28,
    ch: 3,
    by: 2,
    at: at(2, 8, 47),
    body: 'Boa. Escreve o post-mortem hoje ainda, enquanto está fresco na cabeça?',
  },
  {
    id: 29,
    ch: 3,
    by: 4,
    at: at(2, 9, 10),
    parent: 28,
    body: 'Escrevo. Vou colocar a linha do tempo minuto a minuto e as duas ações que já entraram.',
  },
  {
    id: 30,
    ch: 3,
    by: 8,
    at: at(2, 9, 25),
    parent: 28,
    body: 'Inclui também o teste de carga que a gente não tem. Sem ele isso passa batido de novo na próxima importação grande.',
  },
  { id: 31, ch: 3, by: 4, at: at(2, 9, 33), parent: 28, body: 'Anotado, vai como terceira ação.' },
  {
    id: 72,
    ch: 3,
    by: 1,
    at: at(2, 9, 48),
    parent: 28,
    body: 'Vou levar o post-mortem para a retro de sexta. Escreve pensando em quem não estava aqui na hora.',
  },
  {
    id: 32,
    ch: 3,
    by: 8,
    at: at(1, 13, 5),
    body: 'A suíte de regressão passou inteira no branch da 2.4: 412 testes em seis minutos.',
    reactions: [['🎉', [1, 2, 4]]],
  },
  {
    id: 33,
    ch: 3,
    by: 2,
    at: at(1, 13, 20),
    body: 'Deploy de homologação saiu às 13h. Se ninguém reclamar até amanhã de manhã, promovemos para produção.',
  },
  {
    id: 34,
    ch: 3,
    by: 4,
    at: at(1, 17, 40),
    body: 'Post-mortem escrito e revisado. Anexei aqui para ficar junto do histórico do incidente.',
    attachments: [ATT_POSTMORTEM],
  },
  {
    id: 35,
    ch: 3,
    by: 1,
    at: at(1, 18, 2),
    body: 'Li agora. A linha do tempo ficou ótima — dá para entender a decisão de cada minuto sem ter estado lá.',
  },
  { id: 36, ch: 3, by: 2, at: at(0, 8, 15), body: 'Bom dia. Alguém mexeu na configuração de cache ontem à noite?' },
  {
    id: 37,
    ch: 3,
    by: 4,
    at: at(0, 8, 19),
    body: 'Fui eu. Subi o TTL de 60 para 300 segundos no endpoint de listagem.',
  },
  {
    id: 38,
    ch: 3,
    by: 2,
    at: at(0, 8, 21),
    body: 'Ah, então é isso. O tempo de resposta caiu pela metade e eu achei que tinha quebrado alguma coisa.',
  },
  { id: 39, ch: 3, by: 4, at: at(0, 8, 22), body: 'Quebrado para melhor 😄', reactions: [['😂', [2, 8]]] },

  // ---- #design ------------------------------------------------------------
  {
    id: 40,
    ch: 4,
    by: 3,
    at: at(3, 15, 10),
    body: 'Subi a revisão dos componentes de formulário. Mudei o espaçamento interno de 12 para 14 pixels.',
  },
  {
    id: 41,
    ch: 4,
    by: 3,
    at: at(3, 15, 12),
    body: 'Parece pouco escrito assim, mas o formulário de cadastro inteiro respira diferente. Comparação lado a lado abaixo.',
    attachments: [ATT_ESPACAMENTO],
    reactions: [['👏', [1, 7]]],
  },
  {
    id: 42,
    ch: 4,
    by: 1,
    at: at(3, 15, 40),
    body: 'Concordo. O de cadastro estava realmente apertado, principalmente no celular.',
  },
  {
    id: 43,
    ch: 4,
    by: 7,
    at: at(2, 10, 2),
    body: 'A landing nova precisa de uma versão do card de plano sem o selo de desconto. O jurídico pediu.',
  },
  { id: 44, ch: 4, by: 3, at: at(2, 10, 30), body: 'Faço hoje. Só o card ou a seção inteira?' },
  { id: 45, ch: 4, by: 7, at: at(2, 10, 33), body: 'Só o card. A seção continua igual.' },
  {
    id: 46,
    ch: 4,
    by: 3,
    at: at(1, 9, 15),
    body: 'Card sem selo publicado no arquivo compartilhado, nas duas larguras.',
    attachments: [ATT_CARD],
    reactions: [['✅', [7]]],
  },
  {
    id: 47,
    ch: 4,
    by: 8,
    at: at(0, 11, 20),
    body: 'Achei um contraste abaixo do mínimo no botão secundário quando o tema escuro está ligado.',
  },
  {
    id: 48,
    ch: 4,
    by: 3,
    at: at(0, 11, 35),
    body: 'Boa pegada. Vou subir o cinza um degrau e revisar a paleta inteira no escuro antes de fechar o dia.',
  },
  {
    id: 73,
    ch: 4,
    by: 3,
    at: at(0, 11, 42),
    parent: 47,
    body: 'Testei no simulador: com o cinza 600 passa em AA nos dois temas.',
  },
  {
    id: 74,
    ch: 4,
    by: 1,
    at: at(0, 11, 55),
    parent: 47,
    body: 'Ótimo. Se der, sobe junto com a 2.4 para não abrirmos um deploy só de CSS.',
    reactions: [['👍', [3, 8]]],
  },

  // ---- #lançamento 2.4 ----------------------------------------------------
  {
    id: 49,
    ch: 5,
    by: 1,
    at: at(1, 14, 0),
    body: 'Checklist da 2.4: convite do time, cache da listagem, post-mortem publicado e nota de versão escrita.',
    pinned: true,
  },
  {
    id: 50,
    ch: 5,
    by: 7,
    at: at(1, 14, 12),
    body: 'A nota de versão fica comigo. Me mandem a lista final até quarta que eu escrevo na quinta.',
  },
  {
    id: 51,
    ch: 5,
    by: 2,
    at: at(1, 14, 20),
    body: 'Do lado técnico só falta o convite. O resto está pronto e testado em homologação.',
  },
  {
    id: 52,
    ch: 5,
    by: 1,
    at: at(0, 8, 50),
    body: 'Quarta às 10h a gente decide se sobe ou adia. Trinta minutos, só nós quatro, com os números na mesa.',
  },
  { id: 53, ch: 5, by: 7, at: at(0, 9, 30), body: 'Anotado. Aceito.' },
  { id: 54, ch: 5, by: 2, at: at(0, 10, 5), body: 'Vou levar a taxa de erro da última semana e o tempo de resposta.' },

  // ---- #suporte -----------------------------------------------------------
  {
    id: 55,
    ch: 6,
    by: 6,
    at: at(2, 9, 0),
    body: 'Ticket 4412 — Vega Logística: o relatório mensal está saindo com o total zerado.',
  },
  {
    id: 56,
    ch: 6,
    by: 5,
    at: at(2, 9, 35),
    body: 'Olhei aqui. É filtro de data: eles estão pedindo um mês que ainda não fechou, então não há linha nenhuma para somar.',
  },
  { id: 57, ch: 6, by: 6, at: at(2, 9, 41), body: 'Respondi explicando e eles entenderam. Ticket fechado.' },
  {
    id: 58,
    ch: 6,
    by: 6,
    at: at(0, 7, 55),
    body: 'Três chamados novos hoje, todos sobre o mesmo erro de exportação em CSV.',
  },
  {
    id: 59,
    ch: 6,
    by: 6,
    at: at(0, 7, 56),
    body: 'Anexei um exemplo do arquivo que sai errado, direto do cliente.',
    attachments: [ATT_CSV],
  },
  {
    id: 60,
    ch: 6,
    by: 4,
    at: at(0, 8, 40),
    body: 'É o separador. Quem está em locale pt-BR recebe ponto e vírgula, e o Excel deles espera vírgula.',
  },
  { id: 61, ch: 6, by: 6, at: at(0, 8, 52), body: 'Faz sentido. Tem correção prevista para quando?' },
  {
    id: 62,
    ch: 6,
    by: 4,
    at: at(0, 9, 5),
    body: 'Coloco na 2.4 se der tempo; senão vai na 2.4.1 na semana seguinte. Enquanto isso dá para pedir a exportação em locale en.',
  },

  // ---- Mensagens diretas --------------------------------------------------
  {
    id: 63,
    dm: 1,
    by: 2,
    at: at(1, 16, 10),
    body: 'Marina, consegue olhar os critérios de aceite do convite antes da daily de amanhã?',
  },
  { id: 64, dm: 1, by: 1, at: at(1, 16, 22), body: 'Consigo. Me manda o link que eu comento direto lá.' },
  { id: 65, dm: 1, by: 2, at: at(1, 16, 24), body: 'Mandei no canal do produto, é a mensagem fixada.' },

  { id: 66, dm: 2, by: 3, at: at(0, 10, 2), body: 'Você viu a versão 2 do convite?' },
  {
    id: 67,
    dm: 2,
    by: 3,
    at: at(0, 10, 3),
    body: 'Reescrevi o estado vazio inteiro. Ficou bem mais direto, acho que agora não sobra dúvida do que fazer.',
  },

  { id: 68, dm: 3, by: 1, at: at(2, 11, 0), body: 'Larissa, dá para quebrar a retenção por tamanho de conta?' },
  {
    id: 69,
    dm: 3,
    by: 5,
    at: at(2, 11, 20),
    body: 'Dá sim. Até quinta eu te mando com corte de 1 a 5, 6 a 20 e mais de 20 pessoas.',
  },
  { id: 70, dm: 3, by: 1, at: at(2, 11, 21), body: 'Perfeito, obrigada!' },

  {
    id: 71,
    dm: 4,
    by: 6,
    at: at(0, 9, 12),
    body: 'Bom dia! Consegue me dar um retorno sobre o chamado da Vega até amanhã? O cliente cobrou de novo.',
  },
])

// ---------------------------------------------------------------------------
// Chamadas
// ---------------------------------------------------------------------------

export const CALLS: Call[] = [
  { id: 1, kind: 'video', channelId: 2, participantIds: [1, 2, 3, 5], startedAt: at(0, 9, 0), seconds: 1830, missed: false },
  { id: 2, kind: 'voz', channelId: null, participantIds: [1, 6], startedAt: at(0, 9, 15), seconds: 0, missed: true },
  { id: 3, kind: 'voz', channelId: null, participantIds: [1, 2], startedAt: at(1, 16, 30), seconds: 420, missed: false },
  { id: 4, kind: 'video', channelId: 5, participantIds: [1, 2, 7, 8], startedAt: at(1, 14, 30), seconds: 2700, missed: false },
  { id: 5, kind: 'video', channelId: 3, participantIds: [2, 4, 8], startedAt: at(2, 8, 0), seconds: 1500, missed: false },
  { id: 6, kind: 'voz', channelId: null, participantIds: [1, 5], startedAt: at(2, 11, 5), seconds: 900, missed: false },
  { id: 7, kind: 'video', channelId: 4, participantIds: [1, 3, 7], startedAt: at(3, 15, 30), seconds: 1200, missed: false },
  { id: 8, kind: 'voz', channelId: 6, participantIds: [6, 4], startedAt: at(3, 10, 0), seconds: 0, missed: true },
]

// ---------------------------------------------------------------------------
// Respostas automáticas — mantêm a tela viva depois que você envia algo.
// ---------------------------------------------------------------------------

export const CHANNEL_AUTO_REPLIES: Record<number, string[]> = {
  2: [
    'Anotei aqui. Levo isso para a priorização de quinta.',
    'Concordo. Só precisamos escrever o critério de aceite antes de abrir o card.',
    'Boa. Vou confirmar com a pesquisa antes de fechar o escopo.',
    'Faz sentido. Isso muda a ordem do que a gente combinou ontem?',
  ],
  3: [
    'Vou olhar o log e volto em cinco minutos.',
    'Consigo subir isso ainda hoje se a suíte passar.',
    'Boa observação. Abro uma issue com esse contexto.',
    'Reproduzi aqui em homologação. É o mesmo comportamento.',
  ],
  6: [
    'Já respondi o cliente com esse contexto, obrigado.',
    'Vou anexar isso no ticket para não perder o histórico.',
    'Perfeito. Marco o chamado como aguardando correção.',
    'Consigo segurar o cliente até a próxima versão com essa explicação.',
  ],
}

export const DM_AUTO_REPLIES: string[] = [
  'Fechado, obrigada!',
  'Anotado. Te retorno ainda hoje.',
  'Boa, era exatamente isso que eu precisava saber.',
  'Consigo olhar depois da reunião das 15h.',
  'Perfeito. Vou seguir por aqui então.',
]

/** Emojis oferecidos no seletor rápido de reação. */
export const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '👀', '🙏', '✅'] as const

// ---------------------------------------------------------------------------
// Domínio do template de chat & mensageria (Elo).
// Tudo é fictício: nenhuma chamada de rede acontece.
// ---------------------------------------------------------------------------

/** Presença publicada por cada pessoa da equipe. */
export type Presence = 'online' | 'ausente' | 'ocupado' | 'offline'

export interface Person {
  id: number
  name: string
  handle: string
  role: string
  avatar: string
  presence: Presence
  timezone: string
  lastSeenAt: string
}

export interface Channel {
  id: number
  slug: string
  name: string
  topic: string
  description: string
  private: boolean
  memberIds: number[]
  unread: number
  muted: boolean
  /** Quando verdadeiro, o canal simula uma resposta automática após o envio. */
  responsive: boolean
}

export type AttachmentKind = 'image' | 'file' | 'link'

export interface Attachment {
  id: number
  name: string
  kind: AttachmentKind
  url: string
  sizeKb: number
  width?: number
  height?: number
}

export interface Reaction {
  emoji: string
  personIds: number[]
}

export interface Message {
  id: number
  channelId: number | null
  dmId: number | null
  authorId: number
  body: string
  createdAt: string
  editedAt: string | null
  /** Mensagem-raiz quando esta é uma resposta em thread. */
  parentId: number | null
  reactions: Reaction[]
  attachments: Attachment[]
  pinned: boolean
}

export interface DirectThread {
  id: number
  personId: number
  unread: number
  lastMessageAt: string
}

export type CallKind = 'voz' | 'video'

export interface Call {
  id: number
  kind: CallKind
  channelId: number | null
  participantIds: number[]
  startedAt: string
  seconds: number
  missed: boolean
}

// ---- Referência de conversa ------------------------------------------------

export type ConversationKind = 'channel' | 'dm'

/** Identifica a conversa aberta: um canal ou uma mensagem direta. */
export interface ConversationRef {
  kind: ConversationKind
  id: number
}

/** Chave estável usada em mapas (rascunhos, digitando, leitura). */
export function convKey(ref: ConversationRef): string {
  return `${ref.kind === 'channel' ? 'c' : 'd'}-${ref.id}`
}

// ---- Estruturas derivadas --------------------------------------------------

/** Bloco de mensagens seguidas do mesmo autor dentro da janela de agrupamento. */
export interface MessageGroup {
  authorId: number
  startedAt: string
  messages: Message[]
}

/** Item da timeline: separador de data, marcador de não lidas ou um grupo. */
export type TimelineItem =
  | { type: 'date'; key: string; date: string }
  | { type: 'unread'; key: string }
  | { type: 'group'; key: string; group: MessageGroup }

/** Resultado da busca global, já com o canal/pessoa resolvidos. */
export interface SearchHit {
  message: Message
  conversation: ConversationRef
  /** Nome legível da conversa (nome do canal ou da pessoa). */
  conversationLabel: string
  /** Trecho do corpo com o termo destacado por `**`. */
  excerpt: string
}

export type SearchPeriod = 'todos' | 'hoje' | 'semana' | 'mes'

export interface SearchFilters {
  text: string
  channelId: number | 'todos'
  personId: number | 'todos'
  period: SearchPeriod
}

/** Anexo com o contexto de onde foi compartilhado. */
export interface SharedFile {
  attachment: Attachment
  message: Message
  conversationLabel: string
  conversation: ConversationRef
  authorId: number
  sharedAt: string
}

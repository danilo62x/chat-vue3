import type {
  Attachment,
  Call,
  Channel,
  ConversationRef,
  DirectThread,
  Message,
  MessageGroup,
  Person,
  SearchFilters,
  SearchHit,
  SharedFile,
  TimelineItem,
} from './types'

/** Janela de agrupamento: mensagens seguidas do mesmo autor viram um bloco. */
export const GROUP_WINDOW_MINUTES = 5

// ---- Lookups ---------------------------------------------------------------

export function personById(list: Person[], id: number): Person | undefined {
  return list.find((p) => p.id === id)
}
export function personName(list: Person[], id: number): string {
  return personById(list, id)?.name ?? '—'
}
export function channelById(list: Channel[], id: number): Channel | undefined {
  return list.find((c) => c.id === id)
}
export function channelBySlug(list: Channel[], slug: string): Channel | undefined {
  return list.find((c) => c.slug === slug)
}
export function dmById(list: DirectThread[], id: number): DirectThread | undefined {
  return list.find((d) => d.id === id)
}
export function messageById(list: Message[], id: number): Message | undefined {
  return list.find((m) => m.id === id)
}

// ---- Seleção de mensagens --------------------------------------------------

function belongsTo(m: Message, ref: ConversationRef): boolean {
  return ref.kind === 'channel' ? m.channelId === ref.id : m.dmId === ref.id
}

function byDate(a: Message, b: Message): number {
  return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : a.id - b.id
}

/** Mensagens-raiz de uma conversa (sem as respostas em thread), em ordem. */
export function rootMessages(list: Message[], ref: ConversationRef): Message[] {
  return list.filter((m) => belongsTo(m, ref) && m.parentId === null).sort(byDate)
}

/** Todas as mensagens de uma conversa, incluindo respostas em thread. */
export function allMessages(list: Message[], ref: ConversationRef): Message[] {
  return list.filter((m) => belongsTo(m, ref)).sort(byDate)
}

/** Respostas de uma thread, em ordem. */
export function repliesOf(list: Message[], parentId: number): Message[] {
  return list.filter((m) => m.parentId === parentId).sort(byDate)
}

export function replyCount(list: Message[], parentId: number): number {
  return list.reduce((acc, m) => (m.parentId === parentId ? acc + 1 : acc), 0)
}

/** Última mensagem-raiz de uma conversa — usada na prévia da lista lateral. */
export function lastMessageOf(list: Message[], ref: ConversationRef): Message | undefined {
  const msgs = rootMessages(list, ref)
  return msgs[msgs.length - 1]
}

export function pinnedOf(list: Message[], ref: ConversationRef): Message[] {
  return allMessages(list, ref).filter((m) => m.pinned)
}

/** Conversa a que uma mensagem pertence. */
export function conversationOf(m: Message): ConversationRef {
  return m.channelId !== null ? { kind: 'channel', id: m.channelId } : { kind: 'dm', id: m.dmId ?? 0 }
}

// ---- Datas -----------------------------------------------------------------

/** Chave de dia (YYYY-MM-DD) no fuso local. */
export function dayKey(iso: string): string {
  const d = new Date(iso)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

export function isToday(iso: string): boolean {
  return dayKey(iso) === dayKey(new Date().toISOString())
}

export function isYesterday(iso: string): boolean {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return dayKey(iso) === dayKey(d.toISOString())
}

function minutesBetween(a: string, b: string): number {
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 60_000
}

// ---- Timeline --------------------------------------------------------------

/**
 * Monta a timeline exibida na thread: separadores de data, marcador de
 * "Novas mensagens" e blocos de mensagens seguidas do mesmo autor dentro de
 * `GROUP_WINDOW_MINUTES`.
 */
export function buildTimeline(msgs: Message[], firstUnreadId: number | null = null): TimelineItem[] {
  const items: TimelineItem[] = []
  let currentDay = ''
  let group: MessageGroup | null = null

  const flush = () => {
    if (group) {
      items.push({ type: 'group', key: `g-${group.messages[0].id}`, group })
      group = null
    }
  }

  for (const m of msgs) {
    const day = dayKey(m.createdAt)
    if (day !== currentDay) {
      flush()
      currentDay = day
      items.push({ type: 'date', key: `d-${day}`, date: m.createdAt })
    }
    if (firstUnreadId !== null && m.id === firstUnreadId) {
      flush()
      items.push({ type: 'unread', key: 'unread-marker' })
    }
    const sameAuthor = group !== null && group.authorId === m.authorId
    const withinWindow =
      group !== null &&
      minutesBetween(group.messages[group.messages.length - 1].createdAt, m.createdAt) <= GROUP_WINDOW_MINUTES

    if (group && sameAuthor && withinWindow) {
      group.messages.push(m)
    } else {
      flush()
      group = { authorId: m.authorId, startedAt: m.createdAt, messages: [m] }
    }
  }
  flush()
  return items
}

/**
 * Id da primeira mensagem não lida de uma conversa, dada a contagem de não
 * lidas. Devolve `null` quando não há nada novo.
 */
export function firstUnreadId(msgs: Message[], unread: number): number | null {
  if (unread <= 0) return null
  const idx = Math.max(0, msgs.length - unread)
  return msgs[idx]?.id ?? null
}

// ---- Threads ---------------------------------------------------------------

export interface ThreadSummary {
  root: Message
  replies: Message[]
  conversation: ConversationRef
  participantIds: number[]
  lastReplyAt: string
  /** Você participa da thread (escreveu a raiz ou respondeu). */
  following: boolean
}

/** Todas as threads (mensagens com pelo menos uma resposta), mais recentes primeiro. */
export function threadSummaries(list: Message[], currentUserId: number): ThreadSummary[] {
  const roots = list.filter((m) => m.parentId === null && list.some((r) => r.parentId === m.id))
  return roots
    .map((root) => {
      const replies = repliesOf(list, root.id)
      const participantIds = Array.from(new Set([root.authorId, ...replies.map((r) => r.authorId)]))
      return {
        root,
        replies,
        conversation: conversationOf(root),
        participantIds,
        lastReplyAt: replies[replies.length - 1]?.createdAt ?? root.createdAt,
        following: participantIds.includes(currentUserId),
      }
    })
    .sort((a, b) => (a.lastReplyAt < b.lastReplyAt ? 1 : -1))
}

// ---- Busca -----------------------------------------------------------------

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

/** Trecho de ~120 caracteres em volta do termo, com o termo entre `**`. */
export function excerptFor(body: string, term: string): string {
  if (!term) return body.slice(0, 160)
  const idx = normalize(body).indexOf(normalize(term))
  if (idx < 0) return body.slice(0, 160)
  const start = Math.max(0, idx - 50)
  const end = Math.min(body.length, idx + term.length + 70)
  const head = start > 0 ? '…' : ''
  const tail = end < body.length ? '…' : ''
  const raw = body.slice(start, end)
  const local = idx - start
  const marked = `${raw.slice(0, local)}**${raw.slice(local, local + term.length)}**${raw.slice(local + term.length)}`
  return `${head}${marked}${tail}`
}

function withinPeriod(iso: string, period: SearchFilters['period']): boolean {
  if (period === 'todos') return true
  const now = Date.now()
  const ts = new Date(iso).getTime()
  if (period === 'hoje') return isToday(iso)
  if (period === 'semana') return now - ts <= 7 * 24 * 3600 * 1000
  return now - ts <= 30 * 24 * 3600 * 1000
}

export function searchMessages(
  messages: Message[],
  channels: Channel[],
  dms: DirectThread[],
  people: Person[],
  filters: SearchFilters
): SearchHit[] {
  const term = filters.text.trim()
  if (!term) return []
  const needle = normalize(term)

  return messages
    .filter((m) => normalize(m.body).includes(needle))
    .filter((m) => (filters.channelId === 'todos' ? true : m.channelId === filters.channelId))
    .filter((m) => (filters.personId === 'todos' ? true : m.authorId === filters.personId))
    .filter((m) => withinPeriod(m.createdAt, filters.period))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((m) => {
      const conversation = conversationOf(m)
      return {
        message: m,
        conversation,
        conversationLabel: conversationLabel(conversation, channels, dms, people),
        excerpt: excerptFor(m.body, term),
      }
    })
}

/** Nome legível de uma conversa: `#canal` ou o nome da pessoa. */
export function conversationLabel(
  ref: ConversationRef,
  channels: Channel[],
  dms: DirectThread[],
  people: Person[]
): string {
  if (ref.kind === 'channel') return `#${channelById(channels, ref.id)?.name ?? '—'}`
  const dm = dmById(dms, ref.id)
  return dm ? personName(people, dm.personId) : '—'
}

// ---- Arquivos --------------------------------------------------------------

export function sharedFiles(
  messages: Message[],
  channels: Channel[],
  dms: DirectThread[],
  people: Person[]
): SharedFile[] {
  const out: SharedFile[] = []
  for (const m of messages) {
    for (const attachment of m.attachments) {
      const conversation = conversationOf(m)
      out.push({
        attachment,
        message: m,
        conversation,
        conversationLabel: conversationLabel(conversation, channels, dms, people),
        authorId: m.authorId,
        sharedAt: m.createdAt,
      })
    }
  }
  return out.sort((a, b) => (a.sharedAt < b.sharedAt ? 1 : -1))
}

/** Anexos compartilhados dentro de uma conversa. */
export function filesOfConversation(messages: Message[], ref: ConversationRef): Attachment[] {
  return allMessages(messages, ref).flatMap((m) => m.attachments)
}

// ---- Chamadas --------------------------------------------------------------

/** Duração legível: 0 -> "—", 420 -> "7min", 1830 -> "30min 30s". */
export function formatCallSeconds(seconds: number): string {
  if (seconds <= 0) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}`
  if (m > 0) return s > 0 ? `${m}min ${s}s` : `${m}min`
  return `${s}s`
}

export function callsSorted(list: Call[]): Call[] {
  return [...list].sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
}

// ---- Contadores ------------------------------------------------------------

export function totalUnread(channels: Channel[], dms: DirectThread[]): number {
  const ch = channels.filter((c) => !c.muted).reduce((acc, c) => acc + c.unread, 0)
  const dm = dms.reduce((acc, d) => acc + d.unread, 0)
  return ch + dm
}

/** Tamanho legível de anexo: 946 -> "946 KB", 2048 -> "2,0 MB". */
export function formatFileSize(sizeKb: number): string {
  if (sizeKb <= 0) return '—'
  if (sizeKb < 1024) return `${sizeKb} KB`
  return `${(sizeKb / 1024).toFixed(1).replace('.', ',')} MB`
}

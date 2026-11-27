import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  CALLS,
  CHANNELS,
  CHANNEL_AUTO_REPLIES,
  CURRENT_USER_ID,
  DIRECT_THREADS,
  DM_AUTO_REPLIES,
  MESSAGES,
  PEOPLE,
  SEEDED_ON,
} from '@/data/mock'
import { channelById, dmById } from '@/data/query'
import {
  convKey,
  type Attachment,
  type Call,
  type Channel,
  type ConversationRef,
  type DirectThread,
  type Message,
  type Person,
  type Presence,
} from '@/data/types'

/** Atraso da resposta simulada, em milissegundos. */
export const AUTO_REPLY_DELAY = 2000
const TYPING_LEAD = 500

interface SendOptions {
  attachments?: Attachment[]
  parentId?: number | null
}

function seed() {
  return {
    seededOn: SEEDED_ON,
    currentUserId: CURRENT_USER_ID,
    people: PEOPLE.map((p) => ({ ...p })),
    channels: CHANNELS.map((c) => ({ ...c, memberIds: [...c.memberIds] })),
    dms: DIRECT_THREADS.map((d) => ({ ...d })),
    messages: MESSAGES.map((m) => ({
      ...m,
      reactions: m.reactions.map((r) => ({ ...r, personIds: [...r.personIds] })),
      attachments: m.attachments.map((a) => ({ ...a })),
    })),
    calls: CALLS.map((c) => ({ ...c, participantIds: [...c.participantIds] })),
  }
}

function nextId<T extends { id: number }>(list: T[]): number {
  return list.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

export const useChatStore = defineStore(
  'ch-data',
  () => {
    const initial = seed()

    const seededOn = ref<string>(initial.seededOn)
    const currentUserId = ref<number>(initial.currentUserId)
    const people = ref<Person[]>(initial.people)
    const channels = ref<Channel[]>(initial.channels)
    const dms = ref<DirectThread[]>(initial.dms)
    const messages = ref<Message[]>(initial.messages)
    const calls = ref<Call[]>(initial.calls)
    /** Pessoas digitando por conversa (`c-2`, `d-1`…). */
    const typing = ref<Record<string, number[]>>({})

    /** Quem responde automaticamente em uma conversa (ou `null` se ninguém). */
    function autoResponder(ref_: ConversationRef): { personId: number; pool: string[] } | null {
      if (ref_.kind === 'dm') {
        const dm = dmById(dms.value, ref_.id)
        if (!dm) return null
        return { personId: dm.personId, pool: DM_AUTO_REPLIES }
      }
      const channel = channelById(channels.value, ref_.id)
      if (!channel || !channel.responsive) return null
      const pool = CHANNEL_AUTO_REPLIES[channel.id]
      if (!pool || pool.length === 0) return null
      const candidates = channel.memberIds.filter((id) => id !== currentUserId.value)
      if (candidates.length === 0) return null
      const personId = candidates[Math.floor(Math.random() * candidates.length)]
      return { personId, pool }
    }

    // ---- Mensagens --------------------------------------------------------
    function sendMessage(target: ConversationRef, body: string, options: SendOptions = {}): Message | null {
      const text = body.trim()
      if (!text && !(options.attachments && options.attachments.length)) return null

      const message: Message = {
        id: nextId(messages.value),
        channelId: target.kind === 'channel' ? target.id : null,
        dmId: target.kind === 'dm' ? target.id : null,
        authorId: currentUserId.value,
        body: text,
        createdAt: new Date().toISOString(),
        editedAt: null,
        parentId: options.parentId ?? null,
        reactions: [],
        attachments: options.attachments ?? [],
        pinned: false,
      }
      messages.value = [...messages.value, message]
      markRead(target)
      if (target.kind === 'dm') {
        dms.value = dms.value.map((d) => (d.id === target.id ? { ...d, lastMessageAt: message.createdAt } : d))
      }

      // "Digitando…" seguido de uma resposta automática, para a conversa
      // não parecer estática depois do envio.
      const responder = autoResponder(target)
      if (responder) {
        const key = convKey(target)
        setTimeout(() => {
          const current = typing.value[key] ?? []
          if (!current.includes(responder.personId)) {
            typing.value = { ...typing.value, [key]: [...current, responder.personId] }
          }
        }, TYPING_LEAD)

        setTimeout(() => {
          const rest = (typing.value[key] ?? []).filter((id) => id !== responder.personId)
          const reply: Message = {
            id: nextId(messages.value),
            channelId: target.kind === 'channel' ? target.id : null,
            dmId: target.kind === 'dm' ? target.id : null,
            authorId: responder.personId,
            body: responder.pool[Math.floor(Math.random() * responder.pool.length)],
            createdAt: new Date().toISOString(),
            editedAt: null,
            parentId: options.parentId ?? null,
            reactions: [],
            attachments: [],
            pinned: false,
          }
          typing.value = { ...typing.value, [key]: rest }
          messages.value = [...messages.value, reply]
          if (target.kind === 'dm') {
            dms.value = dms.value.map((d) => (d.id === target.id ? { ...d, lastMessageAt: reply.createdAt } : d))
          }
        }, TYPING_LEAD + AUTO_REPLY_DELAY)
      }

      return message
    }

    function editMessage(id: number, body: string) {
      messages.value = messages.value.map((m) =>
        m.id === id ? { ...m, body: body.trim(), editedAt: new Date().toISOString() } : m
      )
    }

    function removeMessage(id: number) {
      // Remove a mensagem e, se for a raiz de uma thread, as respostas junto.
      messages.value = messages.value.filter((m) => m.id !== id && m.parentId !== id)
    }

    function toggleReaction(id: number, emoji: string) {
      const me = currentUserId.value
      messages.value = messages.value.map((m) => {
        if (m.id !== id) return m
        const existing = m.reactions.find((r) => r.emoji === emoji)
        if (!existing) return { ...m, reactions: [...m.reactions, { emoji, personIds: [me] }] }
        const has = existing.personIds.includes(me)
        const personIds = has ? existing.personIds.filter((p) => p !== me) : [...existing.personIds, me]
        const reactions = personIds.length
          ? m.reactions.map((r) => (r.emoji === emoji ? { ...r, personIds } : r))
          : m.reactions.filter((r) => r.emoji !== emoji)
        return { ...m, reactions }
      })
    }

    function togglePin(id: number) {
      messages.value = messages.value.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m))
    }

    // ---- Conversas --------------------------------------------------------
    function markRead(target: ConversationRef) {
      if (target.kind === 'channel') {
        channels.value = channels.value.map((c) => (c.id === target.id ? { ...c, unread: 0 } : c))
      } else {
        dms.value = dms.value.map((d) => (d.id === target.id ? { ...d, unread: 0 } : d))
      }
    }

    function markAllRead() {
      channels.value = channels.value.map((c) => ({ ...c, unread: 0 }))
      dms.value = dms.value.map((d) => ({ ...d, unread: 0 }))
    }

    function toggleMute(channelId: number) {
      channels.value = channels.value.map((c) => (c.id === channelId ? { ...c, muted: !c.muted } : c))
    }

    function setChannelTopic(channelId: number, topic: string) {
      channels.value = channels.value.map((c) => (c.id === channelId ? { ...c, topic } : c))
    }

    // ---- Presença e perfil ------------------------------------------------
    function updateCurrentPerson(patch: Partial<Person>) {
      const me = currentUserId.value
      people.value = people.value.map((p) => (p.id === me ? { ...p, ...patch } : p))
    }

    function setPresence(presence: Presence) {
      updateCurrentPerson({ presence })
    }

    // ---- Chamadas ---------------------------------------------------------
    function addCall(data: Omit<Call, 'id'>): Call {
      const call: Call = { ...data, id: nextId(calls.value) }
      calls.value = [call, ...calls.value]
      return call
    }

    function reset() {
      const fresh = seed()
      seededOn.value = fresh.seededOn
      currentUserId.value = fresh.currentUserId
      people.value = fresh.people
      channels.value = fresh.channels
      dms.value = fresh.dms
      messages.value = fresh.messages
      calls.value = fresh.calls
      typing.value = {}
    }

    return {
      seededOn,
      currentUserId,
      people,
      channels,
      dms,
      messages,
      calls,
      typing,
      sendMessage,
      editMessage,
      removeMessage,
      toggleReaction,
      togglePin,
      markRead,
      markAllRead,
      toggleMute,
      setChannelTopic,
      setPresence,
      updateCurrentPerson,
      addCall,
      reset,
    }
  },
  {
    persist: {
      key: 'ch-data',
      pick: ['seededOn', 'currentUserId', 'people', 'channels', 'dms', 'messages', 'calls'],
      // As mensagens são ancoradas no "agora" para a timeline mostrar hoje /
      // ontem. Se o dado guardado é de outro dia, devolvemos um patch vazio e
      // o store fica com a semente nova em vez de uma conversa congelada.
      serializer: {
        serialize: JSON.stringify,
        deserialize(raw: string) {
          try {
            const saved = JSON.parse(raw)
            if (!saved || saved.seededOn !== SEEDED_ON) return {}
            return { ...saved, typing: {} }
          } catch {
            return {}
          }
        },
      },
    },
  }
)

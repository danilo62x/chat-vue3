import { useI18n } from 'vue-i18n'
import { formatDate, formatTime } from '@/lib/format'
import { isToday, isYesterday } from '@/data/query'

const LOCALE: Record<string, string> = { 'pt-BR': 'pt-BR', en: 'en-US', es: 'es-ES' }

/**
 * Rótulos de tempo do chat, já traduzidos: hora da mensagem, separador de dia
 * e carimbo relativo ("agora", "há 12 min") usado na lista de conversas.
 *
 * Os arquivos de tradução são compartilhados com as outras stacks e usam as
 * chaves de plural do i18next (`_one` / `_other`); aqui a variante é escolhida
 * na mão, já que o vue-i18n usa outra convenção.
 */
export function useChatTime() {
  const { t, locale } = useI18n()

  const lang = () => locale.value
  const intlLocale = () => LOCALE[locale.value] ?? LOCALE['pt-BR']
  const plural = (key: string, count: number) => t(`${key}_${count === 1 ? 'one' : 'other'}`, { count })

  /** "14:32" */
  const time = (iso: string) => formatTime(iso, lang())

  /** Separador da timeline: "Hoje", "Ontem" ou "quinta-feira, 4 de junho". */
  const dayLabel = (iso: string) => {
    if (isToday(iso)) return t('time.today')
    if (isYesterday(iso)) return t('time.yesterday')
    return new Intl.DateTimeFormat(intlLocale(), { weekday: 'long', day: 'numeric', month: 'long' }).format(
      new Date(iso)
    )
  }

  /** Carimbo curto da lista: hora se for hoje, "Ontem", ou a data. */
  const listStamp = (iso: string) => {
    if (isToday(iso)) return formatTime(iso, lang())
    if (isYesterday(iso)) return t('time.yesterday')
    return formatDate(iso, lang())
  }

  /** "agora", "há 12 min", "há 3 h", "há 2 d" ou a data. */
  const relative = (iso: string) => {
    const diff = Math.max(0, Date.now() - new Date(iso).getTime())
    const mins = Math.floor(diff / 60_000)
    if (mins < 1) return t('time.now')
    if (mins < 60) return plural('time.minutesAgo', mins)
    const hours = Math.floor(mins / 60)
    if (hours < 24) return plural('time.hoursAgo', hours)
    const days = Math.floor(hours / 24)
    if (days < 7) return plural('time.daysAgo', days)
    return formatDate(iso, lang())
  }

  return { time, dayLabel, listStamp, relative, plural }
}

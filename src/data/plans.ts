import type { Plan } from '@/components/ch/PlanCard.vue'

/** Planos vendidos no site público. Preços por pessoa, por mês. */
export const PLANS: Plan[] = [
  {
    id: 'time',
    price: 0,
    featureKeys: ['channels', 'history', 'calls', 'apps'],
  },
  {
    id: 'pro',
    price: 29,
    featured: true,
    featureKeys: ['everything', 'history', 'guests', 'calls', 'sso'],
  },
  {
    id: 'empresa',
    price: 49,
    featureKeys: ['everything', 'retention', 'audit', 'support', 'sla'],
  },
]

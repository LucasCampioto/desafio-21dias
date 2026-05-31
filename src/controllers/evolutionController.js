import { apiFetch } from '../lib/apiClient'

export async function fetchEvolutionInsights() {
  const data = await apiFetch('/evolution/insights')
  return data?.report ?? data
}

export async function fetchEvolutionCharts() {
  const data = await apiFetch('/evolution/charts')
  return data?.campaigns ?? []
}

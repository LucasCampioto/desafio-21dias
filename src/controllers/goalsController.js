import { apiFetch } from '../lib/apiClient'

function mapGoal(goal) {
  return {
    id: goal.id,
    kind: goal.kind === 'avoid' ? 'avoid' : 'do',
    text: goal.text,
    done: Boolean(goal.done),
  }
}

export async function loadGoals() {
  const data = await apiFetch('/goals')
  return Array.isArray(data?.goals) ? data.goals.map(mapGoal) : []
}

export async function createGoal(payload) {
  const data = await apiFetch('/goals', { method: 'POST', body: payload })
  return mapGoal(data)
}

export async function setGoalDone(id, done) {
  const data = await apiFetch(`/goals/${id}`, {
    method: 'PATCH',
    body: { done },
  })
  return mapGoal(data)
}

export async function updateGoalText(id, text) {
  const data = await apiFetch(`/goals/${id}`, {
    method: 'PATCH',
    body: { text },
  })
  return mapGoal(data)
}

export async function deleteGoal(id) {
  await apiFetch(`/goals/${id}`, { method: 'DELETE' })
}

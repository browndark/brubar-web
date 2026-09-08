import { db, type SyncQueueItem } from './db'

const apiUrl = ((import.meta.env.VITE_API_URL as string | undefined) || (import.meta.env.DEV ? 'http://localhost:8787' : '')).replace(/\/$/, '')
const establishmentId = 'establishment'
const lastPullKey = 'brubar-last-pull'

export function isSyncConfigured() { return Boolean(apiUrl) }

async function pushPending() {
  if (!apiUrl) return
  const pending = await db.syncQueue.filter((item) => !item.syncedAt).limit(500).toArray()
  if (!pending.length) return
  const response = await fetch(`${apiUrl}/api/sync/push`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ establishmentId, changes: pending }) })
  if (!response.ok) throw new Error(`Sync push failed: ${response.status}`)
  const syncedAt = new Date().toISOString()
  await db.transaction('rw', db.syncQueue, async () => { for (const item of pending) await db.syncQueue.update(item.id, { syncedAt }) })
}

async function applyRemoteChange(change: SyncQueueItem & { createdAt: string; payload: unknown }) {
  const payload = typeof change.payload === 'string' ? JSON.parse(change.payload) as Record<string, unknown> : change.payload as Record<string, unknown>
  if (change.entityType === 'VenueTable') { if (change.operation === 'DELETE') await db.venueTables.delete(change.entityId); else await db.venueTables.put(payload as never) }
  if (change.entityType === 'Product') { if (change.operation === 'DELETE') await db.products.delete(change.entityId); else await db.products.put(payload as never) }
  if (change.entityType === 'Order') { if (change.operation === 'DELETE') await db.orders.delete(change.entityId); else await db.orders.put(payload as never) }
  if (change.entityType === 'Payment') { if (change.operation === 'DELETE') await db.payments.delete(change.entityId); else await db.payments.put(payload as never) }
  if (change.entityType === 'Review') { if (change.operation === 'DELETE') await db.reviews.delete(change.entityId); else await db.reviews.put(payload as never) }
}

async function pullRemote() {
  if (!apiUrl) return
  const since = localStorage.getItem(lastPullKey)
  const query = new URLSearchParams({ establishmentId })
  if (since) query.set('since', since)
  const response = await fetch(`${apiUrl}/api/sync/pull?${query}`)
  if (!response.ok) throw new Error(`Sync pull failed: ${response.status}`)
  const data = await response.json() as { changes: Array<SyncQueueItem & { createdAt: string }> }
  for (const change of data.changes) await applyRemoteChange(change)
  if (data.changes.length) localStorage.setItem(lastPullKey, data.changes[data.changes.length - 1].createdAt)
}

export async function synchronize() {
  if (!apiUrl || !navigator.onLine) return
  await pushPending()
  await pullRemote()
}

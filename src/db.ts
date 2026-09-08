import Dexie, { type Table } from 'dexie'

export type TableStatus = 'FREE' | 'OCCUPIED' | 'WAITING_PAYMENT' | 'CLOSED'
export type VenueTable = { id: string; name: string; sector: string; status: TableStatus; attendantName?: string; openedAt?: string; totalCents: number }
export type Product = { id: string; section: 'FOOD' | 'DRINK'; category: string; name: string; description: string; priceCents: number; favorite: boolean; active: boolean; createdAt: string; updatedAt: string }
export type ProductionStatus = 'RECEIVED' | 'PREPARING' | 'READY'
export type Order = { id: string; tableId: string; attendantName: string; items: Array<Product & { quantity: number; notes?: string }>; openedAt: string; discountCents: number; serviceChargeRate: number; status: 'OPEN' | 'PAID'; productionStatus: ProductionStatus; totalCents?: number; closedAt?: string; paymentMethod?: string }
export type PaymentMethod = 'PIX' | 'CASH' | 'DEBIT' | 'CREDIT' | 'OTHER'
export type Payment = { id: string; orderId: string; method: PaymentMethod; amountCents: number; receivedCents?: number; changeCents?: number; createdAt: string }
export type Review = { id: string; orderId: string; attendantName: string; rating: number; comment?: string; createdAt: string }
export type SyncQueueItem = { id: string; entityType: string; entityId: string; operation: 'CREATE' | 'UPDATE' | 'DELETE'; payload: string; attempts: number; createdAt: string; syncedAt?: string }
export type AppearanceSettings = { theme: 'light' | 'dark'; contrast: 'standard' | 'high'; brightness: number }
export type Establishment = { id: string; name: string; phone: string; address?: string; serviceChargeRate: number; currency: 'BRL'; appearance?: AppearanceSettings; createdAt: string }
export type AdminUser = { id: string; establishmentId: string; name: string; email: string; passwordHash: string; role: 'ADMIN'; createdAt: string }

class BrubarDatabase extends Dexie {
  venueTables!: Table<VenueTable, string>
  products!: Table<Product, string>
  orders!: Table<Order, string>
  syncQueue!: Table<SyncQueueItem, string>
  settings!: Table<Establishment, string>
  users!: Table<AdminUser, string>
  payments!: Table<Payment, string>
  reviews!: Table<Review, string>

  constructor() {
    super('brubar-local')
    this.version(1).stores({ tables: 'id, status, sector', products: 'id, category, favorite', orders: 'id, tableId, openedAt', syncQueue: 'id, entityType, entityId, createdAt, syncedAt' })
    this.version(2).stores({ venueTables: 'id, status, sector', products: 'id, section, category, active, favorite', orders: 'id, tableId, openedAt, status, productionStatus', syncQueue: 'id, entityType, entityId, createdAt, syncedAt', settings: 'id', users: 'id, establishmentId, email' })
    this.version(3).stores({ venueTables: 'id, status, sector', products: 'id, section, category, active, favorite', orders: 'id, tableId, openedAt, status, productionStatus', syncQueue: 'id, entityType, entityId, createdAt, syncedAt', settings: 'id', users: 'id, establishmentId, email' })
    this.version(4).stores({ venueTables: 'id, status, sector', products: 'id, section, category, active, favorite', orders: 'id, tableId, openedAt, status, productionStatus', payments: 'id, orderId, method, createdAt', reviews: 'id, orderId, attendantName, rating, createdAt', syncQueue: 'id, entityType, entityId, createdAt, syncedAt', settings: 'id', users: 'id, establishmentId, email' })
  }
}

export const db = new BrubarDatabase()
export async function enqueueSync(entityType: string, entityId: string, operation: SyncQueueItem['operation'], payload: unknown) {
  await db.syncQueue.add({ id: crypto.randomUUID(), entityType, entityId, operation, payload: JSON.stringify(payload), attempts: 0, createdAt: new Date().toISOString() })
}
export const demoTables: VenueTable[] = [...Array.from({ length: 8 }, (_, index) => ({ id: `table-${index + 1}`, name: `Mesa ${String(index + 1).padStart(2, '0')}`, sector: 'Salão', status: 'FREE' as const, totalCents: 0 })), { id: 'table-veranda-1', name: 'Varanda 01', sector: 'Varanda', status: 'FREE', totalCents: 0 }, { id: 'table-veranda-2', name: 'Varanda 02', sector: 'Varanda', status: 'FREE', totalCents: 0 }]

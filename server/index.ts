import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()
const app = Fastify({ logger: true })
const changeSchema = z.object({ id: z.string().uuid(), entityType: z.string().min(1), entityId: z.string().min(1), operation: z.enum(['CREATE', 'UPDATE', 'DELETE']), payload: z.unknown(), createdAt: z.string().datetime() })
const pushSchema = z.object({ establishmentId: z.string().min(1), changes: z.array(changeSchema).max(500) })

const allowedOrigins = process.env.WEB_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean)
await app.register(cors, { origin: allowedOrigins?.length ? allowedOrigins : ['http://localhost:5173'] })
app.get('/health', async () => ({ ok: true, service: 'brubar-sync' }))
app.post('/api/sync/push', async (request, reply) => {
  const input = pushSchema.parse(request.body)
  for (const change of input.changes) {
    await prisma.syncChange.upsert({ where: { eventId: change.id }, create: { eventId: change.id, establishmentId: input.establishmentId, entityType: change.entityType, entityId: change.entityId, operation: change.operation, payload: change.payload as object, createdAt: new Date(change.createdAt) }, update: {} })
  }
  return reply.send({ accepted: input.changes.length })
})
app.get('/api/sync/pull', async (request) => {
  const query = z.object({ establishmentId: z.string().min(1), since: z.string().datetime().optional() }).parse(request.query)
  const changes = await prisma.syncChange.findMany({ where: { establishmentId: query.establishmentId, ...(query.since ? { createdAt: { gt: new Date(query.since) } } : {}) }, orderBy: { createdAt: 'asc' }, take: 500 })
  return { changes }
})

const port = Number(process.env.PORT ?? 8787)
await app.listen({ port, host: '0.0.0.0' })

process.on('SIGTERM', async () => { await app.close(); await prisma.$disconnect() })

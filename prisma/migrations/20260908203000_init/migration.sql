-- CreateTable
CREATE TABLE "SyncChange" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncChange_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SyncChange_eventId_key" ON "SyncChange"("eventId");
CREATE INDEX "SyncChange_establishmentId_createdAt_idx" ON "SyncChange"("establishmentId", "createdAt");
CREATE INDEX "SyncChange_establishmentId_entityType_entityId_idx" ON "SyncChange"("establishmentId", "entityType", "entityId");
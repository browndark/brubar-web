# Brubar!

PWA offline-first para operação de salão. O IndexedDB continua sendo a fonte local; a API opcional sincroniza mudanças entre dispositivos.

## Instalar pelo celular ou tablet

O GitHub Actions publica automaticamente a versão instalável em:

`https://browndark.github.io/brubar-web/`

No Android, abra o link no Chrome e escolha **Instalar app** ou **Adicionar à tela inicial**. No iPhone/iPad, abra no Safari, toque em compartilhar e escolha **Adicionar à Tela de Início**. O app continua salvando os dados no dispositivo mesmo sem internet.

## Rodar localmente

```bash
npm install
npm run dev
```

Sem `VITE_API_URL`, o app funciona localmente/offline.

## Deploy online sem Docker

O arquivo `render.yaml` publica o frontend PWA, a API Fastify e um PostgreSQL gerenciado. No Render, use **New Blueprint** e conecte este repositório.

Depois do primeiro deploy, confirme os domínios gerados e ajuste `WEB_ORIGIN` e `VITE_API_URL` nas variáveis do serviço. O frontend é público e a API roda com HTTPS.

## Rodar API local sem Docker

Use PostgreSQL gerenciado, por exemplo Neon, Supabase ou Render Postgres. Copie `.env.production.example` para `.env`, preencha `DATABASE_URL` e rode:

```powershell
Copy-Item .env.production.example .env
npm run db:generate
npm run db:migrate
npm run api
```

A API expõe `GET /health`, `POST /api/sync/push` e `GET /api/sync/pull`. O app envia a `SyncQueue` quando está online e consulta alterações novas a cada 15 segundos. Docker não é necessário para produção.

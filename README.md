# AR Trip — MVP Completo

Sistema de gestão para agência de viagens (Anderson): catálogo, reservas, pagamento, localização ao
vivo, conteúdo automatizado via WhatsApp, CRM e Área do Viajante completa.

## Estrutura

```
ar-trip/
├── backend/     → API (NestJS + Prisma + PostgreSQL)
└── frontend/    → Site do cliente + painéis (Next.js + Tailwind)
```

## Como rodar o backend

```bash
cd backend
npm install
cp .env.example .env      # ajuste DATABASE_URL e as chaves de API
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

API sobe em `http://localhost:3333/api`.

O seed já cria o usuário admin do Anderson: `anderson@artrip.com.br` / senha `mude-esta-senha`
(troque antes de produção) — é com essa conta que ele acessa `/admin/*`.

## Como rodar o frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3333/api" > .env.local
npm run dev
```

Site sobe em `http://localhost:3000`.

---

## Mapa completo de páginas

| Rota | Pra quem | O que faz |
|------|----------|-----------|
| `/` | Todos | Catálogo de pacotes |
| `/pacotes/[id]` | Cliente | Detalhe do pacote, datas, mapa de poltronas interativo, botão Reservar |
| `/login`, `/cadastro` | Cliente | Login/cadastro. Cadastro aceita `?ref=codigo` pra creditar indicação |
| `/checkout/[reservaId]` | Cliente | Pix (QR + copia-e-cola), boleto ou cartão (Bricks, ativa com a public key). Confirma sozinho via webhook |
| `/minhas-viagens` | Cliente | Lista de reservas |
| `/minhas-viagens/[reservaId]` | Cliente | **Área do Viajante completa**: roteiro, embarque, documentos, galeria, chat com a agência, link de rastreio ao vivo (quando a viagem está em andamento), botão de avaliação (quando concluída) |
| `/perfil` | Cliente | Pontos de fidelidade e link de indicação |
| `/avaliar/[viagemId]` | Cliente | Avaliação pós-viagem (nota + comentário) |
| `/grupo/[token]` | Qualquer pessoa | Entrar num grupo fechado de viagem |
| `/rastreio/[token]` | Qualquer pessoa | Rastreio público, sem login. Mapa real (Google Maps embed) + botão de compartilhar com amigos/família |
| `/motorista/viagem/[id]` | Motorista | Tela da rodovia animada — liga o GPS com um toque |
| `/painel/whatsapp` | Anderson | QR Code em destaque pra conectar a Evolution API |
| `/admin/viagens-do-dia` | Anderson | Painel "Viagens do Dia" |
| `/admin/localizacao` | Anderson | Mapa ao vivo de todos os ônibus em viagem |
| `/admin/conteudo` | Anderson | Fila de aprovação do conteúdo recebido do WhatsApp (edita legenda, aprova e publica) |
| `/admin/dashboard` | Anderson | Faturamento total, reservas confirmadas, viagens concluídas, nota média, faturamento/ocupação por destino |
| `/admin/cadastro` | Anderson | Cadastro de pacotes, viagens, ônibus (gera poltronas automaticamente) e equipe (motorista/guia/atendente/admin) |

A navegação (topo de todas as páginas) já muda sozinha: cliente vê "Minhas viagens" e perfil; admin vê
o menu completo do painel; equipe (motorista/guia/atendente) vê uma etiqueta própria. Isso resolve a
**distinção clara de perfil** — o `AuthGuard` protege no backend, o `AdminGuard` (componente React)
protege no frontend, e a Nav só mostra o que é relevante pra cada papel.

---

## Endpoints da API (visão geral)

| Área | Endpoints principais |
|------|----------------------|
| Auth | `POST /auth/registrar`, `POST /auth/login` |
| Pacotes | `GET/POST /pacotes`, `GET /pacotes/:id` |
| Viagens | `GET /viagens/do-dia`, `GET /viagens/:id`, `POST /viagens`, `PATCH /viagens/:id/iniciar|encerrar` |
| Ônibus/Poltronas | `GET/POST /onibus`, `GET /onibus/viagens/:viagemId/mapa` |
| Reservas | `POST /reservas`, `GET /reservas/:id`, `PATCH /reservas/:id/confirmar-pagamento|cancelar`, `GET /reservas/cliente/:clienteId` |
| Pagamentos | `POST /pagamentos/pix|boleto|cartao`, `GET /pagamentos/:reservaId/status`, `POST /pagamentos/webhook` (com verificação de assinatura) |
| Localização | `POST /localizacao/viagens/:viagemId/iniciar` (já notifica os passageiros confirmados via WhatsApp), `POST /localizacao/:linkPublico`, `GET /localizacao/rastreio/:linkPublico`, `GET /localizacao/viagens/:viagemId/link-ativo`, `GET /localizacao/painel` |
| WhatsApp | `GET /whatsapp/qrcode|status`, `POST /whatsapp/webhook` (recebe mídia da Evolution API e joga pro módulo de Conteúdo) |
| Conteúdo | `GET /conteudo/pendentes`, `PATCH /conteudo/:id/aprovar|rejeitar`, `POST /conteudo/:id/publicar`, `GET /conteudo/viagem/:viagemId/galeria` |
| Checklist | `GET/PATCH /viagens/:viagemId/checklist`, `POST /viagens/:viagemId/checklist/liberar` |
| Avaliações | `POST /avaliacoes`, `GET /avaliacoes/viagem/:viagemId`, `GET /avaliacoes/media` |
| Grupos | `POST /grupos`, `GET /grupos/:token`, `POST /grupos/:token/entrar` |
| Documentos | `POST /documentos`, `GET /documentos/viagem/:viagemId` |
| Chat | `POST /chat`, `GET /chat/viagem/:viagemId/cliente/:clienteId`, `GET /chat/conversas` (admin) |
| Dashboard | `GET /dashboard/metricas`, `GET /dashboard/faturamento-por-destino` |
| Usuários | `GET/POST /usuarios/equipe` (admin) |

Rotas administrativas usam `AuthGuard` + `RolesGuard` (`@Roles('admin')` etc.) — só quem tem o token
certo e o papel certo acessa.

---

## O que já está de verdade ligado (não é só placeholder)

- **Upload de arquivo de verdade**: `POST /api/uploads` (multipart) salva o arquivo localmente em
  `backend/uploads` e a API os serve em `/uploads/...`. Suficiente pra demo completa; pra produção
  troca-se só o `UploadsService` por R2/S3.
- **Geração de legenda via IA de verdade**: `ConteudoService.gerarLegenda()` chama a API real da
  Anthropic (Claude) ou da OpenAI — usa a primeira chave que estiver configurada
  (`CLAUDE_API_KEY`/`OPENAI_API_KEY`). Sem chave, cai num texto padrão pra nunca travar o fluxo.
- **WhatsApp → baixa a mídia de verdade**: no webhook, a imagem/vídeo vindos da Evolution API é
  baixada e guardada localmente (best-effort; se falhar, mantém a URL original).

- **Postagem automática via WhatsApp**: webhook da Evolution API recebe a mídia → cria o `Conteudo`
  já com legenda gerada → cai na fila de `/admin/conteudo` → Anderson edita/aprova → publica (o
  disparo pras redes sociais em si — Instagram/Facebook/TikTok — é o único pedaço ainda como stub,
  documentado abaixo, porque cada rede exige sua própria integração/aprovação de app).
- **Fidelidade automática**: pontos creditados sozinhos quando a viagem é marcada como concluída,
  inclusive bônus pra quem indicou.
- **Lista de espera com notificação**: quando alguém cancela, o próximo da fila é promovido e avisado
  por WhatsApp automaticamente.
- **Expiração automática do rastreio**: job agendado (`@nestjs/schedule`) roda a cada 30 min e expira
  o link de viagens concluídas há mais de 6h.
- **Checklist de saída bloqueando a liberação**: só libera a viagem como "em andamento" se todos os
  itens do checklist estiverem marcados.
- **Segurança do webhook de pagamento**: valida a assinatura HMAC do Mercado Pago antes de processar
  (com `MERCADOPAGO_WEBHOOK_SECRET` configurado).
- **Cartão com Mercado Pago Bricks**: o checkout agora carrega o componente oficial e cria o Payment
  Brick assim que `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` estiver no `.env.local` do frontend. O token
  gerado pelo Bricks é enviado a `POST /api/pagamentos/cartao`. Sem a chave, a tela explica o que falta.
- **Ocupação de vagas corrigida**: `vagasOcupadas` agora sobe na confirmação e desce no cancelamento;
  ao criar reserva, a poltrona é validada (existe, pertence ao ônibus da viagem e está livre).

## O que ainda é stub / precisa de chave real ou integração externa

- **Publicação de fato no Instagram/Facebook/TikTok**: cada rede exige app aprovado e OAuth próprio —
  o `ConteudoService.publicar()` está com a estrutura pronta (marca como publicado, registra em qual
  rede e quando) mas a chamada real pra API de cada rede social ainda não está plugada.
- **Mapeamento grupo do WhatsApp → viagem**: o webhook recebe a mídia mas ainda precisa de um campo
  ligando o JID do grupo à viagem certa (hoje aceita um `viagemId` direto no payload como atalho).
- **Upload em R2/S3 (produção)**: local funciona; pra produção basta trocar a implementação do
  `UploadsService` pelo SDK da Cloudflare/Amazon.

## Rodando a demo do zero (tudo local, sem internet externa)

```bash
# 1. Postgres local (cluster do usuário, sem sudo)
/usr/lib/postgresql/17/bin/pg_ctl -D <pasta-do-cluster> start
createdb ar_trip -h 127.0.0.1 -p 5432 -U postgres
```

```bash
# 2. Backend
cd backend
npm install
# .env: DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/ar_trip?schema=public"
npx prisma migrate dev --name init
npm run prisma:seed
npm run build
node dist/src/main.js      # build sai em dist/src/, não dist/
```

```bash
# 3. Frontend
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3333/api" > .env.local
npm run build && npm start
```

Acesso: admin `anderson@artrip.com.br` / `mude-esta-senha`. Webhook de pagamento sem secret → 201.

## Passo a passo pra criar cada chave (dever de casa do Anderson)

| Pra quê | Chave | Como criar |
|---------|-------|-----------|
| Legendas de IA | `CLAUDE_API_KEY` ou `OPENAI_API_KEY` | OpenAI: https://platform.openai.com → API keys → Create new secret. Anthropic: https://console.anthropic.com → API Keys → Create Key. O backend usa a primeira que encontrar. |
| Pix/boleto | `MERCADOPAGO_ACCESS_TOKEN` + `MERCADOPAGO_WEBHOOK_SECRET` | https://www.mercadopago.com.br → Painel → Suas integrações → credenciais (access token "prod"). Webhook secret você mesmo gera (ex: `openssl rand -hex 16`); precisa de HTTPS público pros webhooks (ngrok em dev). |
| Cartão (Bricks) | `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` (frontend) | Mesma página de credenciais do Mercado Pago, chave pública "prod". É só colocar no `.env.local` que o checkout já monta o formulário de cartão. |
| Rastreio ao vivo / WhatsApp | Nenhuma | O rastreio roda 100% no servidor (mock de GPS). O WhatsApp só precisa da Evolution API instalada (Docker) e do webhook dela apontando pro `POST /api/whatsapp/webhook`. |
| Postar no Instagram/Facebook/TikTok | app Meta + TikTok Developer | Cada uma aprova seu app (dias úteis) e emite OAuth próprio. É a única peça que não dá pra "fazer do zero" — por isso ficou como stub. |

## Infraestrutura pra rodar tudo de verdade

- `npm install` no backend e no frontend
- Postgres real + `npx prisma migrate dev` + seed
- Evolution API rodando (Docker) + conectar via `/painel/whatsapp` + configurar o webhook dela
  apontando pra `POST /api/whatsapp/webhook`
- Chaves reais: Mercado Pago (`MERCADOPAGO_ACCESS_TOKEN` + `MERCADOPAGO_WEBHOOK_SECRET` + public key),
  Claude/OpenAI (legendas), credenciais de app do Instagram/Facebook/TikTok (publicação)
- Domínio + HTTPS + URL pública pros webhooks (Mercado Pago e Evolution API) — em localhost, use
  ngrok pra testar
- Deploy (Railway/Render/VPS)
- Monitoramento básico (Sentry + Uptime Robot)

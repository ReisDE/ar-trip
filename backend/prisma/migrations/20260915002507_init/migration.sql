-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('admin', 'motorista', 'guia', 'atendente', 'cliente');

-- CreateEnum
CREATE TYPE "StatusViagem" AS ENUM ('agendada', 'em_andamento', 'concluida', 'cancelada');

-- CreateEnum
CREATE TYPE "StatusReserva" AS ENUM ('pendente', 'confirmada', 'cancelada', 'lista_espera');

-- CreateEnum
CREATE TYPE "MetodoPagamento" AS ENUM ('pix', 'cartao', 'boleto');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('pendente', 'aprovado', 'recusado', 'estornado');

-- CreateEnum
CREATE TYPE "TipoConteudo" AS ENUM ('foto', 'video');

-- CreateEnum
CREATE TYPE "StatusConteudo" AS ENUM ('pendente_aprovacao', 'aprovado', 'publicado', 'rejeitado');

-- CreateEnum
CREATE TYPE "RemetenteChat" AS ENUM ('cliente', 'agencia');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "tipo" "TipoUsuario" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "pontos_fidelidade" INTEGER NOT NULL DEFAULT 0,
    "codigo_indicacao" TEXT NOT NULL,
    "indicado_por" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacotes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "descricao" TEXT,
    "preco_base" DECIMAL(65,30) NOT NULL,
    "duracao_dias" INTEGER NOT NULL,
    "inclui" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pacotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onibus" (
    "id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "modelo" TEXT,
    "capacidade" INTEGER NOT NULL,
    "layout_poltronas" JSONB,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "onibus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poltronas" (
    "id" TEXT NOT NULL,
    "onibus_id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" TEXT,

    CONSTRAINT "poltronas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viagens" (
    "id" TEXT NOT NULL,
    "pacote_id" TEXT NOT NULL,
    "data_saida" TIMESTAMP(3) NOT NULL,
    "data_retorno" TIMESTAMP(3) NOT NULL,
    "onibus_id" TEXT,
    "motorista_id" TEXT,
    "guia_id" TEXT,
    "status" "StatusViagem" NOT NULL DEFAULT 'agendada',
    "local_embarque" TEXT NOT NULL,
    "lat_embarque" DECIMAL(65,30),
    "lng_embarque" DECIMAL(65,30),
    "vagas_totais" INTEGER NOT NULL,
    "vagas_ocupadas" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "viagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" TEXT NOT NULL,
    "viagem_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "poltrona_id" TEXT,
    "status" "StatusReserva" NOT NULL DEFAULT 'pendente',
    "valor_total" DECIMAL(65,30) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL,
    "reserva_id" TEXT NOT NULL,
    "metodo" "MetodoPagamento" NOT NULL,
    "parcelas" INTEGER NOT NULL DEFAULT 1,
    "valor" DECIMAL(65,30) NOT NULL,
    "status" "StatusPagamento" NOT NULL DEFAULT 'pendente',
    "gateway_id" TEXT,
    "pago_em" TIMESTAMP(3),

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "localizacoes" (
    "id" TEXT NOT NULL,
    "viagem_id" TEXT NOT NULL,
    "lat" DECIMAL(65,30) NOT NULL,
    "lng" DECIMAL(65,30) NOT NULL,
    "registrado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "link_publico" TEXT NOT NULL,
    "expirado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "localizacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conteudos" (
    "id" TEXT NOT NULL,
    "viagem_id" TEXT,
    "pacote_id" TEXT,
    "tipo" "TipoConteudo" NOT NULL,
    "url_arquivo" TEXT NOT NULL,
    "legenda_gerada" TEXT,
    "legenda_final" TEXT,
    "status" "StatusConteudo" NOT NULL DEFAULT 'pendente_aprovacao',
    "publicado_em" JSONB,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conteudos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" TEXT NOT NULL,
    "viagem_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" TEXT NOT NULL,
    "viagem_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "link_token" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupo_membros" (
    "id" TEXT NOT NULL,
    "grupo_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "entrou_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grupo_membros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklists_viagem" (
    "id" TEXT NOT NULL,
    "viagem_id" TEXT NOT NULL,
    "itens" JSONB NOT NULL,
    "completo" BOOLEAN NOT NULL DEFAULT false,
    "completado_em" TIMESTAMP(3),

    CONSTRAINT "checklists_viagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_viagem" (
    "id" TEXT NOT NULL,
    "viagem_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "url_arquivo" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_viagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens_chat" (
    "id" TEXT NOT NULL,
    "viagem_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "remetente" "RemetenteChat" NOT NULL,
    "texto" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_usuario_id_key" ON "clientes"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_codigo_indicacao_key" ON "clientes"("codigo_indicacao");

-- CreateIndex
CREATE UNIQUE INDEX "onibus_placa_key" ON "onibus"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_reserva_id_key" ON "pagamentos"("reserva_id");

-- CreateIndex
CREATE UNIQUE INDEX "localizacoes_link_publico_key" ON "localizacoes"("link_publico");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_link_token_key" ON "grupos"("link_token");

-- CreateIndex
CREATE UNIQUE INDEX "grupo_membros_grupo_id_cliente_id_key" ON "grupo_membros"("grupo_id", "cliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "checklists_viagem_viagem_id_key" ON "checklists_viagem"("viagem_id");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_indicado_por_fkey" FOREIGN KEY ("indicado_por") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poltronas" ADD CONSTRAINT "poltronas_onibus_id_fkey" FOREIGN KEY ("onibus_id") REFERENCES "onibus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_pacote_id_fkey" FOREIGN KEY ("pacote_id") REFERENCES "pacotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_onibus_id_fkey" FOREIGN KEY ("onibus_id") REFERENCES "onibus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_motorista_id_fkey" FOREIGN KEY ("motorista_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_guia_id_fkey" FOREIGN KEY ("guia_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_viagem_id_fkey" FOREIGN KEY ("viagem_id") REFERENCES "viagens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_poltrona_id_fkey" FOREIGN KEY ("poltrona_id") REFERENCES "poltronas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "localizacoes" ADD CONSTRAINT "localizacoes_viagem_id_fkey" FOREIGN KEY ("viagem_id") REFERENCES "viagens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conteudos" ADD CONSTRAINT "conteudos_viagem_id_fkey" FOREIGN KEY ("viagem_id") REFERENCES "viagens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conteudos" ADD CONSTRAINT "conteudos_pacote_id_fkey" FOREIGN KEY ("pacote_id") REFERENCES "pacotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_viagem_id_fkey" FOREIGN KEY ("viagem_id") REFERENCES "viagens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_viagem_id_fkey" FOREIGN KEY ("viagem_id") REFERENCES "viagens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo_membros" ADD CONSTRAINT "grupo_membros_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo_membros" ADD CONSTRAINT "grupo_membros_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklists_viagem" ADD CONSTRAINT "checklists_viagem_viagem_id_fkey" FOREIGN KEY ("viagem_id") REFERENCES "viagens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_viagem" ADD CONSTRAINT "documentos_viagem_viagem_id_fkey" FOREIGN KEY ("viagem_id") REFERENCES "viagens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_chat" ADD CONSTRAINT "mensagens_chat_viagem_id_fkey" FOREIGN KEY ("viagem_id") REFERENCES "viagens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_chat" ADD CONSTRAINT "mensagens_chat_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

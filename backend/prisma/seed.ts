import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Usuário admin — é com esse login que o Anderson acessa /admin/*
  const senhaHash = await bcrypt.hash('mude-esta-senha', 10);
  await prisma.usuario.upsert({
    where: { email: 'anderson@artrip.com.br' },
    update: {},
    create: {
      nome: 'Anderson',
      email: 'anderson@artrip.com.br',
      senhaHash,
      telefone: '+55 62 90000-0000',
      tipo: 'admin',
    },
  });

  const pacote1 = await prisma.pacote.create({
    data: {
      nome: 'Fim de semana na praia',
      destino: 'Caldas Novas, GO',
      descricao: 'Águas quentes, parque aquático e hospedagem incluída.',
      precoBase: 450,
      duracaoDias: 3,
      inclui: 'Transporte, hospedagem e café da manhã',
    },
  });

  const pacote2 = await prisma.pacote.create({
    data: {
      nome: 'Aventura na Chapada',
      destino: 'Chapada dos Veadeiros, GO',
      descricao: 'Trilhas, cachoeiras e pôr do sol na chapada.',
      precoBase: 380,
      duracaoDias: 2,
      inclui: 'Transporte e guia local',
    },
  });

  const onibus = await prisma.onibus.create({
    data: { placa: 'ART-2024', modelo: 'Marcopolo Paradiso', capacidade: 44 },
  });
  await prisma.poltrona.createMany({
    data: Array.from({ length: 44 }, (_, i) => ({
      onibusId: onibus.id,
      numero: String(i + 1).padStart(2, '0'),
      tipo: 'comum',
    })),
  });

  await prisma.viagem.create({
    data: {
      pacoteId: pacote1.id,
      onibusId: onibus.id,
      dataSaida: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      dataRetorno: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      localEmbarque: 'Terminal Rodoviário de Planaltina, GO',
      vagasTotais: 44,
      status: 'agendada',
    },
  });

  await prisma.viagem.create({
    data: {
      pacoteId: pacote2.id,
      dataSaida: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      dataRetorno: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      localEmbarque: 'Terminal Rodoviário de Planaltina, GO',
      vagasTotais: 44,
      status: 'agendada',
    },
  });

  console.log('Seed concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

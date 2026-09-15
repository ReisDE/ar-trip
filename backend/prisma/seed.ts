import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed DEMO — rodado a cada start do container.
 * - Idempotente: limpa os dados de negócio primeiro (não duplica ao reiniciar).
 * - Uma viagem SEMPRE sai "hoje" às 23:59 → o painel "Viagens de hoje" nunca fica vazio.
 * - Já deixa 1 reserva confirmada + pagamento pra o painel e o mapa de poltronas
 *   mostrarem estado real.
 */
async function main() {
  // 1) Limpa dados de negócio (ordem de dependência: filhos antes dos pais).
  await prisma.mensagemChat.deleteMany({});
  await prisma.documentoViagem.deleteMany({});
  await prisma.checklistViagem.deleteMany({});
  await prisma.grupoMembro.deleteMany({});
  await prisma.grupo.deleteMany({});
  await prisma.avaliacao.deleteMany({});
  await prisma.conteudo.deleteMany({});
  await prisma.localizacao.deleteMany({});
  await prisma.pagamento.deleteMany({});
  await prisma.reserva.deleteMany({});
  await prisma.poltrona.deleteMany({});
  await prisma.viagem.deleteMany({});
  await prisma.onibus.deleteMany({});
  await prisma.pacote.deleteMany({});
  await prisma.cliente.deleteMany({});

  // 2) Admin + motorista (mantém o login do Anderson).
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
  const motorista = await prisma.usuario.upsert({
    where: { email: 'joao.viagens@artrip.com.br' },
    update: {},
    create: {
      nome: 'João do Ônibus',
      email: 'joao.viagens@artrip.com.br',
      senhaHash,
      telefone: '+55 62 98888-7777',
      tipo: 'motorista',
    },
  });

  // 3) Pacotes, ônibus e poltronas.
  const pacoteCaldas = await prisma.pacote.create({
    data: {
      nome: 'Fim de semana na praia',
      destino: 'Caldas Novas, GO',
      descricao: 'Águas quentes, parque aquático e hospedagem incluída.',
      precoBase: 450,
      duracaoDias: 3,
      inclui: 'Transporte, hospedagem e café da manhã',
    },
  });
  const pacoteChapada = await prisma.pacote.create({
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

  // 4) Viagens: uma HOJE às 23:59 (aparece no "Viagens de hoje"),
  //    as outras nos próximos dias.
  const hoje = new Date();
  hoje.setHours(23, 59, 0, 0);
  const somaDias = (base: Date, dias: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + dias);
    return d;
  };

  const viagemHoje = await prisma.viagem.create({
    data: {
      pacoteId: pacoteCaldas.id,
      onibusId: onibus.id,
      motoristaId: motorista.id,
      dataSaida: hoje,
      dataRetorno: somaDias(hoje, 3),
      localEmbarque: 'Terminal Rodoviário de Planaltina, GO',
      vagasTotais: 44,
      status: 'agendada',
    },
  });
  await prisma.viagem.create({
    data: {
      pacoteId: pacoteChapada.id,
      onibusId: onibus.id,
      motoristaId: motorista.id,
      dataSaida: somaDias(hoje, 7),
      dataRetorno: somaDias(hoje, 9),
      localEmbarque: 'Terminal Rodoviário de Planaltina, GO',
      vagasTotais: 44,
      status: 'agendada',
    },
  });
  await prisma.viagem.create({
    data: {
      pacoteId: pacoteCaldas.id,
      dataSaida: somaDias(hoje, 14),
      dataRetorno: somaDias(hoje, 17),
      localEmbarque: 'Terminal Rodoviário de Planaltina, GO',
      vagasTotais: 44,
      status: 'agendada',
    },
  });

  // 5) Um cliente com reserva confirmada + pagamento aprovado, pra o painel
  //    mostrar "1/44 vagas" e a poltrona 01 ocupada no mapa.
  const cliente = await prisma.cliente.create({
    data: {
      nome: 'Carlos Siqueira',
      telefone: '+55 62 97777-6666',
      email: 'carlos.siqueira@email.com',
      pontosFidelidade: 120,
      codigoIndicacao: 'CARLOS-2026',
    },
  });
  const poltrona01 = await prisma.poltrona.findFirst({
    where: { onibusId: onibus.id, numero: '01' },
  });
  const reserva = await prisma.reserva.create({
    data: {
      viagemId: viagemHoje.id,
      clienteId: cliente.id,
      poltronaId: poltrona01?.id,
      status: 'confirmada',
      valorTotal: 450,
    },
  });
  await prisma.pagamento.create({
    data: {
      reservaId: reserva.id,
      metodo: 'pix',
      valor: 450,
      status: 'aprovado',
      pagoEm: new Date(),
    },
  });
  await prisma.viagem.update({
    where: { id: viagemHoje.id },
    data: { vagasOcupadas: 1 },
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
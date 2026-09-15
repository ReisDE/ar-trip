'use client';

import { useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { AdminGuard } from '../../../components/AdminGuard';

type Aba = 'pacote' | 'viagem' | 'onibus' | 'equipe';

export default function Cadastro() {
  const [aba, setAba] = useState<Aba>('pacote');
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(caminho: string, dados: Record<string, unknown>) {
    setErro(null);
    setMensagem(null);
    try {
      await apiFetch(caminho, { method: 'POST', body: JSON.stringify(dados) });
      setMensagem('Cadastrado com sucesso!');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar');
    }
  }

  const abas: { id: Aba; rotulo: string }[] = [
    { id: 'pacote', rotulo: 'Pacote' },
    { id: 'viagem', rotulo: 'Viagem' },
    { id: 'onibus', rotulo: 'Ônibus' },
    { id: 'equipe', rotulo: 'Motorista/Guia' },
  ];

  return (
    <AdminGuard>
      <main className="min-h-screen bg-linho px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <p className="font-display uppercase tracking-wide text-terracota text-sm mb-1">Painel do Anderson</p>
          <h1 className="font-display text-3xl mb-6">Cadastros</h1>

          <div className="flex gap-2 mb-8">
            {abas.map((a) => (
              <button
                key={a.id}
                onClick={() => setAba(a.id)}
                className={`px-4 py-2 font-display text-sm ${aba === a.id ? 'bg-estrada text-linho' : 'border border-tinta/20 text-tinta/60'}`}
              >
                {a.rotulo}
              </button>
            ))}
          </div>

          {mensagem && <p className="text-estrada text-sm mb-4">{mensagem}</p>}
          {erro && <p className="text-terracota text-sm mb-4">{erro}</p>}

          {aba === 'pacote' && <FormPacote onEnviar={(d) => enviar('/pacotes', d)} />}
          {aba === 'viagem' && <FormViagem onEnviar={(d) => enviar('/viagens', d)} />}
          {aba === 'onibus' && <FormOnibus onEnviar={(d) => enviar('/onibus', d)} />}
          {aba === 'equipe' && <FormEquipe onEnviar={(d) => enviar('/usuarios/equipe', d)} />}
        </div>
      </main>
    </AdminGuard>
  );
}

function Campo({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block mb-4">
      <span className="block text-sm text-tinta/60 mb-1">{label}</span>
      <input className="w-full border border-tinta/20 bg-white px-4 py-2" {...props} />
    </label>
  );
}

function FormPacote({ onEnviar }: { onEnviar: (d: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({ nome: '', destino: '', precoBase: '', duracaoDias: '', inclui: '' });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onEnviar({ ...form, precoBase: Number(form.precoBase), duracaoDias: Number(form.duracaoDias) });
      }}
    >
      <Campo label="Nome do pacote" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
      <Campo label="Destino" required value={form.destino} onChange={(e) => setForm({ ...form, destino: e.target.value })} />
      <Campo label="Preço base (R$)" type="number" required value={form.precoBase} onChange={(e) => setForm({ ...form, precoBase: e.target.value })} />
      <Campo label="Duração (dias)" type="number" required value={form.duracaoDias} onChange={(e) => setForm({ ...form, duracaoDias: e.target.value })} />
      <Campo label="O que está incluso" value={form.inclui} onChange={(e) => setForm({ ...form, inclui: e.target.value })} />
      <button className="bg-estrada text-linho font-display px-6 py-2">Cadastrar pacote</button>
    </form>
  );
}

function FormViagem({ onEnviar }: { onEnviar: (d: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({ pacoteId: '', dataSaida: '', dataRetorno: '', localEmbarque: '', vagasTotais: '', onibusId: '' });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onEnviar({ ...form, vagasTotais: Number(form.vagasTotais) });
      }}
    >
      <Campo label="ID do pacote" required value={form.pacoteId} onChange={(e) => setForm({ ...form, pacoteId: e.target.value })} />
      <Campo label="ID do ônibus (opcional)" value={form.onibusId} onChange={(e) => setForm({ ...form, onibusId: e.target.value })} />
      <Campo label="Data/hora de saída" type="datetime-local" required value={form.dataSaida} onChange={(e) => setForm({ ...form, dataSaida: e.target.value })} />
      <Campo label="Data/hora de retorno" type="datetime-local" required value={form.dataRetorno} onChange={(e) => setForm({ ...form, dataRetorno: e.target.value })} />
      <Campo label="Local de embarque" required value={form.localEmbarque} onChange={(e) => setForm({ ...form, localEmbarque: e.target.value })} />
      <Campo label="Vagas totais" type="number" required value={form.vagasTotais} onChange={(e) => setForm({ ...form, vagasTotais: e.target.value })} />
      <button className="bg-estrada text-linho font-display px-6 py-2">Cadastrar viagem</button>
    </form>
  );
}

function FormOnibus({ onEnviar }: { onEnviar: (d: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({ placa: '', modelo: '', capacidade: '' });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onEnviar({ ...form, capacidade: Number(form.capacidade) });
      }}
    >
      <Campo label="Placa" required value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value })} />
      <Campo label="Modelo" value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
      <Campo label="Capacidade (poltronas)" type="number" required value={form.capacidade} onChange={(e) => setForm({ ...form, capacidade: e.target.value })} />
      <p className="text-xs text-tinta/50 mb-4">As poltronas são geradas automaticamente (01, 02, 03...) até a capacidade informada.</p>
      <button className="bg-estrada text-linho font-display px-6 py-2">Cadastrar ônibus</button>
    </form>
  );
}

function FormEquipe({ onEnviar }: { onEnviar: (d: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', telefone: '', tipo: 'motorista' });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onEnviar(form);
      }}
    >
      <Campo label="Nome" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
      <Campo label="E-mail" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Campo label="Senha provisória" type="password" required minLength={6} value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} />
      <Campo label="Telefone (WhatsApp)" required value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
      <label className="block mb-4">
        <span className="block text-sm text-tinta/60 mb-1">Papel</span>
        <select
          className="w-full border border-tinta/20 bg-white px-4 py-2"
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
        >
          <option value="motorista">Motorista</option>
          <option value="guia">Guia</option>
          <option value="atendente">Atendente</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <button className="bg-estrada text-linho font-display px-6 py-2">Cadastrar</button>
    </form>
  );
}

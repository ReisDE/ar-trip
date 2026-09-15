'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch, salvarSessao } from '../../lib/api';

function FormCadastro() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codigoIndicacao = searchParams.get('ref') ?? undefined;
  const [form, setForm] = useState({ nome: '', email: '', senha: '', telefone: '' });
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const data = await apiFetch('/auth/registrar', {
        method: 'POST',
        body: JSON.stringify({ ...form, codigoIndicacao }),
      });
      salvarSessao(data.token, data.cliente, data.tipo ?? 'cliente');
      router.push('/');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui criar sua conta');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-linho flex items-center justify-center px-6">
      <form onSubmit={enviar} className="w-full max-w-sm">
        <p className="font-display uppercase tracking-wide text-terracota text-sm mb-2">Criar conta</p>
        <h1 className="font-display text-3xl mb-8">Bem-vindo à AR Trip</h1>

        <div className="space-y-4 mb-6">
          <input
            className="w-full border border-tinta/20 bg-white px-4 py-3"
            placeholder="Nome completo"
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <input
            className="w-full border border-tinta/20 bg-white px-4 py-3"
            placeholder="E-mail"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="w-full border border-tinta/20 bg-white px-4 py-3"
            placeholder="Telefone (WhatsApp)"
            required
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
          />
          <input
            className="w-full border border-tinta/20 bg-white px-4 py-3"
            placeholder="Senha"
            type="password"
            required
            minLength={6}
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
          />
        </div>

        {erro && <p className="text-terracota text-sm mb-4">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-estrada hover:bg-estrada-escura transition-colors text-linho font-display py-3 disabled:opacity-60"
        >
          {carregando ? 'Criando conta...' : 'Criar conta'}
        </button>

        <p className="text-sm text-tinta/60 mt-4 text-center">
          Já tem conta? <a href="/login" className="text-estrada underline">Entrar</a>
        </p>
      </form>
    </main>
  );
}

export default function Cadastro() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-linho flex items-center justify-center px-6">
          <p className="text-tinta/50">Carregando...</p>
        </main>
      }
    >
      <FormCadastro />
    </Suspense>
  );
}

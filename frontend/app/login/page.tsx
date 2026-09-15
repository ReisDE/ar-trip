'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, salvarSessao } from '../../lib/api';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(form) });
      salvarSessao(data.token, data.cliente, data.tipo);
      router.push(data.tipo === 'admin' ? '/admin/viagens-do-dia' : '/');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui entrar');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-linho flex items-center justify-center px-6">
      <form onSubmit={enviar} className="w-full max-w-sm">
        <p className="font-display uppercase tracking-wide text-terracota text-sm mb-2">Entrar</p>
        <h1 className="font-display text-3xl mb-8">Acessar minha conta</h1>

        <div className="space-y-4 mb-6">
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
            placeholder="Senha"
            type="password"
            required
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
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="text-sm text-tinta/60 mt-4 text-center">
          Não tem conta? <a href="/cadastro" className="text-estrada underline">Criar conta</a>
        </p>
      </form>
    </main>
  );
}

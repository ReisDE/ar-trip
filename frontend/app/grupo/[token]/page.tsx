'use client';

import { useEffect, useState } from 'react';
import { apiFetch, pegarCliente } from '../../../lib/api';

type Grupo = {
  nome: string;
  viagem: { pacote: { destino: string } };
  membros: { cliente: { nome: string } }[];
};

export default function PaginaGrupo({ params }: { params: { token: string } }) {
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [entrou, setEntrou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      setGrupo(await apiFetch(`/grupos/${params.token}`));
    } catch {
      setErro('Esse link de grupo não existe mais.');
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function entrarNoGrupo() {
    const cliente = pegarCliente();
    if (!cliente) {
      window.location.href = '/login';
      return;
    }
    await apiFetch(`/grupos/${params.token}/entrar`, {
      method: 'POST',
      body: JSON.stringify({ clienteId: cliente.id }),
    });
    setEntrou(true);
    carregar();
  }

  if (erro) return <main className="min-h-screen bg-linho flex items-center justify-center px-6"><p className="text-terracota">{erro}</p></main>;
  if (!grupo) return <main className="min-h-screen bg-linho flex items-center justify-center px-6"><p className="text-tinta/50">Carregando...</p></main>;

  return (
    <main className="min-h-screen bg-linho flex flex-col items-center justify-center px-6 text-center">
      <p className="font-display uppercase tracking-wide text-terracota text-sm mb-2">Grupo fechado</p>
      <h1 className="font-display text-3xl mb-1">{grupo.nome}</h1>
      <p className="text-tinta/60 mb-8">{grupo.viagem.pacote.destino}</p>

      <p className="text-sm text-tinta/60 mb-6">{grupo.membros.length} pessoa(s) já confirmaram nesse grupo</p>

      {!entrou && (
        <button onClick={entrarNoGrupo} className="bg-estrada text-linho font-display px-8 py-3">
          Entrar no grupo
        </button>
      )}
      {entrou && <p className="text-estrada font-display">Você já faz parte desse grupo! 🎉</p>}
    </main>
  );
}

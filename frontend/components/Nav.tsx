'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { pegarCliente, pegarTipo, encerrarSessao } from '../lib/api';

export function Nav() {
  const [tipo, setTipo] = useState<string | null>(null);
  const [nome, setNome] = useState<string | null>(null);

  useEffect(() => {
    setTipo(pegarTipo());
    setNome(pegarCliente()?.nome ?? null);
  }, []);

  const ehAdmin = tipo === 'admin';
  const ehEquipe = tipo === 'motorista' || tipo === 'guia' || tipo === 'atendente';

  return (
    <nav className="bg-tinta text-linho px-6 py-3 flex items-center justify-between text-sm">
      <Link href="/" className="font-display text-lg tracking-wide">
        AR TRIP
      </Link>

      <div className="flex items-center gap-5">
        {ehAdmin && (
          <>
            <span className="text-poeira font-display uppercase text-xs tracking-wide">Painel Anderson</span>
            <Link href="/admin/dashboard" className="hover:text-poeira transition-colors">Dashboard</Link>
            <Link href="/admin/viagens-do-dia" className="hover:text-poeira transition-colors">Viagens do dia</Link>
            <Link href="/admin/localizacao" className="hover:text-poeira transition-colors">Localização</Link>
            <Link href="/admin/conteudo" className="hover:text-poeira transition-colors">Conteúdo</Link>
            <Link href="/admin/cadastro" className="hover:text-poeira transition-colors">Cadastros</Link>
            <Link href="/painel/whatsapp" className="hover:text-poeira transition-colors">WhatsApp</Link>
          </>
        )}

        {ehEquipe && (
          <span className="text-poeira font-display uppercase text-xs tracking-wide">
            Equipe · {tipo}
          </span>
        )}

        {!ehAdmin && !ehEquipe && nome && (
          <>
            <Link href="/minhas-viagens" className="hover:text-poeira transition-colors">Minhas viagens</Link>
            <Link href="/perfil" className="hover:text-poeira transition-colors">{nome.split(' ')[0]}</Link>
          </>
        )}

        {!nome && (
          <>
            <Link href="/login" className="hover:text-poeira transition-colors">Entrar</Link>
            <Link href="/cadastro" className="bg-estrada px-3 py-1.5 font-display hover:bg-estrada-escura transition-colors">
              Criar conta
            </Link>
          </>
        )}

        {nome && (
          <button
            onClick={() => {
              encerrarSessao();
              window.location.href = '/';
            }}
            className="text-linho/50 hover:text-terracota transition-colors text-xs"
          >
            sair
          </button>
        )}
      </div>
    </nav>
  );
}

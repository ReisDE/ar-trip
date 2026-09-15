export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

export function salvarSessao(token: string, cliente: unknown, tipo: string = 'cliente') {
  localStorage.setItem('artrip_token', token);
  localStorage.setItem('artrip_cliente', JSON.stringify(cliente));
  localStorage.setItem('artrip_tipo', tipo);
}

export function pegarToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('artrip_token');
}

export function pegarCliente<T = { id: string; nome: string; pontosFidelidade?: number; codigoIndicacao?: string }>(): T | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('artrip_cliente');
  return raw ? JSON.parse(raw) : null;
}

export function pegarTipo(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('artrip_tipo');
}

export function encerrarSessao() {
  localStorage.removeItem('artrip_token');
  localStorage.removeItem('artrip_cliente');
  localStorage.removeItem('artrip_tipo');
}

export async function apiFetch(caminho: string, opcoes: RequestInit = {}) {
  const token = pegarToken();
  const res = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opcoes.headers,
    },
  });
  if (!res.ok) {
    const erro = await res.json().catch(() => ({ message: 'Erro inesperado' }));
    throw new Error(erro.message ?? 'Erro inesperado');
  }
  return res.json();
}

'use client';

export function Rodovia({ animando }: { animando: boolean }) {
  return (
    <svg viewBox="0 0 800 200" className="w-full h-auto" role="img" aria-label="Rodovia com ônibus">
      {/* pista */}
      <rect x="0" y="70" width="800" height="60" fill="#16232B" />
      {/* acostamento */}
      <rect x="0" y="66" width="800" height="4" fill="#E3B23C" />
      <rect x="0" y="130" width="800" height="4" fill="#E3B23C" />
      {/* faixa central pontilhada */}
      <g>
        <rect x="0" y="98" width="800" height="4" fill="#F6F1E7">
          {animando && (
            <animate attributeName="x" from="0" to="-40" dur="0.6s" repeatCount="indefinite" />
          )}
        </rect>
      </g>
      {/* placa de destino */}
      <g transform="translate(600,20)">
        <rect width="150" height="40" rx="4" fill="#0E6E55" />
        <text x="75" y="26" textAnchor="middle" fill="#F6F1E7" fontFamily="Oswald, sans-serif" fontSize="16">
          SEU DESTINO
        </text>
      </g>
      {/* ônibus */}
      <g transform="translate(80,78)">
        <rect width="90" height="44" rx="6" fill="#E3B23C" />
        <rect x="8" y="8" width="20" height="14" rx="2" fill="#16232B" />
        <rect x="34" y="8" width="20" height="14" rx="2" fill="#16232B" />
        <rect x="60" y="8" width="20" height="14" rx="2" fill="#16232B" />
        <circle cx="20" cy="48" r="8" fill="#16232B" />
        <circle cx="70" cy="48" r="8" fill="#16232B" />
      </g>
    </svg>
  );
}

export function ActivityChart({ points }: { points: { label: string; value: number }[] }) {
  const width = 720;
  const height = 220;
  const padX = 20;
  const padTop = 16;
  const padBottom = 32;
  const max = Math.max(1, ...points.map((point) => point.value));
  const inner = height - padTop - padBottom;
  const step = points.length > 1 ? (width - padX * 2) / (points.length - 1) : 0;
  const coords = points.map((point, index) => ({
    ...point,
    x: padX + index * step,
    y: padTop + (1 - point.value / max) * inner,
  }));
  const base = height - padBottom;
  const line = coords.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const area =
    `M ${coords[0]?.x.toFixed(1) ?? padX} ${base} ` +
    coords.map((point) => `L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ") +
    ` L ${coords[coords.length - 1]?.x.toFixed(1) ?? width - padX} ${base} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full" role="img">
      <defs>
        <linearGradient id="korrigo-activity" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#006233" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#006233" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((tick) => {
        const y = padTop + tick * inner;
        return <line key={tick} x1={padX} x2={width - padX} y1={y} y2={y} stroke="#e3f3ea" strokeWidth="1" />;
      })}
      <path d={area} fill="url(#korrigo-activity)" />
      <polyline points={line} fill="none" stroke="#006233" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {coords.map((point) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r="4.5" fill="#ffffff" stroke="#006233" strokeWidth="2" />
          <text x={point.x} y={height - 8} textAnchor="middle" fill="#64748b" fontSize="12">
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function MixRing({
  free,
  paid,
  totalLabel,
  freeLabel,
  paidLabel,
}: {
  free: number;
  paid: number;
  totalLabel: string;
  freeLabel: string;
  paidLabel: string;
}) {
  const total = free + paid;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const freeLength = total === 0 ? 0 : (free / total) * circumference;
  const paidLength = total === 0 ? 0 : circumference - freeLength;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 140 140" className="h-32 w-32 shrink-0" role="img">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e3f3ea" strokeWidth="14" />
        {freeLength > 0 ? (
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#006233"
            strokeWidth="14"
            strokeDasharray={`${freeLength} ${circumference - freeLength}`}
            transform="rotate(-90 70 70)"
          />
        ) : null}
        {paidLength > 0 ? (
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#d21034"
            strokeWidth="14"
            strokeDasharray={`${paidLength} ${circumference - paidLength}`}
            strokeDashoffset={-freeLength}
            transform="rotate(-90 70 70)"
          />
        ) : null}
        <text x="70" y="68" textAnchor="middle" fill="#00361c" fontSize="26" fontWeight="700">
          {total}
        </text>
        <text x="70" y="88" textAnchor="middle" fill="#64748b" fontSize="11">
          {totalLabel}
        </text>
      </svg>
      <ul className="min-w-0 space-y-3 text-sm">
        <li className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-700" />
            {freeLabel}
          </span>
          <span className="font-semibold text-brand-900">{free}</span>
        </li>
        <li className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-ai-500" />
            {paidLabel}
          </span>
          <span className="font-semibold text-brand-900">{paid}</span>
        </li>
      </ul>
    </div>
  );
}

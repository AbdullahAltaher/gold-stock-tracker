import { formatChange } from '../lib/stockApi'

export default function Ticker({ quotes }) {
  if (!quotes || quotes.length === 0) return null

  const items = [...quotes, ...quotes]

  return (
    <div className="ticker-wrap bg-surface-300 border-b border-white/5 py-2">
      <div className="ticker-inner">
        {items.map((q, i) => {
          const pct = q.regularMarketChangePercent ?? 0
          const { label, cls } = formatChange(pct)
          return (
            <span key={i} className="inline-flex items-center gap-1.5 mx-6 text-xs font-mono">
              <span className="text-white/70 font-semibold">{q.symbol?.split('.')[0]}</span>
              <span className="text-white/50">{q.regularMarketPrice?.toFixed(3)}</span>
              <span className={cls}>{label}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
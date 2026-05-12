import { formatChange } from '../lib/stockApi'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StockRow({ quote, skeleton = false }) {
  if (skeleton) {
    return (
      <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5 last:border-0">
        <div className="skeleton h-4 w-16 rounded" />
        <div className="skeleton h-3 w-28 rounded flex-1" />
        <div className="skeleton h-4 w-16 rounded" />
        <div className="skeleton h-4 w-14 rounded" />
      </div>
    )
  }

  const pct = quote.regularMarketChangePercent ?? 0
  const { label, cls } = formatChange(pct)
  const Icon = pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
      <div className="w-20 shrink-0">
        <div className="font-mono font-semibold text-white text-sm">
          {quote.symbol?.split('.')[0] ?? '—'}
        </div>
        <div className="text-white/30 text-[10px]">{quote.symbol?.split('.')[1] ?? ''}</div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-white/60 text-xs truncate">{quote.shortName ?? quote.symbol}</div>
        {quote._mock && <span className="text-[9px] text-yellow-500/60">demo</span>}
      </div>

      <div className="text-right w-20 shrink-0">
        <div className="font-mono text-white font-medium text-sm">
          {quote.regularMarketPrice?.toFixed(3) ?? '—'}
        </div>
        <div className="text-white/30 text-[10px]">AED</div>
      </div>

      <div className={`flex items-center gap-1 w-20 justify-end shrink-0 ${cls}`}>
        <Icon size={12} />
        <span className="font-mono text-xs font-medium">{label}</span>
      </div>
    </div>
  )
}
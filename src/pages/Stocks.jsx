import { useState } from 'react'
import { useStocks } from '../hooks/useStocks'
import StockRow from '../components/StockRow'
import { TrendingUp, TrendingDown, RefreshCw, Search } from 'lucide-react'

export default function Stocks() {
  const { quotes, loading, refresh } = useStocks()
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const markets = ['ALL', 'DFM', 'ADX']

  const filtered = quotes.filter(q => {
    const mkt = q.symbol?.includes('.DFM') ? 'DFM' : 'ADX'
    if (filter !== 'ALL' && mkt !== filter) return false
    if (search) {
      const sym  = q.symbol?.toLowerCase() ?? ''
      const name = (q.shortName ?? '').toLowerCase()
      return sym.includes(search.toLowerCase()) || name.includes(search.toLowerCase())
    }
    return true
  })

  const gainers = quotes.filter(q => (q.regularMarketChangePercent ?? 0) > 0).length
  const losers  = quotes.filter(q => (q.regularMarketChangePercent ?? 0) < 0).length

  return (
    <div className="max-w-4xl mx-auto space-y-6 page-enter">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Stocks</h1>
          <p className="text-white/40 text-sm mt-1">DFM · ADX live quotes</p>
        </div>
        <button onClick={refresh} className="btn-outline flex items-center gap-2 text-xs">
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* Market sentiment */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-white/40 text-xs mb-1 uppercase tracking-wider">Tracked</div>
          <div className="font-display font-bold text-white text-2xl">{quotes.length}</div>
          <div className="text-white/30 text-xs">securities</div>
        </div>
        <div className="card text-center">
          <div className="text-white/40 text-xs mb-1 uppercase tracking-wider">Gaining</div>
          <div className="font-display font-bold text-emerald-400 text-2xl">{gainers}</div>
          <div className="text-white/30 text-xs flex items-center justify-center gap-1">
            <TrendingUp size={10} className="text-emerald-400" /> up today
          </div>
        </div>
        <div className="card text-center">
          <div className="text-white/40 text-xs mb-1 uppercase tracking-wider">Declining</div>
          <div className="font-display font-bold text-red-400 text-2xl">{losers}</div>
          <div className="text-white/30 text-xs flex items-center justify-center gap-1">
            <TrendingDown size={10} className="text-red-400" /> down today
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search symbol or name…"
            className="input-dark pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-surface-300 p-1 rounded-xl">
          {markets.map(m => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium font-display transition-all
                ${filter === m ? 'bg-gold-gradient text-black' : 'text-white/50 hover:text-white'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-white/5 text-white/30 text-[10px] uppercase tracking-widest">
          <span className="w-20">Symbol</span>
          <span className="flex-1">Name</span>
          <span className="w-20 text-right">Price</span>
          <span className="w-20 text-right">Change</span>
        </div>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <StockRow key={i} skeleton />)
          : filtered.length === 0
            ? <div className="py-12 text-center text-white/30 text-sm">No results for "{search}"</div>
            : filtered.map(q => <StockRow key={q.symbol} quote={q} />)
        }
      </div>

      {quotes.some(q => q._mock) && (
        <p className="text-yellow-500/60 text-xs text-center">
          ⚠ Demo data shown — Yahoo Finance unavailable in this environment.
          Live prices will load on Vercel via the proxy rewrite.
        </p>
      )}
    </div>
  )
}
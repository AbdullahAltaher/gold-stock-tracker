import { useAuth } from '../context/AuthContext'
import { useGoldPrice } from '../hooks/useGoldPrice'
import { useStocks } from '../hooks/useStocks'
import GoldPriceCard from '../components/GoldPriceCard'
import StockRow from '../components/StockRow'
import Ticker from '../components/Ticker'
import { fmtAED } from '../lib/goldApi'
import { RefreshCw, TrendingUp, Coins, Activity } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const { xauUsd, prices, loading: goldLoading, source, lastUpdate, refresh } = useGoldPrice()
  const { quotes, loading: stockLoading } = useStocks()
  const [txCount, setTxCount] = useState(null)

  // Quick portfolio summary
  useEffect(() => {
    if (!user) return
    supabase.from('transactions').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setTxCount(count ?? 0))
  }, [user])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  // Top movers
  const topMovers = [...quotes]
    .filter(q => q.regularMarketChangePercent !== undefined)
    .sort((a, b) => Math.abs(b.regularMarketChangePercent) - Math.abs(a.regularMarketChangePercent))
    .slice(0, 5)

  return (
    <div className="max-w-5xl mx-auto space-y-6 page-enter">
      {/* Ticker */}
      {quotes.length > 0 && (
        <div className="-mx-4 md:-mx-6 -mt-4 md:-mt-6 mb-0">
          <Ticker quotes={quotes} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {new Date().toLocaleDateString('en-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={refresh}
          className="btn-outline flex items-center gap-2 text-xs"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* XAU/USD Hero */}
      <div className="card relative overflow-hidden glow-gold">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-400/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Coins size={14} className="text-gold-400" />
              <span className="text-white/50 text-xs uppercase tracking-widest font-medium">XAU / USD Spot</span>
              {source === 'fallback' && (
                <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">estimated</span>
              )}
            </div>
            {goldLoading ? (
              <div className="skeleton h-10 w-48 rounded" />
            ) : (
              <div className="shimmer-gold font-display font-bold text-4xl md:text-5xl">
                ${xauUsd?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
              </div>
            )}
            <div className="text-white/30 text-xs mt-1">
              {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' })}` : 'Loading…'}
            </div>
          </div>
          {prices && (
            <div className="flex gap-4 flex-wrap">
              <div className="text-right">
                <div className="text-white/30 text-[10px] uppercase tracking-wider">24K /g</div>
                <div className="font-mono text-gold-400 font-semibold">{fmtAED(prices['24K'])}</div>
              </div>
              <div className="text-right">
                <div className="text-white/30 text-[10px] uppercase tracking-wider">21K /g</div>
                <div className="font-mono text-gold-300 font-semibold">{fmtAED(prices['21K'])}</div>
              </div>
              <div className="text-right">
                <div className="text-white/30 text-[10px] uppercase tracking-wider">18K /g</div>
                <div className="font-mono text-gold-200 font-semibold">{fmtAED(prices['18K'])}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tracked Stocks', value: quotes.length || '—', icon: TrendingUp },
          { label: 'Transactions',   value: txCount ?? '—',       icon: Activity  },
          { label: 'Active Market',  value: 'DFM · ADX',          icon: Coins     },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card text-center">
            <Icon size={16} className="text-gold-400 mx-auto mb-2" />
            <div className="font-display font-bold text-white text-lg">{value}</div>
            <div className="text-white/40 text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Gold prices grid */}
      <div>
        <h2 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
          <Coins size={15} className="text-gold-400" />
          Gold Prices — Today
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['24K', '22K', '21K', '18K'].map(carat => (
            <GoldPriceCard
              key={carat}
              carat={carat}
              pricePerGram={prices?.[carat]}
              loading={goldLoading}
            />
          ))}
        </div>
      </div>

      {/* Top movers */}
      <div>
        <h2 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp size={15} className="text-gold-400" />
          Top Movers
        </h2>
        <div className="card p-0 overflow-hidden">
          {stockLoading
            ? Array.from({ length: 5 }).map((_, i) => <StockRow key={i} skeleton />)
            : topMovers.map(q => <StockRow key={q.symbol} quote={q} />)
          }
        </div>
      </div>
    </div>
  )
}

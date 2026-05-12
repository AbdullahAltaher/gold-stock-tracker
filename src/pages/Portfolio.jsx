import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useGoldPrice } from '../hooks/useGoldPrice'
import { supabase } from '../lib/supabase'
import { fmtAED } from '../lib/goldApi'
import AddTransactionModal from '../components/AddTransactionModal'
import { Plus, Trash2, TrendingUp, Coins, RefreshCw, BarChart3 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

export default function Portfolio() {
  const { user } = useAuth()
  const { prices } = useGoldPrice()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [filter, setFilter]     = useState('all')
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false })
    setTransactions(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  async function handleDelete(id) {
    setDeleting(id)
    await supabase.from('transactions').delete().eq('id', id)
    setTransactions(ts => ts.filter(t => t.id !== id))
    setDeleting(null)
  }

  // ── Computed summaries ──────────────────────────────────────
  const stockTx = transactions.filter(t => t.type === 'stock')
  const goldTx  = transactions.filter(t => t.type === 'gold')

  const totalStockCost = stockTx.reduce((s, t) => s + (t.quantity * t.price_aed), 0)
  const totalGoldCost  = goldTx.reduce((s, t) => s + (t.total_aed ?? 0), 0)
  const totalGoldGrams = goldTx.reduce((s, t) => s + (t.weight_grams ?? 0), 0)

  // Current gold value
  const currentGoldValue = goldTx.reduce((sum, t) => {
    const priceNow = prices?.[t.carat] ?? 0
    return sum + (t.weight_grams ?? 0) * priceNow
  }, 0)
  const goldPnl = currentGoldValue - totalGoldCost

  // Chart data — gold by carat
  const goldByCaratMap = {}
  goldTx.forEach(t => {
    goldByCaratMap[t.carat] = (goldByCaratMap[t.carat] ?? 0) + (t.weight_grams ?? 0)
  })
  const goldChartData = Object.entries(goldByCaratMap).map(([carat, grams]) => ({ carat, grams }))

  // Stock by symbol
  const stockMap = {}
  stockTx.forEach(t => {
    if (!stockMap[t.symbol]) stockMap[t.symbol] = { symbol: t.symbol, shares: 0, cost: 0 }
    stockMap[t.symbol].shares += t.quantity
    stockMap[t.symbol].cost   += t.quantity * t.price_aed
  })

  const filtered = transactions.filter(t => filter === 'all' || t.type === filter)

  return (
    <div className="max-w-4xl mx-auto space-y-6 page-enter">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Portfolio</h1>
          <p className="text-white/40 text-sm mt-1">Your transactions & holdings</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-gold flex items-center gap-2"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <Coins size={14} className="text-gold-400 mb-2" />
          <div className="font-display font-bold text-white text-lg">{totalGoldGrams.toFixed(1)}g</div>
          <div className="text-white/40 text-xs">Total gold</div>
        </div>
        <div className="card">
          <Coins size={14} className="text-gold-400 mb-2" />
          <div className="font-display font-bold text-white text-lg">{fmtAED(totalGoldCost, 0)}</div>
          <div className="text-white/40 text-xs">Gold cost</div>
        </div>
        <div className="card">
          <div className="text-[10px] text-white/30 mb-1">Current value</div>
          <div className={`font-display font-bold text-lg ${prices ? 'text-white' : 'text-white/30'}`}>
            {prices ? fmtAED(currentGoldValue, 0) : '—'}
          </div>
          <div className={`text-xs font-mono ${goldPnl >= 0 ? 'stat-up' : 'stat-down'}`}>
            {prices ? (goldPnl >= 0 ? '+' : '') + fmtAED(goldPnl, 0) : ''}
          </div>
        </div>
        <div className="card">
          <TrendingUp size={14} className="text-gold-400 mb-2" />
          <div className="font-display font-bold text-white text-lg">{fmtAED(totalStockCost, 0)}</div>
          <div className="text-white/40 text-xs">Stock cost</div>
        </div>
      </div>

      {/* Charts row */}
      {(goldChartData.length > 0 || Object.keys(stockMap).length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {goldChartData.length > 0 && (
            <div className="card">
              <h3 className="font-display font-semibold text-white text-sm mb-4 flex items-center gap-2">
                <BarChart3 size={13} className="text-gold-400" /> Gold by Carat (grams)
              </h3>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={goldChartData} barSize={32}>
                  <XAxis dataKey="carat" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: '#141517', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                    itemStyle={{ color: '#ffd700' }}
                    formatter={v => [`${v.toFixed(2)}g`, 'Weight']}
                  />
                  <Bar dataKey="grams" radius={[4, 4, 0, 0]}>
                    {goldChartData.map((_, i) => (
                      <Cell key={i} fill={['#FFD700','#F5C400','#E8B800','#D4A000'][i % 4]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {Object.keys(stockMap).length > 0 && (
            <div className="card">
              <h3 className="font-display font-semibold text-white text-sm mb-4 flex items-center gap-2">
                <TrendingUp size={13} className="text-gold-400" /> Stock Holdings
              </h3>
              <div className="space-y-2">
                {Object.values(stockMap).map(s => (
                  <div key={s.symbol} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-mono text-white/80 font-medium">{s.symbol.split('.')[0]}</span>
                      <span className="text-white/30 text-xs ml-1">{s.symbol.split('.')[1]}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-white/60 text-xs">{s.shares.toLocaleString()} shares</div>
                      <div className="font-mono text-white/40 text-xs">{fmtAED(s.cost, 0)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-white flex items-center gap-2">
            Transactions
            <span className="text-white/30 text-sm font-normal">({transactions.length})</span>
          </h2>
          <div className="flex gap-1 bg-surface-300 p-0.5 rounded-xl">
            {['all','stock','gold'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium font-display capitalize transition-all
                  ${filter === f ? 'bg-gold-gradient text-black' : 'text-white/50 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-3xl mb-3">📋</div>
              <div className="text-white/40 text-sm">No transactions yet</div>
              <button onClick={() => setShowAdd(true)} className="btn-gold mt-4 text-sm flex items-center gap-1 mx-auto">
                <Plus size={13} /> Add your first
              </button>
            </div>
          ) : (
            filtered.map(t => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                {/* Type badge */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold
                  ${t.type === 'gold' ? 'bg-gold-400/15 text-gold-400' : 'bg-emerald-400/15 text-emerald-400'}`}>
                  {t.type === 'gold' ? '🪙' : '📈'}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono font-semibold text-white text-sm">
                      {t.type === 'gold' ? `${t.carat} Gold` : t.symbol?.split('.')[0]}
                    </span>
                    {t.type === 'gold'
                      ? <span className="text-white/40 text-xs">{t.weight_grams}g</span>
                      : <span className="text-white/40 text-xs">{t.quantity?.toLocaleString()} shares</span>
                    }
                  </div>
                  <div className="text-white/30 text-xs mt-0.5">
                    {new Date(t.purchased_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {t.notes && <span className="ml-2">· {t.notes}</span>}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <div className="font-mono text-white font-medium text-sm">
                    {t.type === 'gold'
                      ? fmtAED(t.total_aed ?? 0)
                      : fmtAED((t.quantity ?? 0) * (t.price_aed ?? 0))}
                  </div>
                  <div className="text-white/30 text-xs font-mono">
                    {t.type === 'gold'
                      ? `${fmtAED(t.total_aed / t.weight_grams)}/g`
                      : `${fmtAED(t.price_aed ?? 0, 3)}/share`}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deleting === t.id}
                  className="text-white/20 hover:text-red-400 transition-colors p-1 rounded-lg opacity-0 group-hover:opacity-100 shrink-0"
                >
                  {deleting === t.id
                    ? <div className="w-3.5 h-3.5 border border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                    : <Trash2 size={13} />}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {showAdd && (
        <AddTransactionModal
          onClose={() => setShowAdd(false)}
          onAdded={load}
        />
      )}
    </div>
  )
}

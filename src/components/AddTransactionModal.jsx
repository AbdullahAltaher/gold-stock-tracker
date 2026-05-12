import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { DEFAULT_STOCKS } from '../lib/stockApi'

const CARATS = ['24K', '22K', '21K', '18K']

export default function AddTransactionModal({ onClose, onAdded }) {
  const { user } = useAuth()
  const [type, setType] = useState('stock')
  const [form, setForm] = useState({
    symbol: DEFAULT_STOCKS[0].symbol,
    market: 'DFM',
    quantity: '',
    price_aed: '',
    carat: '21K',
    weight_grams: '',
    total_aed: '',
    notes: '',
    purchased_at: new Date().toISOString().split('T')[0],
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const row = {
      user_id: user.id,
      type,
      purchased_at: form.purchased_at,
      notes: form.notes || null,
    }

    if (type === 'stock') {
      if (!form.symbol || !form.quantity || !form.price_aed) {
        setError('Symbol, quantity, and price are required.')
        setSaving(false)
        return
      }
      row.symbol    = form.symbol
      row.market    = form.market
      row.quantity  = parseFloat(form.quantity)
      row.price_aed = parseFloat(form.price_aed)
    } else {
      if (!form.carat || !form.weight_grams || !form.total_aed) {
        setError('Carat, weight, and total price are required.')
        setSaving(false)
        return
      }
      row.carat        = form.carat
      row.weight_grams = parseFloat(form.weight_grams)
      row.total_aed    = parseFloat(form.total_aed)
    }

    const { error: err } = await supabase.from('transactions').insert(row)
    if (err) { setError(err.message); setSaving(false); return }

    setSaving(false)
    onAdded?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="card w-full max-w-md animate-fadeInUp">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-white text-lg">Add Transaction</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 mb-5 bg-surface-300 p-1 rounded-xl">
          {['stock', 'gold'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium font-display transition-all capitalize
                ${type === t ? 'bg-gold-gradient text-black' : 'text-white/50 hover:text-white'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'stock' ? (
            <>
              <div>
                <label className="label">Symbol</label>
                <select
                  className="input-dark"
                  value={form.symbol}
                  onChange={e => {
                    const stock = DEFAULT_STOCKS.find(s => s.symbol === e.target.value)
                    set('symbol', e.target.value)
                    set('market', stock?.market ?? 'DFM')
                  }}
                >
                  {DEFAULT_STOCKS.map(s => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol.split('.')[0]} — {s.name} ({s.market})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Quantity (shares)</label>
                  <input
                    type="number" min="0" step="1"
                    placeholder="100"
                    className="input-dark"
                    value={form.quantity}
                    onChange={e => set('quantity', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Price per share (AED)</label>
                  <input
                    type="number" min="0" step="0.001"
                    placeholder="3.750"
                    className="input-dark"
                    value={form.price_aed}
                    onChange={e => set('price_aed', e.target.value)}
                  />
                </div>
              </div>
              {form.quantity && form.price_aed && (
                <div className="text-white/40 text-xs text-right">
                  Total: AED {(parseFloat(form.quantity) * parseFloat(form.price_aed)).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="label">Carat</label>
                <select
                  className="input-dark"
                  value={form.carat}
                  onChange={e => set('carat', e.target.value)}
                >
                  {CARATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Weight (grams)</label>
                  <input
                    type="number" min="0" step="0.01"
                    placeholder="10.00"
                    className="input-dark"
                    value={form.weight_grams}
                    onChange={e => set('weight_grams', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Total paid (AED)</label>
                  <input
                    type="number" min="0" step="0.01"
                    placeholder="5430.00"
                    className="input-dark"
                    value={form.total_aed}
                    onChange={e => set('total_aed', e.target.value)}
                  />
                </div>
              </div>
              {form.weight_grams && form.total_aed && (
                <div className="text-white/40 text-xs text-right">
                  AED {(parseFloat(form.total_aed) / parseFloat(form.weight_grams)).toFixed(2)} per gram
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input-dark"
                value={form.purchased_at}
                onChange={e => set('purchased_at', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <input
                type="text"
                placeholder="e.g. Sharjah Gold Souk"
                className="input-dark"
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-gold flex-1 flex items-center justify-center gap-2"
            >
              {saving
                ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <Plus size={14} />
              }
              {saving ? 'Saving…' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
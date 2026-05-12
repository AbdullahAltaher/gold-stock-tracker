import { useState } from 'react'
import { useGoldPrice } from '../hooks/useGoldPrice'
import GoldPriceCard from '../components/GoldPriceCard'
import { fmtAED, calibrateMultiplier, CARAT_MULTIPLIERS } from '../lib/goldApi'
import { Settings, RefreshCw, Info, Calculator, Check } from 'lucide-react'

const CARATS = ['24K', '22K', '21K', '18K']

export default function Gold() {
  const { xauUsd, multiplier, prices, loading, source, lastUpdate, refresh, saveMultiplier } = useGoldPrice()

  const [showCalib, setShowCalib] = useState(false)
  const [manualMult, setManualMult] = useState('')
  const [calibForm, setCalibForm] = useState({ totalAed: '', weightG: '', carat: '21K' })
  const [calibResult, setCalibResult] = useState(null)
  const [saved, setSaved] = useState(false)

  function handleManualSave() {
    const v = parseFloat(manualMult)
    if (isNaN(v) || v <= 0) return
    saveMultiplier(v)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleCalibrate() {
    const total  = parseFloat(calibForm.totalAed)
    const weight = parseFloat(calibForm.weightG)
    if (!total || !weight || !xauUsd) return
    const m = calibrateMultiplier(total, weight, calibForm.carat, xauUsd)
    setCalibResult(m)
  }

  function applyCalibrated() {
    if (!calibResult) return
    saveMultiplier(calibResult)
    setManualMult(calibResult.toFixed(4))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Gram → AED table for popular weights
  const gramWeights = [1, 5, 10, 20, 50, 100]

  return (
    <div className="max-w-4xl mx-auto space-y-6 page-enter">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Gold Prices</h1>
          <p className="text-white/40 text-sm mt-1">Live · Sharjah market calibrated</p>
        </div>
        <button onClick={refresh} className="btn-outline flex items-center gap-2 text-xs">
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* XAU/USD info bar */}
      <div className="card flex flex-wrap items-center gap-4 justify-between py-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-white/40 text-[10px] uppercase tracking-wider">XAU/USD</div>
            <div className="font-mono font-bold text-gold-400 text-lg">
              {xauUsd ? `$${xauUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
            </div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <div className="text-white/40 text-[10px] uppercase tracking-wider">AED/USD</div>
            <div className="font-mono text-white/70">3.6725</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <div className="text-white/40 text-[10px] uppercase tracking-wider">Multiplier</div>
            <div className="font-mono text-white/70">{multiplier?.toFixed(4)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/30 text-xs">
          {source === 'fallback' && <span className="text-yellow-500">⚠ estimated price</span>}
          {lastUpdate && `Updated ${lastUpdate.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' })}`}
        </div>
      </div>

      {/* Carat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CARATS.map(c => (
          <GoldPriceCard key={c} carat={c} pricePerGram={prices?.[c]} loading={loading} />
        ))}
      </div>

      {/* Price table */}
      <div>
        <h2 className="font-display font-semibold text-white mb-3">Price by Weight</h2>
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-white/30 text-[10px] uppercase tracking-wider font-medium">Grams</th>
                {CARATS.map(c => (
                  <th key={c} className="px-4 py-3 text-right text-white/30 text-[10px] uppercase tracking-wider font-medium">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gramWeights.map(g => (
                <tr key={g} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-white/70 font-medium">{g}g</td>
                  {CARATS.map(c => (
                    <td key={c} className="px-4 py-3 text-right font-mono text-white/60">
                      {prices ? fmtAED(prices[c] * g) : <span className="skeleton inline-block h-3 w-20 rounded" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calibration section */}
      <div className="card">
        <button
          className="flex items-center justify-between w-full"
          onClick={() => setShowCalib(v => !v)}
        >
          <div className="flex items-center gap-2">
            <Settings size={15} className="text-gold-400" />
            <span className="font-display font-semibold text-white">Market Calibration</span>
          </div>
          <span className="text-white/30 text-xs">{showCalib ? 'Hide' : 'Adjust'}</span>
        </button>

        {showCalib && (
          <div className="mt-5 space-y-6">
            <div className="flex items-start gap-2 text-white/40 text-xs bg-surface-300 rounded-xl p-3">
              <Info size={12} className="mt-0.5 shrink-0 text-gold-400" />
              <span>
                The multiplier adjusts for local market premiums. Default <strong className="text-white">1.013</strong> is calibrated 
                to Sharjah Central Market. Use a recent purchase to recalibrate precisely.
              </span>
            </div>

            {/* Manual multiplier */}
            <div>
              <label className="label">Set multiplier manually</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.0001"
                  min="0.9"
                  max="1.2"
                  placeholder={multiplier?.toFixed(4)}
                  className="input-dark"
                  value={manualMult}
                  onChange={e => setManualMult(e.target.value)}
                />
                <button onClick={handleManualSave} className={`btn-gold shrink-0 flex items-center gap-1 ${saved ? '!bg-emerald-500' : ''}`}>
                  {saved ? <><Check size={12}/> Saved</> : 'Save'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-white/20">
              <div className="flex-1 h-px bg-white/10" />
              <Calculator size={12} />
              <span className="text-xs">Or calibrate from a purchase</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Calibration from purchase */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Total paid (AED)</label>
                  <input
                    type="number"
                    placeholder="10860"
                    className="input-dark"
                    value={calibForm.totalAed}
                    onChange={e => setCalibForm(f => ({ ...f, totalAed: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Weight (grams)</label>
                  <input
                    type="number"
                    placeholder="20"
                    className="input-dark"
                    value={calibForm.weightG}
                    onChange={e => setCalibForm(f => ({ ...f, weightG: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Carat</label>
                  <select
                    className="input-dark"
                    value={calibForm.carat}
                    onChange={e => setCalibForm(f => ({ ...f, carat: e.target.value }))}
                  >
                    {CARATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleCalibrate} className="btn-outline w-full flex items-center justify-center gap-2 text-sm">
                <Calculator size={13} />
                Calculate multiplier
              </button>
              {calibResult && (
                <div className="flex items-center justify-between bg-surface-300 rounded-xl px-4 py-3">
                  <div>
                    <div className="text-white/40 text-xs">Calculated multiplier</div>
                    <div className="font-mono font-bold text-gold-400 text-lg">{calibResult.toFixed(6)}</div>
                  </div>
                  <button onClick={applyCalibrated} className="btn-gold text-sm flex items-center gap-1">
                    <Check size={12} /> Apply
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

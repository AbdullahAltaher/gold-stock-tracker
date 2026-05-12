import { fmtAED } from '../lib/goldApi'

const CARAT_CONFIG = {
  '24K': { label: '24 Karat', purity: '99.9%', accent: '#FFD700' },
  '22K': { label: '22 Karat', purity: '91.7%', accent: '#F5C400' },
  '21K': { label: '21 Karat', purity: '87.5%', accent: '#E8B800' },
  '18K': { label: '18 Karat', purity: '75.0%', accent: '#D4A000' },
}

export default function GoldPriceCard({ carat, pricePerGram, loading }) {
  const cfg = CARAT_CONFIG[carat] ?? CARAT_CONFIG['24K']

  return (
    <div className="card-hover relative overflow-hidden group">
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
        style={{ background: cfg.accent }}
      />
      <div className="pl-3">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-display font-bold text-white text-base">{cfg.label}</div>
            <div className="text-white/30 text-xs">{cfg.purity} pure gold</div>
          </div>
          <div
            className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
            style={{ background: cfg.accent + '20', color: cfg.accent }}
          >
            {carat}
          </div>
        </div>

        {loading ? (
          <div className="skeleton h-7 w-32 rounded" />
        ) : (
          <div className="font-mono font-semibold text-xl" style={{ color: cfg.accent }}>
            {pricePerGram ? fmtAED(pricePerGram) : '—'}
          </div>
        )}
        <div className="text-white/30 text-xs mt-1">per gram</div>
      </div>
    </div>
  )
}
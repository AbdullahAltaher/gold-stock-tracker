export const DEFAULT_STOCKS = [
  { symbol: 'SALIK.DFM',  name: 'Salik',               market: 'DFM' },
  { symbol: 'PARKN.DFM',  name: 'Parkin',              market: 'DFM' },
  { symbol: 'EMAAR.DFM',  name: 'Emaar Properties',    market: 'DFM' },
  { symbol: 'DIB.DFM',    name: 'Dubai Islamic Bank',  market: 'DFM' },
  { symbol: 'DEWA.DFM',   name: 'DEWA',                market: 'DFM' },
  { symbol: 'FAB.ADX',    name: 'First Abu Dhabi Bank', market: 'ADX' },
  { symbol: 'ETISALAT.ADX', name: 'e&',                market: 'ADX' },
  { symbol: 'ADNOC.ADX',  name: 'ADNOC Distribution',  market: 'ADX' },
]

const FMP_KEY = import.meta.env.VITE_FMP_KEY

export async function fetchStockQuotes(symbols) {
  if (!symbols || symbols.length === 0) return []

  if (!FMP_KEY) {
    console.warn('No FMP API key — using demo data')
    return symbols.map(s => mockQuote(s))
  }

  try {
    const joined = symbols.join(',')
    const url = `https://financialmodelingprep.com/api/v3/quote/${encodeURIComponent(joined)}?apikey=${FMP_KEY}`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    if (!Array.isArray(data) || data.length === 0) {
      return symbols.map(s => mockQuote(s))
    }

    return data.map(q => ({
      symbol: q.symbol,
      shortName: q.name ?? q.symbol.split('.')[0],
      regularMarketPrice: q.price ?? 0,
      regularMarketChange: q.change ?? 0,
      regularMarketChangePercent: q.changesPercentage ?? 0,
      regularMarketVolume: q.volume ?? 0,
      currency: 'AED',
    }))
  } catch (e) {
    console.error('FMP API error:', e)
    return symbols.map(s => mockQuote(s))
  }
}

function mockQuote(symbol) {
  const change = (Math.random() - 0.48) * 0.4
  const price  = 3 + Math.random() * 15
  return {
    symbol,
    shortName: symbol.split('.')[0],
    regularMarketPrice: +price.toFixed(3),
    regularMarketChange: +(price * change).toFixed(3),
    regularMarketChangePercent: +(change * 100).toFixed(2),
    regularMarketVolume: Math.floor(Math.random() * 5000000),
    currency: 'AED',
    _mock: true,
  }
}

export function formatChange(pct) {
  if (pct > 0) return { label: `+${pct.toFixed(2)}%`, cls: 'stat-up'   }
  if (pct < 0) return { label: `${pct.toFixed(2)}%`,  cls: 'stat-down' }
  return        { label: '0.00%',                      cls: 'stat-flat' }
}
export const DEFAULT_STOCKS = [
  { symbol: 'SALIK.DFM',    name: 'Salik',               market: 'DFM' },
  { symbol: 'PARKN.DFM',    name: 'Parkin',              market: 'DFM' },
  { symbol: 'EMAAR.DFM',    name: 'Emaar Properties',    market: 'DFM' },
  { symbol: 'DIB.DFM',      name: 'Dubai Islamic Bank',  market: 'DFM' },
  { symbol: 'EMIRATES.DFM', name: 'Emirates NBD',        market: 'DFM' },
  { symbol: 'DU.DFM',       name: 'Emirates Integrated', market: 'DFM' },
  { symbol: 'DEWA.DFM',     name: 'DEWA',                market: 'DFM' },
  { symbol: 'FAB.ADX',      name: 'First Abu Dhabi Bank', market: 'ADX' },
  { symbol: 'ETISALAT.ADX', name: 'e&',                  market: 'ADX' },
  { symbol: 'ADNOC.ADX',    name: 'ADNOC Distribution',  market: 'ADX' },
]

export async function fetchStockQuotes(symbols) {
  if (!symbols || symbols.length === 0) return []

  const joined = symbols.join(',')
  const url = `/api/yahoo/v7/finance/quote?symbols=${encodeURIComponent(joined)}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketChange,regularMarketVolume,shortName,currency`

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    return json?.quoteResponse?.result ?? []
  } catch (e) {
    console.error('Stock API error:', e)
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
    regularMarketVolume: Math.floor(Math.random() * 5_000_000),
    currency: 'AED',
    _mock: true,
  }
}

export function formatChange(pct) {
  if (pct > 0) return { label: `+${pct.toFixed(2)}%`, cls: 'stat-up'   }
  if (pct < 0) return { label: `${pct.toFixed(2)}%`,  cls: 'stat-down' }
  return        { label: '0.00%',                      cls: 'stat-flat' }
}
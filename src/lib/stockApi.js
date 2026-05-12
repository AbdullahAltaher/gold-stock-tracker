export const DEFAULT_STOCKS = [
  { symbol: 'SALIK',    name: 'Salik',               market: 'DFM', exchange: 'XDFM' },
  { symbol: 'PARKN',    name: 'Parkin',              market: 'DFM', exchange: 'XDFM' },
  { symbol: 'EMAAR',    name: 'Emaar Properties',    market: 'DFM', exchange: 'XDFM' },
  { symbol: 'DIB',      name: 'Dubai Islamic Bank',  market: 'DFM', exchange: 'XDFM' },
  { symbol: 'DEWA',     name: 'DEWA',                market: 'DFM', exchange: 'XDFM' },
  { symbol: 'DU',       name: 'Emirates Integrated', market: 'DFM', exchange: 'XDFM' },
  { symbol: 'FAB',      name: 'First Abu Dhabi Bank', market: 'ADX', exchange: 'XADS' },
  { symbol: 'ETISALAT', name: 'e&',                  market: 'ADX', exchange: 'XADS' },
  { symbol: 'ADNOCDIST',name: 'ADNOC Distribution',  market: 'ADX', exchange: 'XADS' },
]

const TWELVE_KEY = import.meta.env.VITE_TWELVE_KEY

export async function fetchStockQuotes(stocks) {
  if (!TWELVE_KEY) {
    console.warn('No Twelve Data key — using demo data')
    return stocks.map(s => mockQuote(s))
  }

  try {
    // Twelve Data batch quote — up to 8 symbols free
    const symbols = stocks.map(s => `${s.symbol}:${s.exchange}`).join(',')
    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols)}&apikey=${TWELVE_KEY}`

    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    // Response is either a single object or a map of symbol → data
    const results = []
    for (const stock of stocks) {
      const key = `${stock.symbol}:${stock.exchange}`
      const q = data[key] ?? data[stock.symbol] ?? data

      if (q?.code) {
        // API error for this symbol
        results.push(mockQuote(stock))
        continue
      }

      const price  = parseFloat(q?.close ?? q?.price ?? 0)
      const change = parseFloat(q?.change ?? 0)
      const pct    = parseFloat(q?.percent_change ?? 0)

      results.push({
        symbol:   `${stock.symbol}.${stock.market}`,
        shortName: stock.name,
        regularMarketPrice: price,
        regularMarketChange: change,
        regularMarketChangePercent: pct,
        regularMarketVolume: parseInt(q?.volume ?? 0),
        currency: 'AED',
        _mock: false,
      })
    }
    return results
  } catch (e) {
    console.error('Twelve Data error:', e)
    return stocks.map(s => mockQuote(s))
  }
}

function mockQuote(stock) {
  const change = (Math.random() - 0.48) * 0.4
  const price  = 3 + Math.random() * 15
  return {
    symbol: `${stock.symbol}.${stock.market}`,
    shortName: stock.name,
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
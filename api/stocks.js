export const config = { runtime: 'edge' }

const STOCKS = [
  { symbol: 'SALIK',     name: 'Salik',               market: 'DFM' },
  { symbol: 'PARKN',     name: 'Parkin',              market: 'DFM' },
  { symbol: 'EMAAR',     name: 'Emaar Properties',    market: 'DFM' },
  { symbol: 'DIB',       name: 'Dubai Islamic Bank',  market: 'DFM' },
  { symbol: 'DEWA',      name: 'DEWA',                market: 'DFM' },
  { symbol: 'DU',        name: 'Emirates Integrated', market: 'DFM' },
  { symbol: 'FAB',       name: 'First Abu Dhabi Bank', market: 'ADX' },
  { symbol: 'ETISALAT',  name: 'e&',                  market: 'ADX' },
  { symbol: 'ADNOCDIST', name: 'ADNOC Distribution',  market: 'ADX' },
]

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://marketwatch.dfm.ae',
  'Referer': 'https://marketwatch.dfm.ae/',
}

export default async function handler() {
  try {
    // DFM official market watch API
    const res = await fetch(
      'https://marketwatch.dfm.ae/api/data/equity/equities?lang=en&market=DFM',
      { headers: HEADERS, signal: AbortSignal.timeout(8000) }
    )

    if (!res.ok) throw new Error(`DFM API ${res.status}`)
    const json = await res.json()
    const rows = json?.equities ?? json?.data ?? json ?? []

    if (!Array.isArray(rows) || rows.length === 0) throw new Error('Empty response')

    const priceMap = {}
    for (const row of rows) {
      const sym = (row.symbol ?? row.Symbol ?? row.ticker ?? '').toUpperCase()
      const price  = parseFloat(row.last ?? row.close ?? row.lastTradedPrice ?? 0)
      const change = parseFloat(row.change ?? row.priceChange ?? 0)
      const pct    = parseFloat(row.changePercent ?? row.percentChange ?? row.changePercentage ?? 0)
      if (sym && price > 0) priceMap[sym] = { price, change, pct }
    }

    const quotes = STOCKS.map(stock => {
      const q = priceMap[stock.symbol.toUpperCase()]
      if (!q) return mockQuote(stock)
      return {
        symbol: stock.symbol,
        shortName: stock.name,
        market: stock.market,
        regularMarketPrice: +q.price.toFixed(3),
        regularMarketChange: +q.change.toFixed(3),
        regularMarketChangePercent: +q.pct.toFixed(2),
        regularMarketVolume: 0,
        currency: 'AED',
        _mock: false,
      }
    })

    return new Response(JSON.stringify(quotes), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 's-maxage=30' }
    })
  } catch (e) {
    console.error('DFM API error:', e.message)
    return new Response(JSON.stringify(STOCKS.map(s => mockQuote(s))), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

function mockQuote(stock) {
  const change = (Math.random() - 0.48) * 0.4
  const price  = 3 + Math.random() * 15
  return {
    symbol: stock.symbol,
    shortName: stock.name,
    market: stock.market,
    regularMarketPrice: +price.toFixed(3),
    regularMarketChange: +(price * change).toFixed(3),
    regularMarketChangePercent: +(change * 100).toFixed(2),
    regularMarketVolume: 0,
    currency: 'AED',
    _mock: true,
  }
}
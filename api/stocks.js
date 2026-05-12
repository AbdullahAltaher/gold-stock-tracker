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

export default async function handler() {
  try {
    const symbols = STOCKS.map(s => `${s.symbol}.${s.market === 'DFM' ? 'DFM' : 'AE'}`).join(',')
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    })

    if (!res.ok) throw new Error(`Yahoo ${res.status}`)
    const json = await res.json()
    const results = json?.quoteResponse?.result ?? []

    if (results.length === 0) throw new Error('No results')

    const quotes = STOCKS.map(stock => {
      const q = results.find(r =>
        r.symbol?.toLowerCase().includes(stock.symbol.toLowerCase())
      )
      if (!q) return mockQuote(stock)
      return {
        symbol: stock.symbol,
        shortName: stock.name,
        market: stock.market,
        regularMarketPrice: q.regularMarketPrice ?? 0,
        regularMarketChange: q.regularMarketChange ?? 0,
        regularMarketChangePercent: q.regularMarketChangePercent ?? 0,
        regularMarketVolume: q.regularMarketVolume ?? 0,
        currency: 'AED',
        _mock: false,
      }
    })

    return new Response(JSON.stringify(quotes), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 's-maxage=30' }
    })
  } catch (e) {
    const fallback = STOCKS.map(s => mockQuote(s))
    return new Response(JSON.stringify(fallback), {
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
    regularMarketVolume: Math.floor(Math.random() * 5000000),
    currency: 'AED',
    _mock: true,
  }
}
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
    const results = await Promise.allSettled([
      fetchDFM(),
      fetchADX(),
    ])

    const dfmData = results[0].status === 'fulfilled' ? results[0].value : {}
    const adxData = results[1].status === 'fulfilled' ? results[1].value : {}
    const combined = { ...dfmData, ...adxData }

    const quotes = STOCKS.map(stock => {
      const q = combined[stock.symbol.toUpperCase()]
      if (!q) return mockQuote(stock)
      return {
        symbol: stock.symbol,
        shortName: stock.name,
        market: stock.market,
        regularMarketPrice: q.price,
        regularMarketChange: q.change,
        regularMarketChangePercent: q.pct,
        regularMarketVolume: q.volume ?? 0,
        currency: 'AED',
        _mock: false,
      }
    })

    return new Response(JSON.stringify(quotes), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=60',
      }
    })
  } catch {
    return new Response(JSON.stringify(STOCKS.map(s => mockQuote(s))), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function fetchDFM() {
  const res = await fetch(
    'https://www.dfm.ae/en/market/equities/trading-data',
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000)
    }
  )
  const html = await res.text()
  return parsePricesFromHTML(html)
}

async function fetchADX() {
  const res = await fetch(
    'https://www.adx.ae/en/markets/equities/listed-securities',
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000)
    }
  )
  const html = await res.text()
  return parsePricesFromHTML(html)
}

function parsePricesFromHTML(html) {
  const result = {}
  // Match patterns like: SALIK ... 1.83 ... +0.05 ... +2.81%
  const rowPattern = /([A-Z]{2,10})\s[\s\S]{0,200}?([\d]+\.[\d]{2,4})\s[\s\S]{0,100}?([+-][\d]+\.[\d]{2,4})\s[\s\S]{0,50}?([+-][\d]+\.[\d]{2,4})%/g
  let match
  while ((match = rowPattern.exec(html)) !== null) {
    const sym    = match[1].toUpperCase()
    const price  = parseFloat(match[2])
    const change = parseFloat(match[3])
    const pct    = parseFloat(match[4])
    if (price > 0 && price < 1000) {
      result[sym] = { price, change, pct }
    }
  }
  return result
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
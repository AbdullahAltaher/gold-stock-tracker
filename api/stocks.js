export const config = { runtime: 'edge' }

const STOCKS = [
  { symbol: 'SALIK',     stooq: 'salik.ae',     name: 'Salik',               market: 'DFM' },
  { symbol: 'PARKN',     stooq: 'parkn.ae',     name: 'Parkin',              market: 'DFM' },
  { symbol: 'EMAAR',     stooq: 'emaar.ae',     name: 'Emaar Properties',    market: 'DFM' },
  { symbol: 'DIB',       stooq: 'dib.ae',       name: 'Dubai Islamic Bank',  market: 'DFM' },
  { symbol: 'DEWA',      stooq: 'dewa.ae',      name: 'DEWA',                market: 'DFM' },
  { symbol: 'DU',        stooq: 'du.ae',        name: 'Emirates Integrated', market: 'DFM' },
  { symbol: 'FAB',       stooq: 'fab.ae',       name: 'First Abu Dhabi Bank', market: 'ADX' },
  { symbol: 'ETISALAT',  stooq: 'etisalat.ae',  name: 'e&',                  market: 'ADX' },
  { symbol: 'ADNOCDIST', stooq: 'adnocdist.ae', name: 'ADNOC Distribution',  market: 'ADX' },
]

export default async function handler() {
  try {
    const results = await Promise.allSettled(
      STOCKS.map(async (stock) => {
        const url = `https://stooq.com/q/l/?s=${stock.stooq}&f=sd2t2ohlcvn&h&e=csv`
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
        const text = await res.text()
        const lines = text.trim().split('\n')
        if (lines.length < 2) throw new Error('No data')
        const cols = lines[1].split(',')
        const close = parseFloat(cols[4])
        const open  = parseFloat(cols[2])
        if (!close || isNaN(close)) throw new Error('Bad price')
        const change = close - open
        const pct    = open > 0 ? (change / open) * 100 : 0
        return {
          symbol: stock.symbol,
          shortName: stock.name,
          market: stock.market,
          regularMarketPrice: +close.toFixed(3),
          regularMarketChange: +change.toFixed(3),
          regularMarketChangePercent: +pct.toFixed(2),
          regularMarketVolume: parseInt(cols[5]) || 0,
          currency: 'AED',
          _mock: false,
        }
      })
    )

    const quotes = results.map((r, i) =>
      r.status === 'fulfilled' ? r.value : mockQuote(STOCKS[i])
    )

    return new Response(JSON.stringify(quotes), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=30',
        'Access-Control-Allow-Origin': '*',
      }
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
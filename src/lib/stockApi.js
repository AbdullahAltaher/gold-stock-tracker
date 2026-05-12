export async function fetchStockQuotes(symbols) {
  if (!symbols || symbols.length === 0) return []

  const joined = symbols.join(',')
  
  // Try multiple approaches
  const urls = [
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(joined)}`,
    `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(joined)}`,
    `/api/yahoo/v7/finance/quote?symbols=${encodeURIComponent(joined)}`,
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json',
        }
      })
      if (!res.ok) continue
      const json = await res.json()
      const results = json?.quoteResponse?.result
      if (results && results.length > 0) return results
    } catch {
      continue
    }
  }

  // Fallback to mock
  console.warn('Yahoo Finance unavailable — using demo data')
  return symbols.map(s => mockQuote(s))
}
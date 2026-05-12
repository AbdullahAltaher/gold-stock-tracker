import { useState, useEffect, useCallback } from 'react'
import { fetchStockQuotes, DEFAULT_STOCKS } from '../lib/stockApi'

const REFRESH_MS = 30_000

export function useStocks(extraSymbols = []) {
  const symbols = [
    ...DEFAULT_STOCKS.map(s => s.symbol),
    ...extraSymbols,
  ]
  const [quotes,  setQuotes]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const refresh = useCallback(async () => {
    try {
      const data = await fetchStockQuotes([...new Set(symbols)])
      setQuotes(data)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [symbols.join(',')])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, REFRESH_MS)
    return () => clearInterval(id)
  }, [refresh])

  return { quotes, loading, error, refresh }
}
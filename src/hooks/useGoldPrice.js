import { useState, useEffect, useCallback } from 'react'
import { fetchXAUUSD, calcGoldPrice, CARAT_MULTIPLIERS } from '../lib/goldApi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const REFRESH_MS = 60_000

export function useGoldPrice() {
  const { user } = useAuth()
  const [xauUsd,     setXauUsd]     = useState(null)
  const [multiplier, setMultiplier] = useState(1.013)
  const [prices,     setPrices]     = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [source,     setSource]     = useState('live')
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('gold_settings')
      .select('multiplier')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.multiplier) setMultiplier(data.multiplier)
      })
  }, [user])

  const refresh = useCallback(async () => {
    const { price, source: src } = await fetchXAUUSD()
    setXauUsd(price)
    setSource(src)
    setLastUpdate(new Date())
    const computed = {}
    for (const carat of Object.keys(CARAT_MULTIPLIERS)) {
      computed[carat] = calcGoldPrice(price, multiplier, carat)
    }
    setPrices(computed)
    setLoading(false)
  }, [multiplier])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, REFRESH_MS)
    return () => clearInterval(id)
  }, [refresh])

  async function saveMultiplier(newMult) {
    setMultiplier(newMult)
    if (!user) return
    await supabase
      .from('gold_settings')
      .upsert({ user_id: user.id, multiplier: newMult, updated_at: new Date().toISOString() })
  }

  return { xauUsd, multiplier, prices, loading, source, lastUpdate, refresh, saveMultiplier }
}
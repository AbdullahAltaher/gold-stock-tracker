const AED_PER_USD   = 3.6725
const TROY_OZ_GRAMS = 31.1035

export const CARAT_MULTIPLIERS = {
  '24K': 1.0,
  '22K': 22/24,
  '21K': 21/24,
  '18K': 18/24,
}

export async function fetchXAUUSD() {
  try {
    const res = await fetch('/api/metals/v1/spot/gold', {
      signal: AbortSignal.timeout(6000)
    })
    if (res.ok) {
      const data = await res.json()
      const price = Array.isArray(data) ? data[0]?.gold : data?.gold
      if (price && price > 0) return { price, source: 'live' }
    }
  } catch {}

  try {
    const res = await fetch('https://api.metals.live/v1/spot/gold', {
      signal: AbortSignal.timeout(6000)
    })
    if (res.ok) {
      const data = await res.json()
      const price = Array.isArray(data) ? data[0]?.gold : data?.gold
      if (price && price > 0) return { price, source: 'live' }
    }
  } catch {}

  return { price: 3320, source: 'fallback' }
}

export function calcGoldPrice(xauUsd, multiplier = 1.013, carat = '24K') {
  const base = (xauUsd * AED_PER_USD / TROY_OZ_GRAMS) * multiplier
  return base * (CARAT_MULTIPLIERS[carat] ?? 1)
}

export function calibrateMultiplier(totalAed, weightG, carat, xauUsd) {
  const purity = CARAT_MULTIPLIERS[carat] ?? 1
  const theoreticalPerGram = (xauUsd * AED_PER_USD / TROY_OZ_GRAMS) * purity
  const actualPerGram = totalAed / weightG
  return actualPerGram / theoreticalPerGram
}

export function fmtAED(n, decimals = 2) {
  return 'AED ' + Number(n).toLocaleString('en-AE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
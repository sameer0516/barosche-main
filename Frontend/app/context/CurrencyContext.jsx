'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

export const CURRENCY_MAP = {
  US: { code: 'USD', symbol: '$',   rate: 1.08 },
  GB: { code: 'GBP', symbol: '£',   rate: 0.85 },
  IN: { code: 'INR', symbol: '₹',   rate: 90.5 },
  AE: { code: 'AED', symbol: 'AED', rate: 3.97 },
  AU: { code: 'AUD', symbol: 'A$',  rate: 1.65 },
  CA: { code: 'CAD', symbol: 'C$',  rate: 1.47 },
  SG: { code: 'SGD', symbol: 'S$',  rate: 1.45 },
  JP: { code: 'JPY', symbol: '¥',   rate: 162  },
  CH: { code: 'CHF', symbol: 'CHF', rate: 0.97 },
  default: { code: 'EUR', symbol: '€', rate: 1 },
};

// Always call this with the RAW EUR price. Converts + formats.
export function formatPrice(eurPrice, currency) {
  if (eurPrice === null || eurPrice === undefined || isNaN(eurPrice)) return null;
  const cur = currency || CURRENCY_MAP.default;
  const converted = Math.round(Number(eurPrice) * cur.rate);
  if (cur.code === 'JPY') return `${cur.symbol}${converted.toLocaleString()}`;
  if (cur.code === 'INR') return `${cur.symbol}${converted.toLocaleString('en-IN')}`;
  return `${cur.symbol}${converted.toLocaleString()}`;
}

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(CURRENCY_MAP.default);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    let cancelled = false;
    async function detect() {
      try {
        setStatus('loading');
        const res = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
        const data = await res.json();
        if (!cancelled && data.success && data.countryCode && CURRENCY_MAP[data.countryCode]) {
          setCurrency(CURRENCY_MAP[data.countryCode]);
        }
        if (!cancelled) setStatus('done');
      } catch (err) {
        console.error('Currency detection error:', err.message);
        if (!cancelled) setStatus('error');
      }
    }
    detect();
    return () => { cancelled = true; };
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, status, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
}

export default CurrencyContext;
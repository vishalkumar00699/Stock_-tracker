const FINNHUB_KEY = 'd5s8mm1r01qoo9r3asvgd5s8mm1r01qoo9r3at00'; // tera key yahan

export const getStockQuote = async (symbol: string) => {
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  
  const data = await res.json();
  
  if (data.c === 0 || data.c === null) {
    throw new Error('No quote data available');
  }

  return {
    symbol,
    price: data.c,
    change: data.d || 0,
    percent_change: data.dp || 0,
    // name: Finnhub quote mein nahi aata, baad mein profile call kar sakte hain
  };
};

export const getCandles = async (symbol: string, resolution: string = 'D', daysBack: number = 30) => {
  const to = Math.floor(Date.now() / 1000);
  const from = to - daysBack * 24 * 60 * 60; // daysBack din pehle se

  const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Candle fetch failed');

  const data = await res.json();

  if (data.s !== 'ok') throw new Error(data.s || 'No data');

  // Format for chart
  return data.t.map((timestamp: number, i: number) => ({
    date: new Date(timestamp * 1000).toISOString().split('T')[0],
    open: data.o[i],
    high: data.h[i],
    low: data.l[i],
    close: data.c[i],
    volume: data.v[i],
  }));
};StockDetail
const API_KEY = '2060ec0dc2df448b983d36205c0391df';

export const getStockQuote = async (symbol: string) => {
  const url = `https://api.twelvedata.com/quote?symbol=${symbol}&exchange=NSE&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status === 'error') {
    throw new Error(data.message);
  }

  return data;
};

import { View, Text, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { getStockQuote } from '../../services/stockApi';

const STOCKS = [
  'RELIANCE',
  'TCS',
  'INFY',
];

export default function HomeScreen() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    loadStocks();
  }, []);

const loadStocks = async () => {
  const results = [];

  for (let symbol of STOCKS) {
    try {
      const quote = await getStockQuote(symbol);

      results.push({
        symbol,
        price: quote.price,
        change: quote.change,
      });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error:', err.message);
      }
    }
  }

  setData(results);
};

}

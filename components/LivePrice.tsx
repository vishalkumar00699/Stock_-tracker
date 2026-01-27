// components/LivePrice.tsx  (reusable bana le)
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

const FINNHUB_KEY = 'd5s8mm1r01qoo9r3asvgd5s8mm1r01qoo9r3at00'; // ya .env se le

type Props = {
  symbol: string;
};

export default function LivePrice({ symbol }: Props) {
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number | null>(null);
  const [percentChange, setPercentChange] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_KEY}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      // Subscribe to the symbol
      ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'trade' && data.data?.length > 0) {
        const trade = data.data[0];
        setPrice(trade.p);          // latest price
        // Finnhub trade mein direct change nahi deta, toh previous se compare kar sakta hai ya quote se fallback
        // Simple: price update dikha
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      setConnected(false);
    };

    // Cleanup on unmount (bahut important!)
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
        ws.close();
      }
    };
  }, [symbol]);  // symbol change hone pe resubscribe

  return (
    <View>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        {price ? `$${price.toFixed(2)}` : 'Loading...'}
      </Text>
      {connected ? (
        <Text style={{ color: 'green', fontSize: 12 }}>Live</Text>
      ) : (
        <Text style={{ color: 'red', fontSize: 12 }}>Disconnected</Text>
      )}
    </View>
  );
}
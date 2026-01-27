const FINNHUB_KEY = "d5s8mm1r01qoo9r3asvgd5s8mm1r01qoo9r3at00";

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { VictoryChart, VictoryCandlestick, VictoryAxis } from 'victory-native';
import { Ionicons } from "@expo/vector-icons";
import LivePrice from "@/components/LivePrice";
import { getStockQuote, getCandles } from "@/services/stockApi";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

const { width } = Dimensions.get("window");

type Candle = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

type Pattern = {
  date: string;
  pattern: string;
  type: "bullish" | "bearish" | "neutral";
};

export default function StockDetail() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [quote, setQuote] = useState<any>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [companyName, setCompanyName] = useState<string>(symbol);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Quote (current price, change etc.)
        const q = await getStockQuote(symbol);
        setQuote(q);

        // 2. Company profile (name, etc.)
        try {
          const profileRes = await fetch(
            `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`,
          );
          const profile = await profileRes.json();
          if (profile.name) setCompanyName(profile.name);
        } catch (e) {
          console.log("Profile fetch failed, using fallback");
        }

        // 3. Candles (last 90 days daily)
        const candleData = await getCandles(symbol, "D", 90);
        setCandles(candleData);

        // 4. Detect patterns
        const detected = detectPatterns(candleData);
        setPatterns(detected);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [symbol]);

  // Simple candlestick pattern detection
  const detectPatterns = (data: Candle[]): Pattern[] => {
    const result: Pattern[] = [];

    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1];
      const curr = data[i];

      // Hammer (bullish reversal)
      if (
        curr.close > curr.open &&
        curr.open - curr.low > 2 * (curr.close - curr.open) &&
        curr.high - curr.close < (curr.close - curr.open) * 0.3
      ) {
        result.push({ date: curr.date, pattern: "Hammer", type: "bullish" });
      }

      // Shooting Star (bearish reversal)
      if (
        curr.close < curr.open &&
        curr.high - curr.open > 2 * (curr.open - curr.close) &&
        curr.close - curr.low < (curr.open - curr.close) * 0.3
      ) {
        result.push({
          date: curr.date,
          pattern: "Shooting Star",
          type: "bearish",
        });
      }

      // Bullish Engulfing
      if (
        prev.close < prev.open &&
        curr.close > curr.open &&
        curr.open <= prev.close &&
        curr.close >= prev.open
      ) {
        result.push({
          date: curr.date,
          pattern: "Bullish Engulfing",
          type: "bullish",
        });
      }

      // Bearish Engulfing
      if (
        prev.close > prev.open &&
        curr.close < curr.open &&
        curr.open >= prev.close &&
        curr.close <= prev.open
      ) {
        result.push({
          date: curr.date,
          pattern: "Bearish Engulfing",
          type: "bearish",
        });
      }

      // Doji (indecision)
      if (Math.abs(curr.close - curr.open) < (curr.high - curr.low) * 0.05) {
        result.push({ date: curr.date, pattern: "Doji", type: "neutral" });
      }
    }

    return result.slice(-10); // last 10 patterns only
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDark ? "#000" : "#F8F9FA" },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16, color: isDark ? "#AAA" : "#666" }}>
          Loading {symbol} data...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDark ? "#000" : "#F8F9FA" },
        ]}
      >
        <Text
          style={{ color: Colors.danger, fontSize: 18, textAlign: "center" }}
        >
          Error: {error}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000" : "#F8F9FA" },
      ]}
    >
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color={isDark ? "#FFF" : "#000"}
            />
          </TouchableOpacity>
          <View>
            <Text
              style={[styles.symbolTitle, { color: isDark ? "#FFF" : "#000" }]}
            >
              {symbol}
            </Text>
            <Text
              style={[styles.companyName, { color: isDark ? "#AAA" : "#666" }]}
            >
              {companyName}
            </Text>
          </View>
        </View>

        {/* Live Price */}
        <View style={styles.livePriceContainer}>
          <LivePrice symbol={symbol} />
        </View>

        {/* Candlestick Chart */}
        <View style={styles.chartContainer}>
          <Text
            style={[styles.sectionTitle, { color: isDark ? "#FFF" : "#000" }]}
          >
            Candlestick Chart (Last 90 Days)
          </Text>
          <VictoryChart
  height={280}
  width={width - 32}
  domainPadding={{ x: 10 }}
  padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
>
  <VictoryAxis
    tickFormat={(t) => new Date(t * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
    style={{ tickLabels: { fontSize: 10, fill: isDark ? '#AAA' : '#666' } }}
  />
  <VictoryAxis dependentAxis style={{ tickLabels: { fontSize: 10 } }} />
  
  <VictoryCandlestick
    candleRatio={0.7}
    data={candles.map(c => ({
      x: new Date(c.date).getTime() / 1000,
      open: c.open,
      close: c.close,
      high: c.high,
      low: c.low
    }))}
    candleColors={{
      positive: Colors.success,
      negative: Colors.danger
    }}
  />
</VictoryChart>

        {/* Detected Patterns */}
        <View style={styles.patternsSection}>
          <Text
            style={[styles.sectionTitle, { color: isDark ? "#FFF" : "#000" }]}
          >
            Detected Candlestick Patterns
          </Text>

          {patterns.length === 0 ? (
            <Text
              style={{ color: isDark ? "#AAA" : "#666", textAlign: "center" }}
            >
              No clear patterns detected in recent data
            </Text>
          ) : (
            patterns.map((p, idx) => (
              <View
                key={idx}
                style={[
                  styles.patternCard,
                  {
                    backgroundColor:
                      p.type === "bullish"
                        ? isDark
                          ? "#1A3C1A"
                          : "#E8F5E9"
                        : p.type === "bearish"
                          ? isDark
                            ? "#3C1A1A"
                            : "#FFEBEE"
                          : isDark
                            ? "#1A1A2E"
                            : "#F5F5F5",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.patternDate,
                    { color: isDark ? "#CCC" : "#555" },
                  ]}
                >
                  {p.date}
                </Text>
                <Text
                  style={[
                    styles.patternName,
                    {
                      color:
                        p.type === "bullish"
                          ? Colors.success
                          : p.type === "bearish"
                            ? Colors.danger
                            : "#888",
                    },
                  ]}
                >
                  {p.pattern}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 8,
  },
  backButton: { marginRight: 16 },
  symbolTitle: { fontSize: 28, fontWeight: "bold" },
  companyName: { fontSize: 16, marginTop: 4 },
  livePriceContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  chartContainer: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  chart: { borderRadius: 16 },
  patternsSection: { padding: 16 },
  patternCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patternDate: { fontSize: 13, marginBottom: 4 },
  patternName: { fontSize: 16, fontWeight: "600" },
});

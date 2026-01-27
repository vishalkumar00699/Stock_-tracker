import React, { useEffect, useState } from "react";
import LivePrice from '@/components/LivePrice';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { getStockQuote } from "@/services/stockApi";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

const { width } = Dimensions.get("window");

// Finnhub free real-time ke liye US stocks (NSE delayed hoga)
const STOCKS = ["AAPL", "TSLA", "MSFT", "GOOGL", "AMZN", "NVDA"];

type StockItem = {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  percent_change: number;
  error?: string;
};

export default function HomeScreen() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const results: StockItem[] = [];

    for (const symbol of STOCKS) {
      try {
        const quote = await getStockQuote(symbol);

        // Temporary name mapping (real mein /stock/profile2 se la sakte hain)
        let name = symbol;
        if (symbol === "AAPL") name = "Apple Inc.";
        if (symbol === "TSLA") name = "Tesla Inc.";
        if (symbol === "MSFT") name = "Microsoft Corp.";
        if (symbol === "GOOGL") name = "Alphabet Inc.";
        if (symbol === "AMZN") name = "Amazon.com Inc.";
        if (symbol === "NVDA") name = "NVIDIA Corp.";

        results.push({
          symbol,
          name,
          price: quote.price,
          change: quote.change,
          percent_change: quote.percent_change,
        });
      } catch (err: any) {
        console.log(`Error for ${symbol}:`, err.message);
        results.push({
          symbol,
          price: 0,
          change: 0,
          percent_change: 0,
          error: "Failed to load",
        });
      }
    }

    setStocks(results);
    setLoading(false);
    setRefreshing(false);
  };

  const renderStockCard = ({ item }: { item: StockItem }) => {
    if (item.error) {
      return (
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" },
          ]}
        >
          <Text style={[styles.symbol, { color: isDark ? "#FFF" : "#000" }]}>
            {item.symbol}
          </Text>
          <Text style={[styles.errorText, { color: "#FF3B30" }]}>
            {item.error}
          </Text>
        </View>
      );
    }

    const isPositive = item.change >= 0;
    const changeColor = isPositive
      ? ("#34C759" as any) // green
      : ("#FF3B30" as any); // red
    const currency = item.symbol.includes(".NS") ? "₹" : "$";

    return (
      <TouchableOpacity activeOpacity={0.8} style={styles.cardWrapper}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
              borderLeftWidth: 4,
              borderLeftColor: changeColor,
            },
          ]}
        >
          <View>
            <LivePrice symbol={item.symbol} />
            {/* Agar change bhi live chahiye toh uske liye extra state manage karna padega */}
          </View>

          <View style={styles.cardHeader}>
            <View>
              <Text
                style={[styles.symbol, { color: isDark ? "#FFF" : "#000" }]}
              >
                {item.symbol}
              </Text>
              <Text style={[styles.name, { color: isDark ? "#AAA" : "#666" }]}>
                {item.name}
              </Text>
            </View>

            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor: isPositive
                    ? `${"#34C759" as any}20`
                    : `${"#FF3B30" as any}20`,
                },
              ]}
            >
              <Text style={[styles.changeText, { color: changeColor }]}>
                {isPositive ? "▲" : "▼"}{" "}
                {Math.abs(item.percent_change).toFixed(2)}%
              </Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={[styles.label, { color: isDark ? "#AAA" : "#666" }]}>
                Current Price
              </Text>
              <Text style={[styles.price, { color: isDark ? "#FFF" : "#000" }]}>
                {currency}
                {item.price.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.label, { color: isDark ? "#AAA" : "#666" }]}>
                Change
              </Text>
              <Text style={[styles.changeValue, { color: changeColor }]}>
                {isPositive ? "+" : ""}
                {item.change.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Mini Sparkline Chart Placeholder */}
          <View style={styles.miniChart}>
            {[...Array(24)].map((_, i) => {
              const height = 8 + Math.sin(i * 0.4) * 20 + (isPositive ? 5 : -5);
              return (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: Math.max(4, height),
                    backgroundColor: changeColor + "60",
                    borderRadius: 2,
                  }}
                />
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: isDark ? "#000" : "#faf8f8" },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.loadingText, { color: isDark ? "#AAA" : "#666" }]}>
          Fetching live market data...
        </Text>
      </View>
    );
  }

  const totalValue = stocks.reduce((sum, s) => sum + (s.price || 0), 0);
  const totalChange = stocks.reduce((sum, s) => sum + (s.change || 0), 0);
  const isPositivePortfolio = totalChange >= 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000" : "#F8F9FA" },
      ]}
    >
      {/* Header with Portfolio Summary */}
      <View
        style={[styles.header, { backgroundColor: isDark ? "#111" : "#FFF" }]}
      >
        <Text style={[styles.greeting, { color: isDark ? "#AAA" : "#555" }]}>
          Good {new Date().getHours() < 12 ? "Morning" : "Afternoon"}
        </Text>
        <Text style={[styles.title, { color: isDark ? "#FFF" : "#000" }]}>
          My Watchlist
        </Text>

        <View
          style={[
            styles.portfolioBox,
            { backgroundColor: isDark ? "#1A1A1A" : "#F0F4F8" },
          ]}
        >
          <View>
            <Text
              style={[
                styles.portfolioLabel,
                { color: isDark ? "#AAA" : "#666" },
              ]}
            >
              Total Value
            </Text>
            <Text
              style={[styles.portfolioBig, { color: isDark ? "#FFF" : "#000" }]}
            >
              $
              {totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={[
                styles.portfolioLabel,
                { color: isDark ? "#AAA" : "#666" },
              ]}
            >
              Today's P&L
            </Text>
            <Text
              style={[
                styles.portfolioChange,
                {
                  color: isPositivePortfolio
                    ? ("#34C759" as any)
                    : ("#FF3B30" as any),
                },
              ]}
            >
              {isPositivePortfolio ? "+" : ""}
              {totalChange.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={stocks}
        keyExtractor={(item) => item.symbol}
        renderItem={renderStockCard}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchStocks(true)}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  greeting: { fontSize: 15, marginBottom: 4 },
  title: { fontSize: 34, fontWeight: "bold", marginBottom: 20 },
  portfolioBox: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  portfolioLabel: { fontSize: 13, marginBottom: 6 },
  portfolioBig: { fontSize: 32, fontWeight: "700" },
  portfolioChange: { fontSize: 24, fontWeight: "600" },
  list: { padding: 16 },
  cardWrapper: { marginBottom: 16 },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  symbol: { fontSize: 22, fontWeight: "700" },
  name: { fontSize: 14, marginTop: 2 },
  changeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  changeText: { fontSize: 15, fontWeight: "700" },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  price: { fontSize: 28, fontWeight: "bold" },
  changeValue: { fontSize: 18, fontWeight: "600" },
  miniChart: {
    flexDirection: "row",
    height: 50,
    alignItems: "flex-end",
    gap: 3,
  },
  loadingText: { marginTop: 16, fontSize: 16 },
  errorText: { fontSize: 15, marginTop: 8, color: "#FF3B30" },
});

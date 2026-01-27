/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';   // your original primary-ish blue
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,

    

    // Added for stock app (HomeScreen, cards, changes)
    primary: '#0a7ea4',          // Main brand color (buttons, links)
    success: '#34C759',          // Green - positive change/profit (Apple/TradingView style)
    danger: '#FF3B30',           // Red - negative change/loss
    card: '#FFFFFF',             // Card background in light mode
    border: '#E5E5EA',           // Light borders/dividers
    notification: '#FF9500',     // Optional - warnings/alerts
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,

    // Added for dark mode (muted but visible shades)
    primary: '#40C4FF',          // Brighter blue for visibility in dark
    success: '#4CAF50',          // Muted green (not too bright, eyesafe)
    danger: '#EF5350',           // Slightly softer red for dark bg
    card: '#1E1E1E',             // Dark card bg (graphite/dark gray)
    border: '#333333',           // Dark borders
    notification: '#FFB74D',     // Orange-ish for alerts in dark
  },
} as const;  // 'as const' se better type inference milta hai TS mein

// Optional: Agar type safety chahiye toh yeh export kar sakta hai
export type Theme = typeof Colors;
export type ColorScheme = keyof Theme;  // 'light' | 'dark'
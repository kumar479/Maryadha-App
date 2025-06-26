import { StyleSheet } from 'react-native';
import Colors from './Colors';

// Define typography styles for the app
export default StyleSheet.create({
  // Headings - Playfair Display
  h1: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 32,
    color: Colors.neutral[900],
    lineHeight: 40,
  },
  h2: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 28,
    color: Colors.neutral[900],
    lineHeight: 36,
  },
  h3: {
    fontFamily: 'PlayfairDisplay_500Medium',
    fontSize: 24,
    color: Colors.neutral[900],
    lineHeight: 32,
  },
  h4: {
    fontFamily: 'PlayfairDisplay_500Medium',
    fontSize: 20,
    color: Colors.neutral[900],
    lineHeight: 28,
  },
  h5: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 18,
    color: Colors.neutral[900],
    lineHeight: 26,
  },
  
  // Body text - Inter
  bodyLarge: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.neutral[900],
    lineHeight: 24,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.neutral[900],
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.neutral[900],
    lineHeight: 20,
  },
  
  // Caption and labels
  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.neutral[500],
    lineHeight: 16,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.neutral[900],
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    lineHeight: 16,
  },
});
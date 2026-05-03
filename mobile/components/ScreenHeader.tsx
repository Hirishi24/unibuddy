import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { C } from '../constants/colors';

interface ScreenHeaderProps {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export const HEADER_HEIGHT = Platform.OS === 'ios' ? 58 : (StatusBar.currentHeight || 24) + 20;

export function ScreenHeader({ title, left, right }: ScreenHeaderProps) {
  return (
    <View style={s.container}>
      <View style={s.side}>{left ?? null}</View>

      <View style={s.islandWrap}>
        <View style={s.pill}>
          <Text style={s.pillText} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>

      <View style={[s.side, s.sideRight]}>{right ?? null}</View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: C.bg,
  },
  side: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  islandWrap: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    backgroundColor: '#000',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
    paddingHorizontal: 18,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  pillText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

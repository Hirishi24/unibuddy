import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { C } from '../constants/colors';
import { IslandNotification, useDynamicIsland } from '../context/DynamicIslandContext';

interface ScreenHeaderProps {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export const HEADER_HEIGHT = Platform.OS === 'ios' ? 58 : (StatusBar.currentHeight || 24) + 20;

const PILL_W_IDLE = 140;
const PILL_H_IDLE = 34;
const PILL_W_EXPANDED = 280;
const PILL_H_EXPANDED = 76;

export function ScreenHeader({ title, left, right }: ScreenHeaderProps) {
  const { subscribe } = useDynamicIsland();
  const [notification, setNotification] = useState<IslandNotification | null>(null);

  const pillWidth = useRef(new Animated.Value(PILL_W_IDLE)).current;
  const pillHeight = useRef(new Animated.Value(PILL_H_IDLE)).current;
  const pillRadius = useRef(new Animated.Value(PILL_H_IDLE / 2)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const unsub = subscribe((n) => {
      if (n) {
        setNotification(n);
        Animated.sequence([
          Animated.parallel([
            Animated.spring(pillWidth, { toValue: PILL_W_EXPANDED, useNativeDriver: false, damping: 18, stiffness: 260 }),
          ]),
          Animated.parallel([
            Animated.spring(pillHeight, { toValue: PILL_H_EXPANDED, useNativeDriver: false, damping: 18, stiffness: 260 }),
            Animated.spring(pillRadius, { toValue: 22, useNativeDriver: false, damping: 18, stiffness: 260 }),
            Animated.timing(titleOpacity, { toValue: 0, duration: 100, useNativeDriver: false }),
          ]),
          Animated.timing(contentOpacity, { toValue: 1, duration: 220, useNativeDriver: false }),
        ]).start();
      } else {
        Animated.sequence([
          Animated.timing(contentOpacity, { toValue: 0, duration: 180, useNativeDriver: false }),
          Animated.parallel([
            Animated.spring(pillHeight, { toValue: PILL_H_IDLE, useNativeDriver: false, damping: 20, stiffness: 300 }),
            Animated.spring(pillRadius, { toValue: PILL_H_IDLE / 2, useNativeDriver: false, damping: 20, stiffness: 300 }),
            Animated.spring(pillWidth, { toValue: PILL_W_IDLE, useNativeDriver: false, damping: 20, stiffness: 300 }),
            Animated.timing(titleOpacity, { toValue: 1, duration: 220, useNativeDriver: false }),
          ]),
        ]).start(() => setNotification(null));
      }
    });
    return unsub;
  }, [subscribe]);

  const glowColor = notification?.color ?? C.primary;

  return (
    <View style={s.container}>
      <View style={s.side}>{left ?? null}</View>

      <View style={s.islandWrap}>
        <Animated.View
          style={[
            s.island,
            {
              width: pillWidth,
              height: pillHeight,
              borderRadius: pillRadius,
              shadowColor: glowColor,
              borderColor: notification ? `${glowColor}44` : 'rgba(99,102,241,0.25)',
            },
          ]}
        >
          {/* Idle: screen title */}
          <Animated.Text style={[s.idleText, { opacity: titleOpacity }]} numberOfLines={1}>
            {title}
          </Animated.Text>

          {/* Expanded: notification content */}
          <Animated.View style={[s.notifContent, { opacity: contentOpacity }]} pointerEvents="none">
            <View style={s.notifRow}>
              <View style={[s.iconCircle, { backgroundColor: `${glowColor}22`, borderColor: `${glowColor}40` }]}>
                <Text style={s.iconText}>{notification?.icon ?? ''}</Text>
              </View>
              <View style={s.notifText}>
                <Text style={[s.notifTitle, { color: glowColor }]} numberOfLines={1}>
                  {notification?.title ?? ''}
                </Text>
                <Text style={s.notifMessage} numberOfLines={1}>
                  {notification?.message ?? ''}
                </Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
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
  island: {
    backgroundColor: '#000',
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  idleText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    position: 'absolute',
  },
  notifContent: {
    position: 'absolute',
    inset: 0,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: {
    fontSize: 20,
  },
  notifText: {
    flex: 1,
    gap: 2,
  },
  notifTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  notifMessage: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
});

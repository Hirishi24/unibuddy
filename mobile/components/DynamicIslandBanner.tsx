import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { C } from '../constants/colors';
import { IslandNotification, useDynamicIsland } from '../context/DynamicIslandContext';

// Mirrors the real Dynamic Island notch size at rest
const IDLE_W = 120;
const IDLE_H = 36;
const IDLE_R = 18;

const FULL_W = 320;
const FULL_H = 80;
const FULL_R = 26;

const TOP = Platform.OS === 'ios' ? 12 : (StatusBar.currentHeight ?? 24) + 2;

// Spring presets
const EXPAND_SPRING = { useNativeDriver: false, damping: 14, stiffness: 260 } as const;
const COLLAPSE_SPRING = { useNativeDriver: false, damping: 22, stiffness: 360 } as const;
const BOUNCE_SPRING = { useNativeDriver: false, damping: 10, stiffness: 300 } as const;

export function DynamicIslandBanner() {
  const { subscribe } = useDynamicIsland();
  const [notification, setNotification] = useState<IslandNotification | null>(null);
  const [visible, setVisible] = useState(false);
  const animating = useRef(false);

  // Layout shape
  const pillW = useRef(new Animated.Value(IDLE_W)).current;
  const pillH = useRef(new Animated.Value(IDLE_H)).current;
  const pillR = useRef(new Animated.Value(IDLE_R)).current;

  // Overall pill presence
  const pillOpacity = useRef(new Animated.Value(0)).current;
  const pillScale = useRef(new Animated.Value(0.82)).current;

  // Content layer
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(10)).current;

  // Icon bounce
  const iconScale = useRef(new Animated.Value(0)).current;

  // Text slide
  const textX = useRef(new Animated.Value(12)).current;

  const resetToIdle = useCallback(() => {
    pillW.setValue(IDLE_W);
    pillH.setValue(IDLE_H);
    pillR.setValue(IDLE_R);
    pillOpacity.setValue(0);
    pillScale.setValue(0.82);
    contentOpacity.setValue(0);
    contentY.setValue(10);
    iconScale.setValue(0);
    textX.setValue(12);
  }, []);

  const runExpand = useCallback(() => {
    Animated.sequence([
      // 1 — Pop the compact pill into view
      Animated.parallel([
        Animated.spring(pillOpacity, { toValue: 1, useNativeDriver: false, damping: 20, stiffness: 400 }),
        Animated.spring(pillScale, { toValue: 1, ...BOUNCE_SPRING }),
      ]),
      // 2 — Stretch wide (horizontal first, like iOS)
      Animated.parallel([
        Animated.spring(pillW, { toValue: FULL_W, ...EXPAND_SPRING }),
        Animated.spring(pillR, { toValue: FULL_R, ...EXPAND_SPRING }),
      ]),
      // 3 — Drop down (vertical expansion)
      Animated.spring(pillH, { toValue: FULL_H, ...EXPAND_SPRING }),
      // 4 — Reveal content with stagger
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 180, useNativeDriver: false }),
        Animated.spring(contentY, { toValue: 0, useNativeDriver: false, damping: 20, stiffness: 300 }),
        Animated.spring(iconScale, { toValue: 1, ...BOUNCE_SPRING }),
        Animated.spring(textX, { toValue: 0, useNativeDriver: false, damping: 18, stiffness: 280 }),
      ]),
    ]).start();
  }, []);

  const runCollapse = useCallback((onDone: () => void) => {
    Animated.sequence([
      // 1 — Sweep content away
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 0, duration: 140, useNativeDriver: false }),
        Animated.spring(contentY, { toValue: -8, useNativeDriver: false, damping: 22, stiffness: 360 }),
        Animated.spring(iconScale, { toValue: 0, ...COLLAPSE_SPRING }),
        Animated.spring(textX, { toValue: -10, useNativeDriver: false, ...COLLAPSE_SPRING }),
      ]),
      // 2 — Snap back to compact pill
      Animated.parallel([
        Animated.spring(pillH, { toValue: IDLE_H, ...COLLAPSE_SPRING }),
        Animated.spring(pillW, { toValue: IDLE_W, ...COLLAPSE_SPRING }),
        Animated.spring(pillR, { toValue: IDLE_R, ...COLLAPSE_SPRING }),
      ]),
      // 3 — Shrink + vanish
      Animated.parallel([
        Animated.spring(pillScale, { toValue: 0.82, ...COLLAPSE_SPRING }),
        Animated.timing(pillOpacity, { toValue: 0, duration: 160, useNativeDriver: false }),
      ]),
    ]).start(() => onDone());
  }, []);

  useEffect(() => {
    const unsub = subscribe((n) => {
      if (n) {
        resetToIdle();
        setNotification(n);
        setVisible(true);
        runExpand();
      } else {
        runCollapse(() => {
          setNotification(null);
          setVisible(false);
        });
      }
    });
    return unsub;
  }, [subscribe, resetToIdle, runExpand, runCollapse]);

  if (!visible && !notification) return null;

  const glow = notification?.color ?? C.primary;

  return (
    <View style={[s.wrapper, { top: TOP }]} pointerEvents="none">
      <Animated.View
        style={[
          s.pill,
          {
            width: pillW,
            height: pillH,
            borderRadius: pillR,
            opacity: pillOpacity,
            shadowColor: glow,
            borderColor: `${glow}55`,
            transform: [{ scale: pillScale }],
          },
        ]}
      >
        {/* Colored left accent bar */}
        <View style={[s.accent, { backgroundColor: glow }]} />

        {/* Notification content */}
        <Animated.View
          style={[
            s.content,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentY }],
            },
          ]}
        >
          <View style={s.row}>
            {/* Bouncing icon */}
            <Animated.View
              style={[
                s.iconCircle,
                {
                  backgroundColor: `${glow}1a`,
                  borderColor: `${glow}50`,
                  transform: [{ scale: iconScale }],
                },
              ]}
            >
              <Text style={s.iconText}>{notification?.icon ?? ''}</Text>
            </Animated.View>

            {/* Sliding text */}
            <Animated.View
              style={[s.textBlock, { transform: [{ translateX: textX }] }]}
            >
              <Text style={[s.title, { color: glow }]} numberOfLines={1}>
                {notification?.title ?? ''}
              </Text>
              <Text style={s.message} numberOfLines={1}>
                {notification?.message ?? ''}
              </Text>
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  pill: {
    backgroundColor: '#060608',
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 14,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingLeft: 18,
    paddingRight: 14,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: {
    fontSize: 22,
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  message: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
  Easing,
} from 'react-native';
import { C } from '../constants/colors';
import { IslandNotification, useDynamicIsland } from '../context/DynamicIslandContext';

const FULL_W = 318;
const FULL_H = 84;
const FULL_R = 26;
const SCAN_H = 3;
const TOP = Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight ?? 24);

// ─── Pulsing live dots ───────────────────────────────────────────────────────
function PulseDots({ color }: { color: string }) {
  const dots = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ];

  useEffect(() => {
    const makeLoop = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 320, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
          Animated.timing(val, { toValue: 0.3, duration: 320, useNativeDriver: true, easing: Easing.in(Easing.ease) }),
        ])
      );

    const anims = [makeLoop(dots[0], 0), makeLoop(dots[1], 160), makeLoop(dots[2], 320)];
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={s.dotsRow}>
      {dots.map((scale, i) => (
        <Animated.View
          key={i}
          style={[s.dot, { backgroundColor: color, transform: [{ scale }] }]}
        />
      ))}
    </View>
  );
}

// ─── Main banner ─────────────────────────────────────────────────────────────
export function DynamicIslandBanner() {
  const { subscribe } = useDynamicIsland();
  const [notif, setNotif] = useState<IslandNotification | null>(null);
  const [visible, setVisible] = useState(false);

  // Shape
  const pillW = useRef(new Animated.Value(FULL_W)).current;
  const pillH = useRef(new Animated.Value(SCAN_H)).current;
  const pillR = useRef(new Animated.Value(2)).current;
  const pillOpacity = useRef(new Animated.Value(0)).current;

  // Scanline that sweeps top→bottom after pill opens
  const scanY = useRef(new Animated.Value(0)).current;
  const scanOpacity = useRef(new Animated.Value(0)).current;

  // Top edge glow bar
  const glowOpacity = useRef(new Animated.Value(0)).current;

  // Content
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(14)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const msgY = useRef(new Animated.Value(14)).current;
  const msgOpacity = useRef(new Animated.Value(0)).current;

  const reset = useCallback(() => {
    pillW.setValue(FULL_W);
    pillH.setValue(SCAN_H);
    pillR.setValue(2);
    pillOpacity.setValue(0);
    scanY.setValue(0);
    scanOpacity.setValue(0);
    glowOpacity.setValue(0);
    contentOpacity.setValue(0);
    iconScale.setValue(0);
    titleY.setValue(14);
    titleOpacity.setValue(0);
    msgY.setValue(14);
    msgOpacity.setValue(0);
  }, []);

  const expand = useCallback(() => {
    Animated.sequence([
      // 1. Flash the scanner line into existence
      Animated.timing(pillOpacity, { toValue: 1, duration: 60, useNativeDriver: false }),

      // 2. Drop height from scanner line to full height (spring with overshoot)
      Animated.parallel([
        Animated.spring(pillH, { toValue: FULL_H, useNativeDriver: false, damping: 12, stiffness: 200 }),
        Animated.spring(pillR, { toValue: FULL_R, useNativeDriver: false, damping: 16, stiffness: 240 }),
        Animated.timing(glowOpacity, { toValue: 1, duration: 200, useNativeDriver: false }),
      ]),

      // 3. Scanline sweeps top to bottom
      Animated.parallel([
        Animated.timing(scanOpacity, { toValue: 0.9, duration: 60, useNativeDriver: false }),
        Animated.timing(scanY, {
          toValue: FULL_H,
          duration: 240,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.quad),
        }),
      ]),
      Animated.timing(scanOpacity, { toValue: 0, duration: 80, useNativeDriver: false }),

      // 4. Content cascade: icon charge-up → title → message
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 60, useNativeDriver: false }),
        // Icon: heavy overshoot spring (charge-up)
        Animated.spring(iconScale, { toValue: 1, useNativeDriver: false, damping: 6, stiffness: 260, mass: 0.6 }),
      ]),

      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 160, useNativeDriver: false }),
        Animated.spring(titleY, { toValue: 0, useNativeDriver: false, damping: 18, stiffness: 300 }),
      ]),

      Animated.parallel([
        Animated.timing(msgOpacity, { toValue: 1, duration: 140, useNativeDriver: false }),
        Animated.spring(msgY, { toValue: 0, useNativeDriver: false, damping: 18, stiffness: 300 }),
      ]),
    ]).start();
  }, []);

  const collapse = useCallback((done: () => void) => {
    Animated.sequence([
      // Sweep content away downward
      Animated.parallel([
        Animated.timing(msgOpacity, { toValue: 0, duration: 100, useNativeDriver: false }),
        Animated.timing(titleOpacity, { toValue: 0, duration: 120, useNativeDriver: false }),
        Animated.timing(iconScale, { toValue: 0, duration: 120, useNativeDriver: false }),
        Animated.timing(contentOpacity, { toValue: 0, duration: 140, useNativeDriver: false }),
        Animated.timing(glowOpacity, { toValue: 0, duration: 140, useNativeDriver: false }),
      ]),
      // Collapse height back to scanner line
      Animated.parallel([
        Animated.spring(pillH, { toValue: SCAN_H, useNativeDriver: false, damping: 20, stiffness: 340 }),
        Animated.spring(pillR, { toValue: 2, useNativeDriver: false, damping: 20, stiffness: 340 }),
      ]),
      // Flash out
      Animated.timing(pillOpacity, { toValue: 0, duration: 100, useNativeDriver: false }),
    ]).start(() => done());
  }, []);

  useEffect(() => {
    const unsub = subscribe((n) => {
      if (n) {
        reset();
        setNotif(n);
        setVisible(true);
        // tiny rAF delay so state flush happens before animation kicks
        requestAnimationFrame(() => expand());
      } else {
        collapse(() => {
          setNotif(null);
          setVisible(false);
        });
      }
    });
    return unsub;
  }, [subscribe, reset, expand, collapse]);

  if (!visible && !notif) return null;

  const glow = notif?.color ?? C.primary;

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
            borderColor: `${glow}60`,
          },
        ]}
      >
        {/* ── Top edge glow bar ── */}
        <Animated.View
          style={[s.topBar, { backgroundColor: glow, opacity: glowOpacity }]}
        />

        {/* ── Scanline that sweeps down ── */}
        <Animated.View
          style={[
            s.scanLine,
            {
              backgroundColor: glow,
              opacity: scanOpacity,
              transform: [{ translateY: scanY }],
            },
          ]}
        />

        {/* ── Notification content ── */}
        <Animated.View style={[s.content, { opacity: contentOpacity }]}>
          <View style={s.row}>
            {/* Icon with charge-up bounce */}
            <Animated.View
              style={[
                s.iconCircle,
                {
                  backgroundColor: `${glow}18`,
                  borderColor: `${glow}55`,
                  transform: [{ scale: iconScale }],
                },
              ]}
            >
              <Text style={s.iconText}>{notif?.icon ?? ''}</Text>
            </Animated.View>

            {/* Title + message */}
            <View style={s.textCol}>
              <Animated.Text
                style={[
                  s.title,
                  { color: glow, opacity: titleOpacity, transform: [{ translateY: titleY }] },
                ]}
                numberOfLines={1}
              >
                {notif?.title ?? ''}
              </Animated.Text>
              <Animated.Text
                style={[
                  s.message,
                  { opacity: msgOpacity, transform: [{ translateY: msgY }] },
                ]}
                numberOfLines={1}
              >
                {notif?.message ?? ''}
              </Animated.Text>
            </View>

            {/* Live pulsing dots */}
            <Animated.View style={{ opacity: contentOpacity }}>
              <PulseDots color={glow} />
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
    backgroundColor: '#07070a',
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
    elevation: 16,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: {
    fontSize: 24,
  },
  textCol: {
    flex: 1,
    gap: 4,
    overflow: 'hidden',
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
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});

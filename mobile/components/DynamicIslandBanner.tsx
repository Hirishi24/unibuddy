import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { C } from '../constants/colors';
import { IslandNotification, useDynamicIsland } from '../context/DynamicIslandContext';

const FULL_W = 318;
const FULL_H = 82;
const FULL_R = 26;
const SCAN_H = 3;
const TOP = Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight ?? 24);

// ─── Rolling pulse dots ───────────────────────────────────────────────────────
function PulseDots({ color, visible }: { color: string; visible: boolean }) {
  const a = useRef(new Animated.Value(0.3)).current;
  const b = useRef(new Animated.Value(0.3)).current;
  const c = useRef(new Animated.Value(0.3)).current;
  const loops = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    if (!visible) {
      loops.current.forEach((l) => l.stop());
      [a, b, c].forEach((v) => v.setValue(0.3));
      return;
    }
    const make = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
          Animated.timing(val, { toValue: 0.3, duration: 300, useNativeDriver: true, easing: Easing.in(Easing.ease) }),
        ])
      );
    loops.current = [make(a, 0), make(b, 150), make(c, 300)];
    loops.current.forEach((l) => l.start());
    return () => { loops.current.forEach((l) => l.stop()); };
  }, [visible]);

  return (
    <View style={st.dotsRow}>
      {[a, b, c].map((scale, i) => (
        <Animated.View key={i} style={[st.dot, { backgroundColor: color, transform: [{ scale }] }]} />
      ))}
    </View>
  );
}

// ─── Banner ───────────────────────────────────────────────────────────────────
type Phase = 'idle' | 'entering' | 'showing' | 'leaving';

export function DynamicIslandBanner() {
  const { subscribe, dismiss } = useDynamicIsland();
  const [notif, setNotif] = useState<IslandNotification | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');

  // Shape
  const pillH     = useRef(new Animated.Value(SCAN_H)).current;
  const pillR     = useRef(new Animated.Value(2)).current;
  const pillOp    = useRef(new Animated.Value(0)).current;

  // Scanline
  const scanY     = useRef(new Animated.Value(0)).current;
  const scanOp    = useRef(new Animated.Value(0)).current;

  // Top glow bar
  const barOp     = useRef(new Animated.Value(0)).current;

  // Content
  const contOp    = useRef(new Animated.Value(0)).current;
  const iconSc    = useRef(new Animated.Value(0)).current;
  const titleY    = useRef(new Animated.Value(12)).current;
  const titleOp   = useRef(new Animated.Value(0)).current;
  const msgY      = useRef(new Animated.Value(12)).current;
  const msgOp     = useRef(new Animated.Value(0)).current;

  // X button fade
  const xOp       = useRef(new Animated.Value(0)).current;

  // ── Reset all values to scanner-line idle ─────────────────────────────────
  const hardReset = useCallback(() => {
    pillH.setValue(SCAN_H);
    pillR.setValue(2);
    pillOp.setValue(0);
    scanY.setValue(0);
    scanOp.setValue(0);
    barOp.setValue(0);
    contOp.setValue(0);
    iconSc.setValue(0);
    titleY.setValue(12);
    titleOp.setValue(0);
    msgY.setValue(12);
    msgOp.setValue(0);
    xOp.setValue(0);
  }, []);

  // ── Receive context events ────────────────────────────────────────────────
  useEffect(() => {
    return subscribe((n) => {
      if (n) {
        hardReset();
        setNotif(n);
        setPhase('entering');
      } else {
        setPhase('leaving');
      }
    });
  }, [subscribe, hardReset]);

  // ── Handle X button press ─────────────────────────────────────────────────
  const handleDismiss = useCallback(() => {
    dismiss();
  }, [dismiss]);

  // ── EXPAND ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'entering' || !notif) return;

    Animated.sequence([
      // 1. Flash scanner line visible
      Animated.timing(pillOp, { toValue: 1, duration: 80, useNativeDriver: false }),

      // 2. Drop to full height (spring with bounce)
      Animated.parallel([
        Animated.spring(pillH, { toValue: FULL_H, useNativeDriver: false, damping: 11, stiffness: 180 }),
        Animated.spring(pillR, { toValue: FULL_R, useNativeDriver: false, damping: 16, stiffness: 240 }),
        Animated.timing(barOp, { toValue: 1, duration: 260, useNativeDriver: false }),
      ]),

      // 3. Scanline sweep top → bottom
      Animated.parallel([
        Animated.timing(scanOp, { toValue: 0.85, duration: 60, useNativeDriver: false }),
        Animated.timing(scanY,  { toValue: FULL_H + 4, duration: 280, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
      ]),
      Animated.timing(scanOp, { toValue: 0, duration: 80, useNativeDriver: false }),

      // 4. Content in — icon charge-up (heavy bounce), then title, then message
      Animated.timing(contOp, { toValue: 1, duration: 60, useNativeDriver: false }),
      Animated.spring(iconSc, { toValue: 1, useNativeDriver: false, damping: 5, stiffness: 240, mass: 0.5 }),
      Animated.parallel([
        Animated.timing(titleOp, { toValue: 1, duration: 180, useNativeDriver: false }),
        Animated.spring(titleY,  { toValue: 0, useNativeDriver: false, damping: 18, stiffness: 300 }),
      ]),
      Animated.parallel([
        Animated.timing(msgOp,  { toValue: 1, duration: 160, useNativeDriver: false }),
        Animated.spring(msgY,   { toValue: 0, useNativeDriver: false, damping: 18, stiffness: 300 }),
      ]),

      // 5. X button fades in last
      Animated.timing(xOp, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start(() => setPhase('showing'));
  }, [phase, notif]);

  // ── COLLAPSE ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'leaving') return;

    Animated.sequence([
      Animated.parallel([
        Animated.timing(xOp,    { toValue: 0, duration: 80,  useNativeDriver: false }),
        Animated.timing(msgOp,  { toValue: 0, duration: 100, useNativeDriver: false }),
        Animated.timing(titleOp,{ toValue: 0, duration: 120, useNativeDriver: false }),
        Animated.timing(iconSc, { toValue: 0, duration: 120, useNativeDriver: false }),
        Animated.timing(contOp, { toValue: 0, duration: 140, useNativeDriver: false }),
        Animated.timing(barOp,  { toValue: 0, duration: 140, useNativeDriver: false }),
      ]),
      Animated.parallel([
        Animated.spring(pillH, { toValue: SCAN_H, useNativeDriver: false, damping: 22, stiffness: 360 }),
        Animated.spring(pillR, { toValue: 2,      useNativeDriver: false, damping: 22, stiffness: 360 }),
      ]),
      Animated.timing(pillOp, { toValue: 0, duration: 120, useNativeDriver: false }),
    ]).start(() => {
      setNotif(null);
      setPhase('idle');
    });
  }, [phase]);

  if (phase === 'idle') return null;

  const glow = notif?.color ?? C.primary;

  return (
    <View style={[st.wrapper, { top: TOP }]} pointerEvents="box-none">
      <Animated.View
        style={[
          st.pill,
          {
            width: FULL_W,
            height: pillH,
            borderRadius: pillR,
            opacity: pillOp,
            shadowColor: glow,
            borderColor: `${glow}60`,
          },
        ]}
      >
        {/* Top glow bar */}
        <Animated.View style={[st.topBar, { backgroundColor: glow, opacity: barOp }]} />

        {/* Scanline sweep */}
        <Animated.View style={[st.scanLine, { backgroundColor: glow, opacity: scanOp, transform: [{ translateY: scanY }] }]} />

        {/* Content */}
        <Animated.View style={[st.content, { opacity: contOp }]}>
          <View style={st.row}>
            {/* Icon — bounces in */}
            <Animated.View style={[st.iconCircle, { backgroundColor: `${glow}18`, borderColor: `${glow}55`, transform: [{ scale: iconSc }] }]}>
              <Text style={st.iconText}>{notif?.icon ?? ''}</Text>
            </Animated.View>

            {/* Text cascade */}
            <View style={st.textCol}>
              <Animated.Text style={[st.title, { color: glow, opacity: titleOp, transform: [{ translateY: titleY }] }]} numberOfLines={1}>
                {notif?.title ?? ''}
              </Animated.Text>
              <Animated.Text style={[st.msg, { opacity: msgOp, transform: [{ translateY: msgY }] }]} numberOfLines={1}>
                {notif?.message ?? ''}
              </Animated.Text>
            </View>

            {/* Live dots */}
            <PulseDots color={glow} visible={phase === 'showing'} />
          </View>
        </Animated.View>

        {/* X dismiss button — fades in after content */}
        <Animated.View style={[st.xWrap, { opacity: xOp }]}>
          <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={[st.xBtn, { borderColor: `${glow}55` }]}>
            <Text style={[st.xIcon, { color: glow }]}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const st = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  pill: {
    backgroundColor: '#07070b',
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 22,
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
    paddingRight: 46,
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
  iconText: { fontSize: 24 },
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
  msg: {
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
  xWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xIcon: {
    fontSize: 11,
    fontWeight: '700',
  },
});

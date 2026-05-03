import React, { useEffect, useRef, useState } from 'react';
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

const PILL_W_IDLE = 0;
const PILL_H_IDLE = 0;
const PILL_W_EXPANDED = 300;
const PILL_H_EXPANDED = 76;
const TOP_OFFSET = Platform.OS === 'ios' ? 14 : (StatusBar.currentHeight ?? 24) + 4;

export function DynamicIslandBanner() {
  const { subscribe } = useDynamicIsland();
  const [notification, setNotification] = useState<IslandNotification | null>(null);
  const [visible, setVisible] = useState(false);

  const pillWidth = useRef(new Animated.Value(PILL_W_IDLE)).current;
  const pillHeight = useRef(new Animated.Value(PILL_H_IDLE)).current;
  const pillRadius = useRef(new Animated.Value(24)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    const unsub = subscribe((n) => {
      if (n) {
        setNotification(n);
        setVisible(true);
        Animated.sequence([
          Animated.parallel([
            Animated.spring(pillWidth, {
              toValue: PILL_W_EXPANDED,
              useNativeDriver: false,
              damping: 16,
              stiffness: 280,
            }),
            Animated.spring(pillHeight, {
              toValue: PILL_H_EXPANDED,
              useNativeDriver: false,
              damping: 16,
              stiffness: 280,
            }),
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: false,
              damping: 16,
              stiffness: 280,
            }),
          ]),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start();
      } else {
        Animated.sequence([
          Animated.timing(contentOpacity, {
            toValue: 0,
            duration: 160,
            useNativeDriver: false,
          }),
          Animated.parallel([
            Animated.spring(pillWidth, {
              toValue: PILL_W_IDLE,
              useNativeDriver: false,
              damping: 20,
              stiffness: 320,
            }),
            Animated.spring(pillHeight, {
              toValue: PILL_H_IDLE,
              useNativeDriver: false,
              damping: 20,
              stiffness: 320,
            }),
            Animated.spring(translateY, {
              toValue: -20,
              useNativeDriver: false,
              damping: 20,
              stiffness: 320,
            }),
          ]),
        ]).start(() => {
          setNotification(null);
          setVisible(false);
        });
      }
    });
    return unsub;
  }, [subscribe]);

  if (!visible && !notification) return null;

  const glowColor = notification?.color ?? C.primary;

  return (
    <View style={[s.wrapper, { top: TOP_OFFSET }]} pointerEvents="none">
      <Animated.View
        style={[
          s.pill,
          {
            width: pillWidth,
            height: pillHeight,
            borderRadius: pillRadius,
            shadowColor: glowColor,
            borderColor: `${glowColor}50`,
            transform: [{ translateY }],
          },
        ]}
      >
        <Animated.View style={[s.content, { opacity: contentOpacity }]}>
          <View style={s.row}>
            <View
              style={[
                s.iconCircle,
                {
                  backgroundColor: `${glowColor}22`,
                  borderColor: `${glowColor}44`,
                },
              ]}
            >
              <Text style={s.iconText}>{notification?.icon ?? ''}</Text>
            </View>
            <View style={s.textBlock}>
              <Text style={[s.title, { color: glowColor }]} numberOfLines={1}>
                {notification?.title ?? ''}
              </Text>
              <Text style={s.message} numberOfLines={1}>
                {notification?.message ?? ''}
              </Text>
            </View>
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
    backgroundColor: '#000',
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
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
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
  },
});

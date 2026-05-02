import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SubjectStats } from '../types';
import { C } from '../constants/colors';

interface Props {
  stat: SubjectStats;
}

const statusColor = (s: SubjectStats['status']) => {
  if (s === 'safe') return C.success;
  if (s === 'warning') return C.warning;
  return C.danger;
};

const BarFill = ({ pct, color }: { pct: number; color: string }) => (
  <View style={bar.track}>
    <View
      style={[bar.fill, { width: `${Math.min(100, Math.max(0, pct))}%` as any, backgroundColor: color }]}
    />
    <View style={[bar.target]} />
  </View>
);

export const SubjectRow = ({ stat }: Props) => {
  const color = statusColor(stat.status);
  const pct = Math.round(stat.percentage);
  const curPct = Math.round(stat.currentPercentage);

  return (
    <View style={[s.card, { borderColor: `${color}22` }]}>
      <View style={[s.accent, { backgroundColor: color }]} />

      <View style={s.top}>
        <View style={s.titleArea}>
          <Text style={s.title} numberOfLines={1}>{stat.title}</Text>
          <Text style={s.code}>{stat.course}</Text>
        </View>
        <View style={[s.pctBadge, { backgroundColor: `${color}18`, borderColor: `${color}40` }]}>
          <Text style={[s.pctText, { color }]}>{pct}%</Text>
        </View>
      </View>

      <BarFill pct={pct} color={color} />

      <View style={s.statsRow}>
        <Stat label="Attended" value={`${stat.attended}/${stat.conducted}`} color={C.textMuted} />
        <Stat label="Current" value={`${curPct}%`} color={C.textMuted} />
        {stat.status === 'safe' ? (
          <Stat label="Can Bunk" value={String(stat.canBunk)} color={C.success} />
        ) : (
          <Stat label="Must Attend" value={String(stat.mustAttend)} color={C.danger} />
        )}
      </View>
    </View>
  );
};

const Stat = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <View style={s.stat}>
    <Text style={[s.statValue, { color }]}>{value}</Text>
    <Text style={s.statLabel}>{label}</Text>
  </View>
);

const bar = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: C.surfaceHigher,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 10,
    position: 'relative',
  },
  fill: { height: '100%', borderRadius: 3 },
  target: {
    position: 'absolute',
    left: '75%' as any,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});

const s = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: 6 },
  titleArea: { flex: 1, paddingRight: 10 },
  title: { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 2 },
  code: { fontSize: 11, color: C.textMuted, fontWeight: '600' },
  pctBadge: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  pctText: { fontSize: 15, fontWeight: '900' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 6 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 13, fontWeight: '800' },
  statLabel: { fontSize: 9, color: C.textDim, marginTop: 1, fontWeight: '600' },
});

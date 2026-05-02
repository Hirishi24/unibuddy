import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClassBlock } from '../types';
import { C } from '../constants/colors';
import { isBlockCancelled } from '../lib/academicCalendar';

interface Props {
  blocks: ClassBlock[];
  selectedDate: Date;
}

type Status =
  | { type: 'none' }
  | { type: 'ongoing'; block: ClassBlock; timeLeft: string }
  | { type: 'upcoming'; block: ClassBlock; timeUntil: string }
  | { type: 'done' };

const parseTime = (t: string): Date => {
  const [h, m] = t.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};
const getActualEnd = (endTime: string): Date => {
  const [h] = endTime.split(':').map(Number);
  const d = new Date();
  d.setHours(h, 50, 0, 0);
  return d;
};
const fmt = (ms: number): string => {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

const isToday = (date: Date): boolean => {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

export const OngoingBanner = ({ blocks, selectedDate }: Props) => {
  const [tick, setTick] = useState(new Date());
  const [status, setStatus] = useState<Status>({ type: 'none' });

  useEffect(() => {
    const id = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isToday(selectedDate) || blocks.length === 0) {
      setStatus({ type: 'none' });
      return;
    }
    const now = tick;
    const sorted = [...blocks].sort(
      (a, b) => parseTime(a.startTime).getTime() - parseTime(b.startTime).getTime()
    );

    for (const block of sorted) {
      if (isBlockCancelled(selectedDate)) continue;
      const start = parseTime(block.startTime);
      const end = getActualEnd(block.endTime);
      if (now >= start && now < end) {
        setStatus({ type: 'ongoing', block, timeLeft: fmt(end.getTime() - now.getTime()) });
        return;
      }
    }

    for (const block of sorted) {
      if (isBlockCancelled(selectedDate)) continue;
      const start = parseTime(block.startTime);
      if (now < start) {
        setStatus({ type: 'upcoming', block, timeUntil: fmt(start.getTime() - now.getTime()) });
        return;
      }
    }

    setStatus({ type: 'done' });
  }, [tick, blocks, selectedDate]);

  if (status.type === 'none') return null;

  if (status.type === 'done') {
    return (
      <View style={[s.card, { backgroundColor: 'rgba(52,211,153,0.07)', borderColor: 'rgba(52,211,153,0.25)' }]}>
        <View style={[s.iconWrap, { backgroundColor: 'rgba(52,211,153,0.15)' }]}>
          <Ionicons name="cafe-outline" size={18} color={C.success} />
        </View>
        <View style={s.info}>
          <Text style={[s.label, { color: C.success }]}>All done for today!</Text>
          <Text style={s.sub}>No more classes scheduled</Text>
        </View>
      </View>
    );
  }

  if (status.type === 'upcoming') {
    return (
      <View style={[s.card, { backgroundColor: 'rgba(99,102,241,0.07)', borderColor: 'rgba(99,102,241,0.3)' }]}>
        <View style={[s.iconWrap, { backgroundColor: 'rgba(99,102,241,0.15)' }]}>
          <Ionicons name="calendar-outline" size={18} color={C.primary} />
        </View>
        <View style={s.info}>
          <Text style={[s.label, { color: C.primary }]}>NEXT CLASS</Text>
          <Text style={s.courseText}>{status.block.courseTitle}</Text>
          <Text style={s.sub}>
            {status.block.startTime} · {status.block.room}
          </Text>
        </View>
        <View style={[s.timer, { backgroundColor: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.3)' }]}>
          <Text style={[s.timerValue, { color: C.primary }]}>{status.timeUntil}</Text>
          <Text style={[s.timerLabel, { color: C.primaryLight }]}>until start</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.card, { backgroundColor: 'rgba(52,211,153,0.07)', borderColor: 'rgba(52,211,153,0.3)' }]}>
      <View style={[s.iconWrap, { backgroundColor: 'rgba(52,211,153,0.15)' }]}>
        <View style={[s.pulse, { backgroundColor: C.success }]} />
      </View>
      <View style={s.info}>
        <Text style={[s.label, { color: C.success }]}>ONGOING CLASS</Text>
        <Text style={s.courseText}>{status.block.courseTitle}</Text>
        <Text style={s.sub}>
          {status.block.startTime} · {status.block.room}
        </Text>
      </View>
      <View style={[s.timer, { backgroundColor: 'rgba(52,211,153,0.15)', borderColor: 'rgba(52,211,153,0.3)' }]}>
        <Text style={[s.timerValue, { color: C.success }]}>{status.timeLeft}</Text>
        <Text style={[s.timerLabel, { color: C.success }]}>left</Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: { width: 10, height: 10, borderRadius: 5 },
  info: { flex: 1 },
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  courseText: { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 2 },
  sub: { fontSize: 11, color: C.textMuted },
  timer: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  timerValue: { fontSize: 16, fontWeight: '900', fontVariant: ['tabular-nums'] },
  timerLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', marginTop: 1 },
});

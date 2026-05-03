import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../../context/DataContext';
import { OngoingBanner } from '../../components/OngoingBanner';
import { ClassCard } from '../../components/ClassCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { C } from '../../constants/colors';
import { getNoClassMessage, getSwapInfo } from '../../lib/academicCalendar';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const sameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() &&
  a.getMonth() === b.getMonth() &&
  a.getFullYear() === b.getFullYear();

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { getBlocksForSelectedDay, getAttendanceForDate, markAttendance } = useData();

  const blocks = useMemo(() => getBlocksForSelectedDay(selectedDate), [selectedDate, getBlocksForSelectedDay]);
  const attendance = useMemo(() => getAttendanceForDate(selectedDate), [selectedDate, getAttendanceForDate]);
  const noClassMsg = useMemo(() => getNoClassMessage(selectedDate), [selectedDate]);
  const swapInfo = useMemo(() => getSwapInfo(selectedDate), [selectedDate]);

  const weekDates = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + 1); // Monday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, []);

  const changeDay = useCallback((delta: number) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + delta);
      return next;
    });
  }, []);

  const handleMark = useCallback(
    (blockId: string, status: 'present' | 'absent') => {
      markAttendance(blockId, status, selectedDate);
    },
    [markAttendance, selectedDate]
  );

  return (
    <View style={s.root}>
      <ScreenHeader
        title="Schedule"
        right={
          <TouchableOpacity onPress={() => setSelectedDate(new Date())} style={s.todayBtn}>
            <Text style={s.todayText}>Today</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.weekRow}>
          {weekDates.map((d) => {
            const isSel = sameDay(d, selectedDate);
            const isToday = sameDay(d, new Date());
            return (
              <TouchableOpacity
                key={d.toISOString()}
                onPress={() => setSelectedDate(d)}
                style={[
                  s.dayChip,
                  isSel && s.dayChipSelected,
                  isToday && !isSel && s.dayChipToday,
                ]}
              >
                <Text style={[s.dayLabel, isSel && s.dayLabelSel]}>
                  {DAY_NAMES[d.getDay()]}
                </Text>
                <Text style={[s.dayNum, isSel && s.dayNumSel, isToday && !isSel && { color: C.primary }]}>
                  {d.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={s.dateHeader}>
          <TouchableOpacity onPress={() => changeDay(-1)} style={s.arrowBtn}>
            <Ionicons name="chevron-back" size={18} color={C.textMuted} />
          </TouchableOpacity>
          <View style={s.dateInfo}>
            <Text style={s.dateMain}>
              {FULL_DAY[selectedDate.getDay()]}, {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}
            </Text>
            {swapInfo && (
              <View style={s.swapBadge}>
                <Ionicons name="swap-horizontal-outline" size={11} color={C.theory} />
                <Text style={s.swapText}>Following {swapInfo.followsDay} timetable</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => changeDay(1)} style={s.arrowBtn}>
            <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
          </TouchableOpacity>
        </View>

        {sameDay(selectedDate, new Date()) && blocks.length > 0 && (
          <OngoingBanner blocks={blocks} selectedDate={selectedDate} />
        )}

        {noClassMsg ? (
          <View style={s.noClassCard}>
            <Ionicons name="moon-outline" size={28} color={C.textDim} />
            <Text style={s.noClassTitle}>{noClassMsg}</Text>
            <Text style={s.noClassSub}>No classes scheduled</Text>
          </View>
        ) : blocks.length === 0 ? (
          <View style={s.noClassCard}>
            <Ionicons name="calendar-outline" size={28} color={C.textDim} />
            <Text style={s.noClassTitle}>No timetable loaded</Text>
            <Text style={s.noClassSub}>Pull to refresh on Home screen to fetch data</Text>
          </View>
        ) : (
          <View>
            <Text style={s.classCount}>{blocks.length} class{blocks.length !== 1 ? 'es' : ''}</Text>
            {blocks.map((block) => (
              <ClassCard
                key={block.blockId}
                block={block}
                status={attendance[block.blockId] || null}
                onMarkPresent={() => handleMark(block.blockId, 'present')}
                onMarkAbsent={() => handleMark(block.blockId, 'absent')}
                selectedDate={selectedDate}
              />
            ))}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 20,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { fontSize: 26, fontWeight: '900', color: C.text },
  todayBtn: {
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  todayText: { fontSize: 12, color: C.primary, fontWeight: '700' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  dayChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  dayChipSelected: { backgroundColor: C.primary },
  dayChipToday: { backgroundColor: 'rgba(99,102,241,0.12)', borderWidth: 1, borderColor: C.border },
  dayLabel: { fontSize: 9, fontWeight: '700', color: C.textDim, marginBottom: 3, textTransform: 'uppercase' },
  dayLabelSel: { color: 'rgba(255,255,255,0.8)' },
  dayNum: { fontSize: 15, fontWeight: '800', color: C.text },
  dayNumSel: { color: '#fff' },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInfo: { alignItems: 'center', gap: 4 },
  dateMain: { fontSize: 16, fontWeight: '800', color: C.text },
  swapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(96,165,250,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.25)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  swapText: { fontSize: 10, color: C.theory, fontWeight: '700' },
  classCount: { fontSize: 11, color: C.textDim, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  noClassCard: {
    backgroundColor: C.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
    padding: 40,
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  noClassTitle: { fontSize: 16, fontWeight: '800', color: C.textMuted, marginTop: 4 },
  noClassSub: { fontSize: 12, color: C.textDim, textAlign: 'center' },
});

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../../context/DataContext';
import { SubjectRow } from '../../components/SubjectRow';
import { SubjectStats } from '../../types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useDynamicIsland } from '../../context/DynamicIslandContext';
import { C } from '../../constants/colors';

type Filter = 'all' | 'safe' | 'warning' | 'danger';

const fmtPct = (n: number) => `${Math.round(n)}%`;

export default function SubjectsScreen() {
  const { subjectStats, isLoading } = useData();
  const { notify } = useDynamicIsland();
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<SubjectStats | null>(null);

  const filtered = useMemo(
    () => (filter === 'all' ? subjectStats : subjectStats.filter((s) => s.status === filter)),
    [subjectStats, filter]
  );

  const counts = useMemo(
    () => ({
      safe: subjectStats.filter((s) => s.status === 'safe').length,
      warning: subjectStats.filter((s) => s.status === 'warning').length,
      danger: subjectStats.filter((s) => s.status === 'danger').length,
    }),
    [subjectStats]
  );

  const handleFilterChange = (key: Filter) => {
    setFilter(key);
    const labels: Record<Filter, string> = { all: 'All subjects', safe: 'Safe subjects', warning: 'Warning zone', danger: 'At-risk subjects' };
    const icons: Record<Filter, string> = { all: '📋', safe: '✅', warning: '⚠️', danger: '🚨' };
    const colors: Record<Filter, string> = { all: C.textMuted, safe: C.success, warning: C.warning, danger: C.danger };
    const count = key === 'all' ? subjectStats.length : key === 'safe' ? counts.safe : key === 'warning' ? counts.warning : counts.danger;
    notify({ icon: icons[key], title: labels[key], message: `Showing ${count} subjects`, color: colors[key] });
  };

  return (
    <View style={s.root}>
      <ScreenHeader title="Subjects" />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <View style={s.filterRow}>
          {([
            ['all', 'All', subjectStats.length, C.textMuted],
            ['safe', 'Safe', counts.safe, C.success],
            ['warning', 'Warning', counts.warning, C.warning],
            ['danger', 'At Risk', counts.danger, C.danger],
          ] as const).map(([key, label, count, color]) => (
            <TouchableOpacity
              key={key}
              onPress={() => handleFilterChange(key as Filter)}
              style={[
                s.filterChip,
                filter === key && { backgroundColor: `${color}18`, borderColor: `${color}50` },
              ]}
            >
              <Text
                style={[s.filterLabel, { color: filter === key ? color : C.textDim }]}
              >
                {label}
              </Text>
              <View style={[s.filterBadge, { backgroundColor: `${color}20` }]}>
                <Text style={[s.filterCount, { color }]}>{count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading && !subjectStats.length ? (
          <View style={s.empty}>
            <Text style={s.emptyText}>Fetching attendance data…</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="checkmark-circle-outline" size={32} color={C.textDim} />
            <Text style={s.emptyText}>No subjects in this category</Text>
          </View>
        ) : (
          filtered.map((stat) => (
            <TouchableOpacity key={stat.course} onPress={() => setSelected(stat)} activeOpacity={0.85}>
              <SubjectRow stat={stat} />
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelected(null)}
        />
        {selected && <DetailSheet stat={selected} onClose={() => setSelected(null)} />}
      </Modal>
    </View>
  );
}

const DetailSheet = ({ stat, onClose }: { stat: SubjectStats; onClose: () => void }) => {
  const color =
    stat.status === 'safe' ? C.success : stat.status === 'warning' ? C.warning : C.danger;

  const rows = [
    { label: 'Classes Conducted', value: String(stat.conducted) },
    { label: 'Attended', value: String(stat.attended) },
    { label: 'Absent', value: String(stat.absent) },
    { label: 'OD / ML', value: String(stat.od) },
    { label: 'Semester Total', value: String(stat.semesterTotal) },
    { label: 'Current %', value: `${Math.round(stat.currentPercentage)}%` },
    { label: 'Projected %', value: `${Math.round(stat.projectedFinalPercentage)}%` },
  ];

  return (
    <View style={ds.sheet}>
      <View style={ds.handle} />
      <View style={ds.sheetHeader}>
        <View>
          <Text style={ds.sheetTitle} numberOfLines={2}>{stat.title}</Text>
          <Text style={ds.sheetCode}>{stat.course}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={ds.closeBtn}>
          <Ionicons name="close" size={18} color={C.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={[ds.bigPct, { backgroundColor: `${color}10`, borderColor: `${color}30` }]}>
        <Text style={[ds.pctVal, { color }]}>{Math.round(stat.percentage)}%</Text>
        <Text style={ds.pctSub}>Semester Projection</Text>
      </View>

      <View style={[ds.bunkBox, stat.status === 'safe' ? ds.bunkSafe : ds.bunkDanger]}>
        <Ionicons
          name={stat.status === 'safe' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
          size={20}
          color={color}
        />
        <View>
          <Text style={[ds.bunkTitle, { color }]}>
            {stat.status === 'safe'
              ? `Can skip ${stat.canBunk} more class${stat.canBunk !== 1 ? 'es' : ''}`
              : `Must attend ${stat.mustAttend} more class${stat.mustAttend !== 1 ? 'es' : ''}`}
          </Text>
          <Text style={ds.bunkSub}>to maintain 75% attendance</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {rows.map(({ label, value }) => (
          <View key={label} style={ds.row}>
            <Text style={ds.rowLabel}>{label}</Text>
            <Text style={ds.rowValue}>{value}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const ds = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 12,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  sheetTitle: { fontSize: 18, fontWeight: '900', color: C.text, maxWidth: '80%' },
  sheetCode: { fontSize: 12, color: C.textMuted, marginTop: 3 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: C.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigPct: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
  },
  pctVal: { fontSize: 40, fontWeight: '900' },
  pctSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  bunkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 18,
  },
  bunkSafe: { backgroundColor: 'rgba(52,211,153,0.08)', borderColor: 'rgba(52,211,153,0.25)' },
  bunkDanger: { backgroundColor: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.25)' },
  bunkTitle: { fontSize: 14, fontWeight: '800' },
  bunkSub: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  rowLabel: { fontSize: 13, color: C.textMuted },
  rowValue: { fontSize: 13, color: C.text, fontWeight: '700' },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 20,
  },
  header: { marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: C.text },
  sub: { fontSize: 12, color: C.textDim, marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: C.surface,
  },
  filterLabel: { fontSize: 12, fontWeight: '700' },
  filterBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  filterCount: { fontSize: 10, fontWeight: '800' },
  empty: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 36,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: { fontSize: 13, color: C.textDim, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
});

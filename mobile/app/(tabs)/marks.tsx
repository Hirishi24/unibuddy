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
import { SubjectMark } from '../../types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { C } from '../../constants/colors';

const gradeColor = (grade?: string): string => {
  if (!grade) return C.textDim;
  const g = grade.trim().toUpperCase();
  if (g === 'O') return '#34d399';
  if (g === 'A+') return '#60a5fa';
  if (g === 'A') return '#818cf8';
  if (g === 'B+') return '#fbbf24';
  if (g === 'B') return '#fb923c';
  if (g === 'C') return '#f87171';
  return C.textDim;
};

const gradePoints = (grade?: string): string => {
  if (!grade) return '—';
  const map: Record<string, string> = { O: '10', 'A+': '9', A: '8', 'B+': '7', B: '6', C: '5', F: '0' };
  return map[grade.trim().toUpperCase()] ?? '—';
};

const pct = (val?: number | null, max?: number): string => {
  if (val == null || !max) return '—';
  return `${Math.round((val / max) * 100)}%`;
};

const fmt = (val?: number | null): string => (val == null ? '—' : String(val));

const ScoreChip = ({ label, value, max, color }: { label: string; value?: number | null; max?: number; color: string }) => (
  <View style={[chip.box, { borderColor: `${color}30`, backgroundColor: `${color}0d` }]}>
    <Text style={[chip.val, { color }]}>{fmt(value)}</Text>
    <Text style={chip.max}>/{max ?? '—'}</Text>
    <Text style={chip.label}>{label}</Text>
  </View>
);

const chip = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 1,
  },
  val: { fontSize: 18, fontWeight: '900' },
  max: { fontSize: 10, color: C.textDim, fontWeight: '600' },
  label: { fontSize: 9, color: C.textMuted, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
});

const MarkRow = ({ mark, onPress }: { mark: SubjectMark; onPress: () => void }) => {
  const gc = gradeColor(mark.grade);
  const totalPct = mark.total != null && mark.totalMax ? (mark.total / mark.totalMax) * 100 : 0;

  return (
    <TouchableOpacity onPress={onPress} style={mr.card} activeOpacity={0.85}>
      <View style={mr.left}>
        <Text style={mr.title} numberOfLines={1}>{mark.courseTitle}</Text>
        <Text style={mr.code}>{mark.courseCode}</Text>
        <View style={mr.barTrack}>
          <View style={[mr.barFill, { width: `${Math.min(totalPct, 100)}%`, backgroundColor: gc }]} />
        </View>
      </View>
      <View style={mr.right}>
        {mark.grade ? (
          <View style={[mr.gradeBadge, { backgroundColor: `${gc}1a`, borderColor: `${gc}40` }]}>
            <Text style={[mr.gradeText, { color: gc }]}>{mark.grade}</Text>
          </View>
        ) : null}
        <Text style={mr.totalText}>
          {fmt(mark.total)}<Text style={mr.totalMax}>/{mark.totalMax ?? '—'}</Text>
        </Text>
        <Ionicons name="chevron-forward" size={14} color={C.textDim} style={{ marginTop: 2 }} />
      </View>
    </TouchableOpacity>
  );
};

const mr = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 12,
  },
  left: { flex: 1, gap: 4 },
  title: { fontSize: 14, fontWeight: '800', color: C.text },
  code: { fontSize: 11, color: C.textMuted, fontWeight: '600' },
  barTrack: { height: 3, borderRadius: 2, backgroundColor: C.surfaceHigh, marginTop: 6, overflow: 'hidden' },
  barFill: { height: 3, borderRadius: 2 },
  right: { alignItems: 'center', gap: 4 },
  gradeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  gradeText: { fontSize: 14, fontWeight: '900' },
  totalText: { fontSize: 12, fontWeight: '800', color: C.text },
  totalMax: { fontSize: 10, color: C.textDim, fontWeight: '500' },
});

const DetailSheet = ({ mark, onClose }: { mark: SubjectMark; onClose: () => void }) => {
  const gc = gradeColor(mark.grade);
  const gp = gradePoints(mark.grade);

  return (
    <View style={ds.sheet}>
      <View style={ds.handle} />
      <View style={ds.sheetHeader}>
        <View style={{ flex: 1 }}>
          <Text style={ds.title} numberOfLines={2}>{mark.courseTitle}</Text>
          <Text style={ds.code}>{mark.courseCode}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={ds.closeBtn}>
          <Ionicons name="close" size={18} color={C.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={ds.gradeRow}>
        <View style={[ds.gradeBox, { backgroundColor: `${gc}10`, borderColor: `${gc}30` }]}>
          <Text style={[ds.gradeVal, { color: gc }]}>{mark.grade ?? '—'}</Text>
          <Text style={ds.gradeSub}>Grade</Text>
        </View>
        <View style={[ds.gradeBox, { backgroundColor: `${gc}10`, borderColor: `${gc}30` }]}>
          <Text style={[ds.gradeVal, { color: gc }]}>{gp}</Text>
          <Text style={ds.gradeSub}>Grade Point</Text>
        </View>
        <View style={[ds.gradeBox, { backgroundColor: `${gc}10`, borderColor: `${gc}30` }]}>
          <Text style={[ds.gradeVal, { color: gc }]}>{pct(mark.total, mark.totalMax)}</Text>
          <Text style={ds.gradeSub}>Percentage</Text>
        </View>
      </View>

      <Text style={ds.sectionLabel}>COMPONENT BREAKDOWN</Text>
      <View style={ds.chipRow}>
        <ScoreChip label="CA1" value={mark.ca1} max={mark.ca1Max} color={C.theory} />
        <ScoreChip label="CA2" value={mark.ca2} max={mark.ca2Max} color={C.lab} />
        <ScoreChip label="CAE" value={mark.cae} max={mark.caeMax} color={C.primary} />
        {mark.assignmentMax ? (
          <ScoreChip label="ASSIGN" value={mark.assignment} max={mark.assignmentMax} color={C.warning} />
        ) : null}
      </View>

      <Text style={ds.sectionLabel}>TOTALS</Text>
      <View style={ds.totalRow}>
        <View style={ds.totalBox}>
          <Text style={ds.totalVal}>{fmt(mark.total)}</Text>
          <Text style={ds.totalSub}>Scored out of {mark.totalMax ?? '—'}</Text>
        </View>
        <View style={[ds.totalBar]}>
          <View
            style={[
              ds.totalBarFill,
              {
                width: `${mark.total != null && mark.totalMax ? Math.min((mark.total / mark.totalMax) * 100, 100) : 0}%`,
                backgroundColor: gc,
              },
            ]}
          />
        </View>
      </View>
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
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    paddingTop: 12,
  },
  handle: { width: 40, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 12 },
  title: { fontSize: 18, fontWeight: '900', color: C.text },
  code: { fontSize: 12, color: C.textMuted, marginTop: 3 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: C.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  gradeRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  gradeBox: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: 18, borderWidth: 1,
  },
  gradeVal: { fontSize: 26, fontWeight: '900' },
  gradeSub: { fontSize: 10, color: C.textMuted, marginTop: 3, fontWeight: '600' },
  sectionLabel: {
    fontSize: 10, fontWeight: '800', color: C.textDim, letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 10,
  },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  totalRow: { gap: 10 },
  totalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  totalVal: { fontSize: 28, fontWeight: '900', color: C.text },
  totalSub: { fontSize: 12, color: C.textMuted },
  totalBar: {
    height: 8, borderRadius: 4, backgroundColor: C.surfaceHigh, overflow: 'hidden',
  },
  totalBarFill: { height: 8, borderRadius: 4 },
});

export default function MarksScreen() {
  const { data, isLoading } = useData();
  const [selected, setSelected] = useState<SubjectMark | null>(null);

  const marks: SubjectMark[] = useMemo(() => data?.marks ?? [], [data]);

  const cgpa = data?.profile?.cgpa;

  return (
    <View style={s.root}>
      <ScreenHeader title="Marks" />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {cgpa ? (
          <View style={s.cgpaCard}>
            <View>
              <Text style={s.cgpaLabel}>CGPA</Text>
              <Text style={s.cgpaVal}>{cgpa}</Text>
            </View>
            <View style={s.cgpaDivider} />
            <View>
              <Text style={s.cgpaLabel}>GRADE</Text>
              <Text style={[s.cgpaVal, { color: gradeColor(Number(cgpa) >= 9 ? 'O' : Number(cgpa) >= 8 ? 'A+' : 'A') }]}>
                {Number(cgpa) >= 9 ? 'O' : Number(cgpa) >= 8 ? 'A+' : Number(cgpa) >= 7 ? 'A' : 'B+'}
              </Text>
            </View>
            <View style={s.cgpaDivider} />
            <View>
              <Text style={s.cgpaLabel}>SEMESTER</Text>
              <Text style={s.cgpaVal}>{data?.profile?.semester?.replace('Semester ', 'S') ?? '—'}</Text>
            </View>
          </View>
        ) : null}

        {isLoading && !marks.length ? (
          <View style={s.empty}>
            <Ionicons name="hourglass-outline" size={32} color={C.textDim} />
            <Text style={s.emptyText}>Loading marks data…</Text>
          </View>
        ) : marks.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="document-text-outline" size={32} color={C.textDim} />
            <Text style={s.emptyTitle}>No marks data</Text>
            <Text style={s.emptyText}>Marks may not be published yet or portal is unavailable.</Text>
            <Text style={s.emptyText}>Refresh on the Home screen to try again.</Text>
          </View>
        ) : (
          marks.map((mark) => (
            <MarkRow key={mark.courseCode} mark={mark} onPress={() => setSelected(mark)} />
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setSelected(null)} />
        {selected && <DetailSheet mark={selected} onClose={() => setSelected(null)} />}
      </Modal>
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
  header: { marginBottom: 18 },
  title: { fontSize: 26, fontWeight: '900', color: C.text },
  sub: { fontSize: 12, color: C.textDim, marginTop: 2 },
  cgpaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    marginBottom: 20,
  },
  cgpaLabel: { fontSize: 9, color: C.textDim, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  cgpaVal: { fontSize: 24, fontWeight: '900', color: C.text },
  cgpaDivider: { width: 1, height: 40, backgroundColor: C.border },
  empty: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 40,
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: C.textMuted },
  emptyText: { fontSize: 13, color: C.textDim, fontWeight: '500', textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
});

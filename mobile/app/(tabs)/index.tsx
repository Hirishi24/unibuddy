import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { OngoingBanner } from '../../components/OngoingBanner';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useDynamicIsland } from '../../context/DynamicIslandContext';
import { C } from '../../constants/colors';

const SAF_TARGET = 75;

export default function HomeScreen() {
  const { profile, isGuest } = useAuth();
  const { subjectStats, isFetching, fetchData, getBlocksForSelectedDay, isLoading } = useData();
  const { notify } = useDynamicIsland();
  const hasNotifiedLoad = useRef(false);
  const wasRefreshing = useRef(false);

  const todayBlocks = useMemo(() => getBlocksForSelectedDay(new Date()), [getBlocksForSelectedDay]);

  const overallStats = useMemo(() => {
    if (!subjectStats.length) return null;
    const active = subjectStats.filter((s) => s.semesterTotal > 0);
    if (!active.length) return null;
    const totalAttended = active.reduce((a, s) => a + s.attended, 0);
    const totalConducted = active.reduce((a, s) => a + s.conducted, 0);
    const pct = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 0;
    const safe = active.filter((s) => s.status === 'safe').length;
    const danger = active.filter((s) => s.status === 'danger').length;
    const warning = active.filter((s) => s.status === 'warning').length;
    const worstSub = active.reduce((p, c) => (c.percentage < p.percentage ? c : p));
    return { pct, safe, danger, warning, worstSub, total: active.length };
  }, [subjectStats]);

  useEffect(() => {
    if (isFetching) { wasRefreshing.current = true; }
    if (!isFetching && wasRefreshing.current) {
      wasRefreshing.current = false;
      notify({ icon: '✅', title: 'Data Synced', message: 'Portal data refreshed successfully', color: C.success });
    }
  }, [isFetching]);

  useEffect(() => {
    if (!overallStats || hasNotifiedLoad.current) return;
    hasNotifiedLoad.current = true;
    const color = overallStats.pct >= 75 ? C.success : overallStats.pct >= 65 ? C.warning : C.danger;
    const emoji = overallStats.pct >= 75 ? '🎯' : overallStats.pct >= 65 ? '⚠️' : '🚨';
    setTimeout(() => {
      notify({
        icon: emoji,
        title: `${Math.round(overallStats.pct)}% Attendance`,
        message: `${overallStats.safe} safe · ${overallStats.danger} at risk`,
        color,
      });
    }, 600);
  }, [overallStats]);

  const safetyColor =
    !overallStats
      ? C.textDim
      : overallStats.pct >= 75
      ? C.success
      : overallStats.pct >= 65
      ? C.warning
      : C.danger;

  return (
    <View style={s.root}>
      <ScreenHeader
        title="Unibuddy"
        left={
          <View>
            <Text style={s.greeting}>{isGuest ? 'Demo' : 'Hello,'}</Text>
            <Text style={s.name} numberOfLines={1}>
              {profile?.name?.split(' ')[0] || 'Student'}
            </Text>
          </View>
        }
        right={
          <View style={s.headerRight}>
            {isGuest && (
              <View style={s.guestBadge}>
                <Text style={s.guestText}>DEMO</Text>
              </View>
            )}
            <View style={s.avatarCircle}>
              <Ionicons name="person" size={20} color={C.primary} />
            </View>
          </View>
        }
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={fetchData}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
      >
        {overallStats && (
          <View style={[s.safetyCard, { borderColor: `${safetyColor}30` }]}>
            <View style={s.safetyLeft}>
              <Text style={s.safetyLabel}>Overall Attendance</Text>
              <Text style={[s.safetyPct, { color: safetyColor }]}>
                {Math.round(overallStats.pct)}%
              </Text>
              <View style={s.safetyMeta}>
                <StatusDot color={C.success} label={`${overallStats.safe} safe`} />
                {overallStats.warning > 0 && (
                  <StatusDot color={C.warning} label={`${overallStats.warning} warning`} />
                )}
                {overallStats.danger > 0 && (
                  <StatusDot color={C.danger} label={`${overallStats.danger} at risk`} />
                )}
              </View>
            </View>
            <View style={s.gaugeWrap}>
              <CircleGauge pct={overallStats.pct} color={safetyColor} />
            </View>
          </View>
        )}

        {todayBlocks.length > 0 && (
          <OngoingBanner blocks={todayBlocks} selectedDate={new Date()} />
        )}

        {overallStats?.danger > 0 && (
          <View style={s.alertCard}>
            <Ionicons name="warning-outline" size={16} color={C.danger} />
            <View style={s.alertInfo}>
              <Text style={s.alertTitle}>Attendance Alert</Text>
              <Text style={s.alertSub}>
                {overallStats.worstSub.course}: {Math.round(overallStats.worstSub.percentage)}% —{' '}
                {overallStats.worstSub.mustAttend > 0
                  ? `Attend ${overallStats.worstSub.mustAttend} more classes`
                  : 'Below 75%'}
              </Text>
            </View>
          </View>
        )}

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Subject Overview</Text>
          <Text style={s.sectionSub}>{subjectStats.length} courses</Text>
        </View>

        {isLoading && !subjectStats.length ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>Loading attendance data…</Text>
          </View>
        ) : subjectStats.length === 0 ? (
          <View style={s.emptyCard}>
            <Ionicons name="cloud-download-outline" size={30} color={C.textDim} />
            <Text style={s.emptyText}>Pull down to fetch your portal data</Text>
          </View>
        ) : (
          subjectStats.map((stat) => {
            const color =
              stat.status === 'safe' ? C.success : stat.status === 'warning' ? C.warning : C.danger;
            return (
              <View key={stat.course} style={[s.miniCard, { borderColor: `${color}22` }]}>
                <View style={[s.miniAccent, { backgroundColor: color }]} />
                <View style={s.miniInfo}>
                  <Text style={s.miniTitle} numberOfLines={1}>{stat.title}</Text>
                  <Text style={s.miniCode}>{stat.course}</Text>
                </View>
                <View style={s.miniRight}>
                  <Text style={[s.miniPct, { color }]}>{Math.round(stat.percentage)}%</Text>
                  <Text style={s.miniSub}>
                    {stat.status === 'safe'
                      ? `Bunk: ${stat.canBunk}`
                      : `Need: ${stat.mustAttend}`}
                  </Text>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const StatusDot = ({ color, label }: { color: string; label: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
    <Text style={{ fontSize: 10, color: C.textMuted, fontWeight: '600' }}>{label}</Text>
  </View>
);

const CircleGauge = ({ pct, color }: { pct: number; color: string }) => (
  <View style={g.wrap}>
    <View style={[g.ring, { borderColor: `${color}25` }]}>
      <View style={[g.fillBar, { backgroundColor: `${color}20` }]} />
    </View>
    <View style={g.center}>
      <Text style={[g.val, { color }]}>{Math.round(pct)}</Text>
      <Text style={g.unit}>%</Text>
    </View>
  </View>
);

const g = StyleSheet.create({
  wrap: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', inset: 0, borderRadius: 38, borderWidth: 3 },
  fillBar: { flex: 1, borderRadius: 38 },
  center: { alignItems: 'center' },
  val: { fontSize: 22, fontWeight: '900' },
  unit: { fontSize: 10, color: C.textMuted, marginTop: -2 },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 13, color: C.textMuted, fontWeight: '600' },
  name: { fontSize: 26, fontWeight: '900', color: C.text, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  guestBadge: {
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  guestText: { fontSize: 9, fontWeight: '900', color: C.warning },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyCard: {
    backgroundColor: C.surface,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  safetyLeft: { flex: 1 },
  safetyLabel: { fontSize: 11, color: C.textMuted, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  safetyPct: { fontSize: 36, fontWeight: '900', marginBottom: 8 },
  safetyMeta: { gap: 5 },
  gaugeWrap: { marginLeft: 12 },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(248,113,113,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.2)',
    padding: 14,
    marginBottom: 14,
  },
  alertInfo: { flex: 1 },
  alertTitle: { fontSize: 13, fontWeight: '800', color: C.danger, marginBottom: 3 },
  alertSub: { fontSize: 11, color: C.textMuted },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.text },
  sectionSub: { fontSize: 11, color: C.textDim },
  miniCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  miniAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  miniInfo: { flex: 1, paddingLeft: 6 },
  miniTitle: { fontSize: 13, fontWeight: '800', color: C.text, marginBottom: 2 },
  miniCode: { fontSize: 10, color: C.textMuted },
  miniRight: { alignItems: 'flex-end' },
  miniPct: { fontSize: 18, fontWeight: '900' },
  miniSub: { fontSize: 10, color: C.textDim },
  emptyCard: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
    padding: 36,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: { fontSize: 13, color: C.textDim, textAlign: 'center', fontWeight: '600' },
});

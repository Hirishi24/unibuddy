import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { C } from '../../constants/colors';

export default function ProfileScreen() {
  const { profile, logout, isGuest, session } = useAuth();
  const { data, resetAttendance, fetchData, isFetching } = useData();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          resetAttendance();
          await logout();
        },
      },
    ]);
  };

  const handleReset = () => {
    Alert.alert('Reset Attendance', 'This will clear all locally marked attendance. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetAttendance },
    ]);
  };

  const stats = data
    ? {
        subjects: data.attendance?.length || 0,
        source: data.source || 'Unknown',
        lastUpdated: data.lastUpdated
          ? new Date(data.lastUpdated).toLocaleString()
          : 'Never',
      }
    : null;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <Text style={s.title}>Profile</Text>

      <View style={s.profileCard}>
        <View style={s.avatar}>
          <Text style={s.avatarLetter}>
            {(profile?.name || 'G')[0].toUpperCase()}
          </Text>
        </View>
        <View style={s.profileInfo}>
          <Text style={s.profileName} numberOfLines={1}>
            {profile?.name || 'Student'}
          </Text>
          <Text style={s.profileReg}>{profile?.regNo || '—'}</Text>
          {isGuest && (
            <View style={s.guestBadge}>
              <Text style={s.guestText}>GUEST / DEMO MODE</Text>
            </View>
          )}
        </View>
      </View>

      {profile && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>Academic Info</Text>
          {[
            { icon: 'school-outline', label: 'Program', value: profile.program },
            { icon: 'layers-outline', label: 'Semester', value: profile.semester },
            { icon: 'people-outline', label: 'Section', value: profile.section },
            { icon: 'star-outline', label: 'CGPA', value: profile.cgpa },
          ].filter((r) => r.value).map(({ icon, label, value }) => (
            <View key={label} style={s.infoRow}>
              <View style={s.infoIconWrap}>
                <Ionicons name={icon as any} size={15} color={C.primary} />
              </View>
              <View style={s.infoText}>
                <Text style={s.infoLabel}>{label}</Text>
                <Text style={s.infoValue}>{value}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {stats && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>Data Status</Text>
          {[
            { label: 'Data Source', value: stats.source },
            { label: 'Subjects Loaded', value: String(stats.subjects) },
            { label: 'Last Updated', value: stats.lastUpdated },
          ].map(({ label, value }) => (
            <View key={label} style={s.infoRow}>
              <View style={s.infoText}>
                <Text style={s.infoLabel}>{label}</Text>
                <Text style={s.infoValue}>{value}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={s.section}>
        <Text style={s.sectionLabel}>Actions</Text>

        {!isGuest && (
          <TouchableOpacity
            style={s.actionBtn}
            onPress={fetchData}
            disabled={isFetching}
          >
            <View style={[s.actionIconWrap, { backgroundColor: 'rgba(99,102,241,0.12)' }]}>
              <Ionicons name="refresh-outline" size={18} color={C.primary} />
            </View>
            <Text style={s.actionText}>{isFetching ? 'Fetching…' : 'Refresh Portal Data'}</Text>
            <Ionicons name="chevron-forward" size={14} color={C.textDim} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.actionBtn} onPress={handleReset}>
          <View style={[s.actionIconWrap, { backgroundColor: 'rgba(251,191,36,0.12)' }]}>
            <Ionicons name="trash-outline" size={18} color={C.warning} />
          </View>
          <Text style={s.actionText}>Reset Marked Attendance</Text>
          <Ionicons name="chevron-forward" size={14} color={C.textDim} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.actionBtn, s.logoutBtn]}
          onPress={handleLogout}
        >
          <View style={[s.actionIconWrap, { backgroundColor: 'rgba(248,113,113,0.12)' }]}>
            <Ionicons name="log-out-outline" size={18} color={C.danger} />
          </View>
          <Text style={[s.actionText, { color: C.danger }]}>
            {isGuest ? 'Exit Guest Mode' : 'Logout'}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={C.danger} />
        </TouchableOpacity>
      </View>

      <View style={s.footer}>
        <Text style={s.footerText}>Unibuddy v1.0</Text>
        <Text style={s.footerSub}>SRMAP Attendance Intelligence Platform</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 0) + 16,
    paddingBottom: 40,
  },
  title: { fontSize: 26, fontWeight: '900', color: C.text, marginBottom: 20 },
  profileCard: {
    backgroundColor: C.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(99,102,241,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(99,102,241,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 24, fontWeight: '900', color: C.primaryLight },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '900', color: C.text, marginBottom: 4 },
  profileReg: { fontSize: 12, color: C.textMuted, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  guestBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  guestText: { fontSize: 9, fontWeight: '900', color: C.warning, letterSpacing: 0.5 },
  section: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: C.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(99,102,241,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 10, color: C.textDim, fontWeight: '700', marginBottom: 1 },
  infoValue: { fontSize: 13, color: C.text, fontWeight: '700' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { flex: 1, fontSize: 14, fontWeight: '700', color: C.text },
  logoutBtn: { borderBottomWidth: 0 },
  footer: { alignItems: 'center', marginTop: 20, gap: 4 },
  footerText: { fontSize: 12, color: C.textDim, fontWeight: '700' },
  footerSub: { fontSize: 10, color: C.textDim },
});

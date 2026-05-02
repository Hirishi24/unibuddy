import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClassBlock } from '../types';
import { C } from '../constants/colors';
import { isBlockCancelled } from '../lib/academicCalendar';

interface Props {
  block: ClassBlock;
  status: 'present' | 'absent' | null;
  onMarkPresent: () => void;
  onMarkAbsent: () => void;
  selectedDate: Date;
}

const canMark = (selectedDate: Date, endTime: string): boolean => {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selDay = new Date(selectedDate);
  selDay.setHours(0, 0, 0, 0);
  if (selDay < today) return true;
  if (selDay.getTime() === today.getTime()) {
    const [h] = endTime.split(':').map(Number);
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= 50);
  }
  return false;
};

const getEndDisplay = (endTime: string): string => {
  const [h] = endTime.split(':');
  return `${h.padStart(2, '0')}:50`;
};

export const ClassCard = ({ block, status, onMarkPresent, onMarkAbsent, selectedDate }: Props) => {
  const cancellation = isBlockCancelled(selectedDate);
  const locked = !cancellation && !canMark(selectedDate, block.endTime);

  const accentColor = block.isLab ? C.lab : C.theory;
  const borderColor =
    status === 'present'
      ? 'rgba(52,211,153,0.4)'
      : status === 'absent'
      ? 'rgba(248,113,113,0.4)'
      : C.border;
  const bgColor =
    status === 'present'
      ? 'rgba(52,211,153,0.07)'
      : status === 'absent'
      ? 'rgba(248,113,113,0.07)'
      : C.surface;

  return (
    <View style={[s.card, { backgroundColor: bgColor, borderColor }]}>
      <View style={[s.accent, { backgroundColor: accentColor }]} />

      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.courseTitle} numberOfLines={1}>
            {block.courseTitle}
          </Text>
          <View style={s.metaRow}>
            <View style={[s.codeBadge, { backgroundColor: `${accentColor}18` }]}>
              <Text style={[s.codeText, { color: accentColor }]}>{block.course}</Text>
            </View>
            <View style={[s.typeBadge, { backgroundColor: block.isLab ? 'rgba(167,139,250,0.15)' : 'rgba(96,165,250,0.15)' }]}>
              <Text style={[s.typeText, { color: block.isLab ? C.lab : C.theory }]}>
                {block.isLab ? 'LAB' : 'THEORY'}
              </Text>
            </View>
          </View>
          <View style={s.detailsRow}>
            <View style={s.detailItem}>
              <Ionicons name="time-outline" size={11} color={C.theory} />
              <Text style={s.detailText}>
                {block.startTime} – {getEndDisplay(block.endTime)}
              </Text>
            </View>
            <View style={s.detailItem}>
              <Ionicons name="location-outline" size={11} color={C.success} />
              <Text style={s.detailText}>{block.room}</Text>
            </View>
            {block.faculty && block.faculty !== 'TBA' && (
              <View style={s.detailItem}>
                <Ionicons name="person-outline" size={11} color={C.lab} />
                <Text style={s.detailText}>{block.faculty}</Text>
              </View>
            )}
          </View>
        </View>

        {status && (
          <View
            style={[
              s.statusBadge,
              {
                backgroundColor:
                  status === 'present' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)',
                borderColor: status === 'present' ? C.success : C.danger,
              },
            ]}
          >
            <Text
              style={[s.statusText, { color: status === 'present' ? C.success : C.danger }]}
            >
              {status.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {cancellation ? (
        <View style={s.cancelledBox}>
          <Ionicons name="ban-outline" size={13} color={C.danger} />
          <Text style={s.cancelledText}>CANCELLED: {cancellation}</Text>
        </View>
      ) : locked ? (
        <View style={s.lockedBox}>
          <Ionicons name="lock-closed-outline" size={13} color={C.textDim} />
          <Text style={s.lockedText}>
            {(() => {
              const [h] = block.endTime.split(':');
              return `Unlocks @ ${h}:50`;
            })()}
          </Text>
        </View>
      ) : (
        <View style={s.actions}>
          <TouchableOpacity
            onPress={onMarkPresent}
            style={[
              s.actionBtn,
              status === 'present'
                ? { backgroundColor: 'rgba(52,211,153,0.25)', borderColor: C.success }
                : { backgroundColor: C.surfaceHigh, borderColor: C.border },
            ]}
            activeOpacity={0.75}
          >
            <Ionicons
              name="checkmark"
              size={17}
              color={status === 'present' ? C.success : C.textMuted}
            />
            <Text
              style={[s.actionText, { color: status === 'present' ? C.success : C.textMuted }]}
            >
              PRESENT
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onMarkAbsent}
            style={[
              s.actionBtn,
              status === 'absent'
                ? { backgroundColor: 'rgba(248,113,113,0.25)', borderColor: C.danger }
                : { backgroundColor: C.surfaceHigh, borderColor: C.border },
            ]}
            activeOpacity={0.75}
          >
            <Ionicons
              name="close"
              size={17}
              color={status === 'absent' ? C.danger : C.textMuted}
            />
            <Text
              style={[s.actionText, { color: status === 'absent' ? C.danger : C.textMuted }]}
            >
              ABSENT
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  headerLeft: { flex: 1, paddingLeft: 4 },
  courseTitle: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 6 },
  metaRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  codeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  codeText: { fontSize: 11, fontWeight: '700' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  detailsRow: { gap: 5 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailText: { fontSize: 11, color: C.textMuted, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionText: { fontSize: 12, fontWeight: '800' },
  cancelledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(248,113,113,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.2)',
  },
  cancelledText: { fontSize: 11, color: C.danger, fontWeight: '700' },
  lockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: C.surfaceHigh,
    borderWidth: 1,
    borderColor: C.border,
  },
  lockedText: { fontSize: 11, color: C.textDim, fontWeight: '600' },
});

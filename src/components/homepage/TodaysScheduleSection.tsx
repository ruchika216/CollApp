import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import Icon from '../common/Icon';
import { Meeting } from '../../types';

interface Props {
  items: Meeting[];
  shadows?: any;
}

const TodaysScheduleSection: React.FC<Props> = ({ items, shadows }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrapper]}>
      <Text style={[styles.title, { color: colors.text }]}>Today</Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
          shadows?.sm,
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {items.length === 0 ? (
            <View style={styles.empty}>
              <Icon
                name="calendar"
                size={18}
                tintColor={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No meetings today
              </Text>
            </View>
          ) : (
            items.map((m, idx) => {
              const time = new Date(
                m.startTime || m.date || Date.now(),
              ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <View key={m.id || String(idx)} style={styles.row}>
                  <Text style={[styles.time, { color: colors.textSecondary }]}>
                    {time}
                  </Text>
                  <View style={styles.timeline}>
                    <View
                      style={[styles.dot, { backgroundColor: colors.primary }]}
                    />
                    {idx !== items.length - 1 && (
                      <View
                        style={[
                          styles.line,
                          { backgroundColor: colors.border },
                        ]}
                      />
                    )}
                  </View>
                  <View
                    style={[
                      styles.meeting,
                      {
                        backgroundColor: (colors.primary + '10') as any,
                        borderColor: (colors.primary + '33') as any,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.meetingTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {m.title || 'Meeting'}
                    </Text>
                    {m.agenda ? (
                      <Text
                        style={[
                          styles.meetingAgenda,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {m.agenda}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16, paddingHorizontal: 20 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    marginHorizontal: 0,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  scrollContent: { paddingBottom: 4, maxHeight: 220 },
  empty: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: { fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  time: { width: 56, fontSize: 12, marginTop: 2 },
  timeline: { width: 20, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  line: { width: 2, flex: 1, marginTop: 4, opacity: 0.5 },
  meeting: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  meetingTitle: { fontSize: 14, fontWeight: '600' },
  meetingAgenda: { fontSize: 12, marginTop: 2 },
});

export default TodaysScheduleSection;

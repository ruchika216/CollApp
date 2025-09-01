import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import Icon from '../common/Icon';
import MeetingCard from '../meetings/MeetingCard';

interface Props {
  nextMeetings: any[];
  navigation: any;
  shadows?: any;
}

const UpcomingMeetingsSection: React.FC<Props> = ({
  nextMeetings,
  navigation,
  shadows,
}) => {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface }, shadows?.md]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Icon name="time" size={24} color={colors.warning} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Upcoming Meetings
          </Text>
        </View>
        <TouchableOpacity
          style={styles.allTasksButton}
          onPress={() => navigation.navigate('MeetingScreen')}
        >
          <Text style={[styles.allTasksText, { color: colors.primary }]}>
            View All
          </Text>
          <Icon name="arrow-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {nextMeetings.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="time" size={32} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No upcoming meetings
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.meetingsScroll}
          contentContainerStyle={styles.meetingsContainer}
        >
          {nextMeetings.map(meeting => (
            <View key={meeting.id} style={styles.meetingCardWrapper}>
              <MeetingCard
                meeting={meeting}
                showCountdown
                compact
                onPress={() => navigation.navigate('MeetingScreen')}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '600', marginLeft: 12 },
  allTasksButton: { flexDirection: 'row', alignItems: 'center' },
  allTasksText: { fontSize: 14, fontWeight: '600', marginRight: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 20 },
  emptyText: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  meetingsScroll: { paddingBottom: 8 },
  meetingsContainer: { paddingHorizontal: 4 },
  meetingCardWrapper: { width: 280, marginRight: 16 },
});

export default UpcomingMeetingsSection;

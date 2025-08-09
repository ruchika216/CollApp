import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useAppSelector } from '../store/hooks';
import Icon from '../components/common/Icon';

interface ChatScreenProps {
  navigation: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const user = useAppSelector(state => state.auth.user);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Coming Soon Section */}
        <View style={[styles.comingSoonCard, { backgroundColor: colors.surface }]}>
          <Icon name="message" size={64} color={colors.primary} />
          <Text style={[styles.comingSoonTitle, { color: colors.text }]}>
            Chat Feature Coming Soon
          </Text>
          <Text style={[styles.comingSoonDescription, { color: colors.textSecondary }]}>
            Real-time messaging between team members will be available in the next update.
          </Text>
          
          {/* Placeholder Features */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Icon name="check" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Group project discussions
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Direct messages with team members
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                File and image sharing
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Project-specific chat rooms
              </Text>
            </View>
          </View>
        </View>

        {/* Current Communication */}
        <View style={[styles.currentCommCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Current Communication Options
          </Text>
          
          <TouchableOpacity
            style={[styles.optionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Projects')}
          >
            <Icon name="message" size={20} color="#fff" />
            <Text style={styles.optionButtonText}>
              Use Project Comments
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
            You can communicate with team members using the comment system in each project.
          </Text>
        </View>

        {/* Notifications Alternative */}
        <TouchableOpacity
          style={[styles.notificationCard, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('NotificationScreen')}
        >
          <View style={styles.notificationContent}>
            <Icon name="notification" size={24} color={colors.primary} />
            <View style={styles.notificationText}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>
                Check Notifications
              </Text>
              <Text style={[styles.notificationSubtitle, { color: colors.textSecondary }]}>
                Stay updated with project activities and mentions
              </Text>
            </View>
            <Icon name="arrow-right" size={16} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  comingSoonCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  featuresList: {
    width: '100%',
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  currentCommCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  notificationCard: {
    padding: 20,
    borderRadius: 16,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
    marginLeft: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationSubtitle: {
    fontSize: 14,
  },
});

export default ChatScreen;
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useAppSelector } from '../store/hooks';
import Icon from '../components/common/Icon';
import Card from '../components/ui/Card';
import ScreenLayout from '../components/layout/ScreenLayout';
import { spacing, borderRadius } from '../constants/spacing';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const user = useAppSelector(state => state.user.user);
  const projects = useAppSelector(state => state.projects.projects);
  const notifications = useAppSelector(state => state.notifications.notifications);

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const userProjects = user?.role === 'admin' 
    ? projects 
    : projects.filter(p => p.assignedTo === user?.uid);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const QuickActionCard = ({ title, subtitle, icon, color, onPress }: any) => (
    <Card
      variant="elevated"
      style={[styles.quickActionCard, { width: (width - 60) / 2 }]}
      onPress={onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}20` }]}>
        <Icon name={icon} size={24} tintColor={color} />
      </View>
      <Text style={[styles.quickActionTitle, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.quickActionSubtitle, { color: colors.textSecondary }]}>
        {subtitle}
      </Text>
    </Card>
  );

  const StatCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.statCard, { backgroundColor: `${color}10` }]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Icon name={icon} size={20} tintColor={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
      </View>
    </View>
  );

  const headerLeftComponent = (
    <View style={styles.greetingContainer}>
      <Text style={styles.greeting}>{getGreeting()},</Text>
      <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'User'}! 👋</Text>
    </View>
  );

  const headerRightComponent = (
    <TouchableOpacity
      style={styles.notificationButton}
      onPress={() => navigation.navigate('Notifications')}
    >
      <Icon name="notification" size={24} tintColor="#fff" />
      {unreadNotifications > 0 && (
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationBadgeText}>
            {unreadNotifications > 9 ? '9+' : unreadNotifications}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenLayout
      leftComponent={headerLeftComponent}
      rightComponent={headerRightComponent}
      showMenuButton={false}
    >
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Today's Overview
          </Text>
          
          <View style={styles.statsContainer}>
            <StatCard
              title="Projects"
              value={userProjects.length}
              icon="project"
              color={colors.primary}
            />
            <StatCard
              title="Active"
              value={userProjects.filter(p => p.status === 'Development').length}
              icon="dashboard"
              color={colors.success}
            />
            <StatCard
              title="Pending"
              value={userProjects.filter(p => p.status === 'Pending').length}
              icon="time"
              color={colors.warning}
            />
            <StatCard
              title="Completed"
              value={userProjects.filter(p => p.status === 'Done').length}
              icon="check"
              color={colors.info}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="View Projects"
              subtitle="See all projects"
              icon="project"
              color={colors.primary}
              onPress={() => navigation.navigate('Projects')}
            />
            
            <QuickActionCard
              title="Dashboard"
              subtitle="Analytics & insights"
              icon="dashboard"
              color={colors.secondary}
              onPress={() => navigation.navigate('Dashboard')}
            />
            
            <QuickActionCard
              title="Notifications"
              subtitle={`${unreadNotifications} unread`}
              icon="notification"
              color={colors.warning}
              onPress={() => navigation.navigate('Notifications')}
            />
            
            <QuickActionCard
              title="Profile"
              subtitle="Account settings"
              icon="account"
              color={colors.info}
              onPress={() => navigation.navigate('Profile')}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Activity
          </Text>
          
          <Card variant="elevated" style={styles.activityCard}>
            <View style={styles.activityItem}>
              <Icon name="project" size={20} tintColor={colors.primary} />
              <Text style={[styles.activityText, { color: colors.text }]}>
                {userProjects.length} projects in your workspace
              </Text>
            </View>
            
            <View style={styles.activityItem}>
              <Icon name="notification" size={20} tintColor={colors.warning} />
              <Text style={[styles.activityText, { color: colors.text }]}>
                {unreadNotifications} new notifications
              </Text>
            </View>
            
            <View style={styles.activityItem}>
              <Icon name="status" size={20} tintColor={colors.success} />
              <Text style={[styles.activityText, { color: colors.text }]}>
                All systems running smoothly
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: borderRadius.lg,
    width: (width - 52) / 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  quickActionCard: {
    padding: 20,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  activityCard: {
    padding: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  activityText: {
    fontSize: 14,
    flex: 1,
  },
});

export default HomeScreen;
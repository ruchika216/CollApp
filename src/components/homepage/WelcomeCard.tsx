import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import Icon from '../common/Icon';

interface Props {
  shadows?: any;
  greeting: string;
  userName?: string;
}

const WelcomeCard: React.FC<Props> = ({ shadows, greeting, userName }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.card, { backgroundColor: colors.primary }, shadows?.xl]}
    >
      <View style={styles.content}>
        <View style={styles.textCol}>
          <Text style={styles.title}>
            Welcome to CollApp. Start your day and be productive.
          </Text>
          <Text style={styles.subtitle}>
            {greeting}
            {userName ? `, ${userName}!` : '!'}
          </Text>
        </View>
        <View style={styles.iconCol}>
          <View style={styles.iconWrap}>
            <Icon name="dashboard" size="xxl" color="#fff" />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textCol: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  iconCol: { marginLeft: 16 },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WelcomeCard;

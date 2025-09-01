import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';

interface Props {
  approvedUsers: any[];
  shadows?: any;
}

const UsersScrollBar: React.FC<Props> = ({ approvedUsers, shadows }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Team ({approvedUsers.length})
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.usersScroll}
        contentContainerStyle={styles.usersContainer}
      >
        {approvedUsers.map((userItem, index) => (
          <TouchableOpacity
            key={userItem.uid}
            style={[
              styles.avatarContainer,
              index > 0 ? styles.avatarMargin : undefined,
            ]}
          >
            <View style={[styles.avatarWrapper, shadows?.sm]}>
              {userItem.photoURL ? (
                <Image
                  source={{ uri: userItem.photoURL }}
                  style={styles.avatar}
                />
              ) : null}
              {userItem.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            <Text
              style={[styles.userName, { color: colors.text }]}
              numberOfLines={1}
            >
              {userItem.name || userItem.email?.split('@')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  usersScroll: { paddingLeft: 20 },
  usersContainer: { paddingRight: 20 },
  avatarContainer: { alignItems: 'center', width: 70 },
  avatarMargin: { marginLeft: 12 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default UsersScrollBar;

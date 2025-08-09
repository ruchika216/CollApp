import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { User } from '../../types';
import { useTheme } from '../../theme/useTheme';

interface UserApprovalCardProps {
  user: User;
  onApprove: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

const UserApprovalCard: React.FC<UserApprovalCardProps> = ({
  user,
  onApprove,
  onReject,
  isLoading = false
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const handleApprove = () => {
    Alert.alert(
      'Approve User',
      `Are you sure you want to approve ${user.name || user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', style: 'default', onPress: onApprove }
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Reject User',
      `Are you sure you want to reject ${user.name || user.email}? This will delete their account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: onReject }
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRoleBadgeColor = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return '#E53E3E';
      case 'developer':
        return '#38A169';
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          {user.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {getInitials(user.name || user.email || 'U')}
              </Text>
            </View>
          )}
          
          {/* Online Status Indicator */}
          <View style={[
            styles.statusIndicator,
            { backgroundColor: user.isOnline ? theme.colors.success : theme.colors.textSecondary }
          ]} />
        </View>

        <View style={styles.userDetails}>
          <Text style={styles.userName}>
            {user.name || 'No name provided'}
          </Text>
          <Text style={styles.userEmail}>
            {user.email}
          </Text>
          
          {/* Role Badge */}
          <View style={[
            styles.roleBadge,
            { backgroundColor: getRoleBadgeColor(user.role) + '20' }
          ]}>
            <Text style={[
              styles.roleText,
              { color: getRoleBadgeColor(user.role) }
            ]}>
              {user.role?.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Registration Info */}
      <View style={styles.registrationInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Registered:</Text>
          <Text style={styles.infoValue}>
            {formatDate(user.createdAt)}
          </Text>
        </View>
        
        {user.lastSeen && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last seen:</Text>
            <Text style={styles.infoValue}>
              {formatDate(user.lastSeen)}
            </Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Provider:</Text>
          <Text style={styles.infoValue}>
            {user.providerId === 'google.com' ? '🔍 Google' : user.providerId}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.rejectButton, { opacity: isLoading ? 0.5 : 1 }]}
          onPress={handleReject}
          disabled={isLoading}
        >
          <Text style={styles.rejectButtonText}>
            {isLoading ? 'Processing...' : 'Reject'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.approveButton, { opacity: isLoading ? 0.5 : 1 }]}
          onPress={handleApprove}
          disabled={isLoading}
        >
          <Text style={styles.approveButtonText}>
            {isLoading ? 'Processing...' : 'Approve'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pending Badge */}
      <View style={styles.pendingBadge}>
        <Text style={styles.pendingText}>PENDING APPROVAL</Text>
      </View>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.colors.warning + '40',
      position: 'relative',
    },
    userInfo: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 12,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    avatarPlaceholder: {
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: 'white',
      fontSize: 20,
      fontWeight: '600',
    },
    statusIndicator: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    userDetails: {
      flex: 1,
      justifyContent: 'center',
    },
    userName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    roleBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    roleText: {
      fontSize: 10,
      fontWeight: '600',
    },
    registrationInfo: {
      marginBottom: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    infoLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: '400',
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    rejectButton: {
      flex: 1,
      backgroundColor: '#FEE2E2',
      paddingVertical: 10,
      borderRadius: 8,
      marginRight: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#FECACA',
    },
    rejectButtonText: {
      color: '#DC2626',
      fontSize: 14,
      fontWeight: '600',
    },
    approveButton: {
      flex: 1,
      backgroundColor: theme.colors.success,
      paddingVertical: 10,
      borderRadius: 8,
      marginLeft: 8,
      alignItems: 'center',
    },
    approveButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    pendingBadge: {
      position: 'absolute',
      top: -6,
      right: 12,
      backgroundColor: theme.colors.warning,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },
    pendingText: {
      color: 'white',
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });

export default UserApprovalCard;
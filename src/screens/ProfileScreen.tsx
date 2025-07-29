import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setUser } from '../store/slices/userSlice';

const ProfileScreen = () => {
  // Get user details from Redux store
  const { name, email, photoURL, role } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();

  // This function can be called after a successful login
  const onLoginSuccess = userCredential => {
    // Assuming userRole is obtained from somewhere
    const userRole = 'user'; // Replace with actual role fetching logic

    dispatch(
      setUser({
        uid: userCredential.user.uid,
        name: userCredential.user.displayName,
        email: userCredential.user.email,
        photoURL: userCredential.user.photoURL,
        role: userRole,
      }),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {name ? name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}

          <Text style={styles.name}>{name || 'No Name'}</Text>
          <Text style={styles.email}>{email || 'No Email'}</Text>
          <Text style={styles.role}>Role: {role || 'Not Set'}</Text>
        </View>

        {/* Add more profile sections here */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    color: '#757575',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  role: {
    fontSize: 16,
    color: '#444',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});


import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { auth } from '../firebase/firebaseConfig';

const PendingApprovalScreen = ({ navigation }: any) => {
  const handleLogout = async () => {
    await auth().signOut();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Approval</Text>
      <Text style={styles.message}>
        Your account is currently awaiting approval from an administrator.
      </Text>
      <Text style={styles.message}>
        Please check back later.
      </Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default PendingApprovalScreen;

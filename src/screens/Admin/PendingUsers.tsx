import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { firestore } from '../../firebase/firebaseConfig';
import { User } from '../../types';

const PendingUsers = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);

  useEffect(() => {
    const unsubscribe = firestore
      .collection('users')
      .where('approved', '==', false)
      .onSnapshot(snapshot => {
        const users = snapshot.docs.map(doc => doc.data() as User);
        setPendingUsers(users);
      });

    return () => unsubscribe();
  }, []);

  const approveUser = async (uid: string) => {
    await firestore.collection('users').doc(uid).update({ approved: true });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Approvals</Text>
      <FlatList
        data={pendingUsers}
        keyExtractor={item => item.uid}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <View>
              <Text style={styles.userName}>{item.displayName}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>
            <Button title="Approve" onPress={() => approveUser(item.uid)} />
          </View>
        )}
        ListEmptyComponent={<Text>No users are currently pending approval.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  userEmail: {
    color: 'gray',
  },
});

export default PendingUsers;

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Modal, StyleSheet } from 'react-native';
import { User } from '../../types';
import { getUsers } from '../../firebase/firestore';
import UserDetails from './UserDetails';

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    };
    fetchUsers();
  }, []);

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <View>
              <Text style={styles.userName}>{item.displayName}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>
            <Button title="View Details" onPress={() => handleViewDetails(item)} />
          </View>
        )}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedUser && <UserDetails user={selectedUser} onClose={() => setModalVisible(false)} />}
      </Modal>
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

export default UserList;

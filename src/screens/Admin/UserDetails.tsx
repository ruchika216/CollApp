import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { firestore } from '../../firebase/firebaseConfig';
import { Project, User } from '../../types';
import { FieldValue } from '@react-native-firebase/firestore';

interface Props {
  user: User;
  onClose: () => void;
}

const UserDetails: React.FC<Props> = ({ user, onClose }) => {
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (user.projects && user.projects.length > 0) {
      const unsubscribe = firestore
        .collection('projects')
        .where(FieldValue.documentId(), 'in', user.projects)
        .onSnapshot(snapshot => {
          const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
          setAssignedProjects(projects);
        });

      return () => unsubscribe();
    }
  }, [user.projects]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user.displayName}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <Text style={styles.subtitle}>Assigned Projects</Text>
      <FlatList
        data={assignedProjects}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.projectItem}>
            <Text>{item.title}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No projects assigned.</Text>}
      />

      <Button title="Close" onPress={onClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  projectItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default UserDetails;
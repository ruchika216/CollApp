import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setProjects } from '../store/slices/projectSlice';
import { firestore } from '../firebase/firebaseConfig';
import { Project } from '../types';
import ProjectEditForm from '../components/projects/ProjectEditForm';
import { FieldValue } from '@react-native-firebase/firestore';

const Main = () => {
  const dispatch = useDispatch();
  const projects = useSelector((state: RootState) => state.projects.projects);
  const user = useSelector((state: RootState) => state.user.user);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user && user.projects.length > 0) {
      const unsubscribe = firestore
        .collection('projects')
        .where(FieldValue.documentId(), 'in', user.projects)
        .onSnapshot(snapshot => {
          const fetchedProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
          dispatch(setProjects(fetchedProjects));
        });

      return () => unsubscribe();
    }
  }, [dispatch, user]);

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Projects</Text>
      <FlatList
        data={projects}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.projectItem}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.projectTitle}>{item.title}</Text>
            <Text>{item.description}</Text>
            <View style={styles.editButton}>
              <Button title="Edit" onPress={() => handleEdit(item)} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>You have no assigned projects.</Text>}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedProject && (
          <ProjectEditForm
            project={selectedProject}
            onClose={() => setModalVisible(false)}
          />
        )}
      </Modal>
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
    marginBottom: 20,
  },
  projectItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  editButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
});

export default Main;
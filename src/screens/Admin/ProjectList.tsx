
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setProjects, deleteProject } from '../../store/slices/projectSlice';
import { getProjects, deleteProjectFromFirestore } from '../../firebase/firestore';
import ProjectForm from './ProjectForm';
import { Project } from '../../types';

const ProjectList = () => {
  const dispatch = useDispatch();
  const projects = useSelector((state: RootState) => state.projects.projects);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const projects = await getProjects();
      dispatch(setProjects(projects));
    };
    fetchProjects();
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    await deleteProjectFromFirestore(id);
    dispatch(deleteProject(id));
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setSelectedProject(null);
    setModalVisible(true);
  };

  return (
    <View>
      <Text>Projects</Text>
      <Button title="Add Project" onPress={handleAdd} />
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
            <Text>{item.description}</Text>
            <Button title="Edit" onPress={() => handleEdit(item)} />
            <Button title="Delete" onPress={() => handleDelete(item.id)} />
          </View>
        )}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <ProjectForm project={selectedProject} onClose={() => setModalVisible(false)} />
      </Modal>
    </View>
  );
};

export default ProjectList;

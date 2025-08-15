
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { updateProject } from '../../../store/slices/projectSlice';
import { updateProjectInFirestore } from '../../../services/firebase/firestore';
import { Project } from '../../../types';

interface Props {
  project: Project;
  onClose: () => void;
}

const ProjectEditForm: React.FC<Props> = ({ project, onClose }) => {
  const dispatch = useDispatch();
  const [description, setDescription] = useState(project.description);
  const [comment, setComment] = useState(project.comment);

  const handleSubmit = async () => {
    const updatedProject = { ...project, description, comment };
    await updateProjectInFirestore(updatedProject);
    dispatch(updateProject(updatedProject));
    onClose();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Project</Text>
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Comment"
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <Button title="Update" onPress={handleSubmit} />
      <Button title="Cancel" onPress={onClose} color="red" />
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default ProjectEditForm;

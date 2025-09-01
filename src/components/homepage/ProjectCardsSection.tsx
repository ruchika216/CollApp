import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import Icon from '../common/Icon';
import ProjectCard from '../projects/ProjectCard';

interface Props {
  displayProjects: any[];
  navigation: any;
  isAdmin?: boolean;
}

const ProjectCardsSection: React.FC<Props> = ({
  displayProjects,
  navigation,
  isAdmin,
}) => {
  const { colors } = useTheme();
  if (displayProjects.length === 0) {
    return (
      <View style={styles.emptyProjectsState}>
        <Icon name="project" size={48} color={colors.textSecondary} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          {isAdmin ? 'No Projects Created' : 'No Projects Assigned'}
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          {isAdmin
            ? 'Create your first project to get started'
            : 'No projects assigned to you yet'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      {displayProjects.slice(0, 5).map(project => (
        <View key={project.id} style={styles.projectCardWrapper}>
          <ProjectCard
            project={project}
            onPress={() => {
              if (!project.id) {
                Alert.alert('Error', 'Project ID is missing. Cannot navigate.');
                return;
              }
              navigation.navigate('ProjectDetailScreenNew', {
                projectId: project.id,
              });
            }}
            showAssignees
            compact
            glassy
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  projectCardWrapper: { marginHorizontal: 20, marginBottom: 12 },
  emptyProjectsState: {
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
});

export default ProjectCardsSection;

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// Import typed navigation types
import type { 
  BottomTabScreenPropsType,
  BottomTabNavigationProp,
  BottomTabRouteProp,
  MainStackNavigationProp,
  ProjectStackNavigationProp
} from '../types/navigation';

// Example 1: Using Screen Props Type (Recommended for components)
type ExampleScreenProps = BottomTabScreenPropsType<'Home'>;

const ExampleScreenWithProps: React.FC<ExampleScreenProps> = ({ navigation, route }) => {
  // navigation and route are now fully typed
  const handleNavigateToProjects = () => {
    // TypeScript knows about all available routes and their params
    navigation.navigate('Projects', {
      screen: 'ProjectList'
    });
  };

  const handleNavigateToProfile = () => {
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Example Screen with Props</Text>
      <TouchableOpacity style={styles.button} onPress={handleNavigateToProjects}>
        <Text style={styles.buttonText}>Go to Projects</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleNavigateToProfile}>
        <Text style={styles.buttonText}>Go to Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

// Example 2: Using Hooks with Types (Alternative approach)
const ExampleScreenWithHooks: React.FC = () => {
  // Type the navigation hook with specific navigator
  const navigation = useNavigation<BottomTabNavigationProp<'Home'>>();
  const route = useRoute<BottomTabRouteProp<'Home'>>();

  const handleNavigateToChat = () => {
    navigation.navigate('Chat');
  };

  const handleNavigateToSettings = () => {
    // Navigate to a screen in a different stack
    const mainNavigation = navigation.getParent<MainStackNavigationProp<'Main'>>();
    mainNavigation?.navigate('SettingsScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Example Screen with Hooks</Text>
      <TouchableOpacity style={styles.button} onPress={handleNavigateToChat}>
        <Text style={styles.buttonText}>Go to Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleNavigateToSettings}>
        <Text style={styles.buttonText}>Go to Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

// Example 3: Navigation with Parameters (Project Detail Screen)
const ProjectDetailExampleScreen: React.FC = () => {
  const navigation = useNavigation<ProjectStackNavigationProp<'ProjectDetail'>>();
  const route = useRoute<BottomTabRouteProp<'Projects'>>();

  const handleNavigateToProject = () => {
    // TypeScript enforces required parameters
    navigation.navigate('ProjectDetail', {
      projectId: 'project-123'
    });
  };

  const handleEditProject = () => {
    navigation.navigate('EditProject', {
      projectId: 'project-123'
    });
  };

  const handleCreateProject = () => {
    navigation.navigate('CreateProject');
  };

  // Example of going back to parent navigator
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Navigate to a safe screen if can't go back
      navigation.navigate('ProjectList');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Project Navigation Example</Text>
      <TouchableOpacity style={styles.button} onPress={handleNavigateToProject}>
        <Text style={styles.buttonText}>View Project Detail</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleEditProject}>
        <Text style={styles.buttonText}>Edit Project</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleCreateProject}>
        <Text style={styles.buttonText}>Create New Project</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleGoBack}>
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

// Example 4: Complex Navigation with Root Stack
const AuthenticationExampleScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: () => {
            // Navigate to root level (auth stack)
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  const handleGoToPendingApproval = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'PendingApproval' }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authentication Flow Example</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleGoToPendingApproval}>
        <Text style={styles.buttonText}>Go to Pending Approval</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    backgroundColor: '#6a01f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#white',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Export examples for different use cases
export {
  ExampleScreenWithProps,
  ExampleScreenWithHooks,
  ProjectDetailExampleScreen,
  AuthenticationExampleScreen,
};

export default ExampleScreenWithProps;
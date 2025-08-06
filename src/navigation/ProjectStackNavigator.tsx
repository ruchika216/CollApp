import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProjectListScreen from '../screens/ProjectListScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import ProjectForm from '../screens/Admin/ProjectForm';
import DeveloperProjectsScreen from '../screens/Developer/DeveloperProjectsScreen';

const Stack = createNativeStackNavigator();

export default function ProjectStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="ProjectList"
    >
      <Stack.Screen name="ProjectList" component={ProjectListScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen name="ProjectForm" component={ProjectForm} />
      <Stack.Screen name="DeveloperProjects" component={DeveloperProjectsScreen} />
    </Stack.Navigator>
  );
}
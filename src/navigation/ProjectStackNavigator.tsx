import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProjectListScreen from '../screens/ProjectListScreen';
import ProjectScreen from '../screens/ProjectScreen';
import ProjectForm from '../screens/Admin/ProjectForm';

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
      <Stack.Screen name="ProjectScreen" component={ProjectScreen} />
      <Stack.Screen name="ProjectForm" component={ProjectForm} />
    </Stack.Navigator>
  );
}
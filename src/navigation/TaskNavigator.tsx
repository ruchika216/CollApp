import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TaskListScreenNew, TaskDetailScreenNew } from '../screens/Task';
import { createNavigationContainerRef } from '@react-navigation/native';

// Create a navigation ref that can be used for navigation without the navigation prop
export const taskNavRef = createNavigationContainerRef();

// Define task navigator param list
export type TaskStackParamList = {
  TaskListScreen: undefined;
  TaskDetailScreen: { taskId: string };
};

const Stack = createNativeStackNavigator<TaskStackParamList>();

const TaskNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="TaskListScreen" component={TaskListScreenNew} />
      <Stack.Screen name="TaskDetailScreen" component={TaskDetailScreenNew} />
    </Stack.Navigator>
  );
};

export default TaskNavigator;

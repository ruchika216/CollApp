import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Root Stack Navigator (Auth Flow)
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  PendingApproval: undefined;
  Main: NavigatorScreenParams<MainStackParamList>;
};

// Main Stack Navigator (After Authentication)
export type MainStackParamList = {
  Main: NavigatorScreenParams<DrawerParamList>;
  TaskScreen: undefined;
  MeetingScreen: undefined;
  ReportScreen: undefined;
  NotificationScreen: undefined;
  SettingsScreen: undefined;
  ProjectDetailScreenNew: { projectId: string };
  ProjectFormNew: { project?: any };
};

// Drawer Navigator
export type DrawerParamList = {
  Dashboard: NavigatorScreenParams<BottomTabParamList>;
  Settings: undefined;
};

// Bottom Tab Navigator
export type BottomTabParamList = {
  Home: undefined;
  Projects: NavigatorScreenParams<ProjectStackParamList>;
  Dashboard: undefined;
  Chat: undefined;
  Profile: undefined;
};

// Project Stack Navigator
export type ProjectStackParamList = {
  ProjectList: undefined;
  ProjectDetail: { projectId: string };
  CreateProject: undefined;
  EditProject: { projectId: string };
};

// Screen Props Types for Type-Safe Navigation
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type MainStackScreenProps<T extends keyof MainStackParamList> = 
  NativeStackScreenProps<MainStackParamList, T>;

export type DrawerScreenPropsType<T extends keyof DrawerParamList> = 
  DrawerScreenProps<DrawerParamList, T>;

export type BottomTabScreenPropsType<T extends keyof BottomTabParamList> = 
  BottomTabScreenProps<BottomTabParamList, T>;

export type ProjectStackScreenProps<T extends keyof ProjectStackParamList> = 
  NativeStackScreenProps<ProjectStackParamList, T>;

// Navigation Prop Types
export type RootStackNavigationProp<T extends keyof RootStackParamList> = 
  RootStackScreenProps<T>['navigation'];

export type MainStackNavigationProp<T extends keyof MainStackParamList> = 
  MainStackScreenProps<T>['navigation'];

export type DrawerNavigationProp<T extends keyof DrawerParamList> = 
  DrawerScreenPropsType<T>['navigation'];

export type BottomTabNavigationProp<T extends keyof BottomTabParamList> = 
  BottomTabScreenPropsType<T>['navigation'];

export type ProjectStackNavigationProp<T extends keyof ProjectStackParamList> = 
  ProjectStackScreenProps<T>['navigation'];

// Route Prop Types
export type RootStackRouteProp<T extends keyof RootStackParamList> = 
  RootStackScreenProps<T>['route'];

export type MainStackRouteProp<T extends keyof MainStackParamList> = 
  MainStackScreenProps<T>['route'];

export type DrawerRouteProp<T extends keyof DrawerParamList> = 
  DrawerScreenPropsType<T>['route'];

export type BottomTabRouteProp<T extends keyof BottomTabParamList> = 
  BottomTabScreenPropsType<T>['route'];

export type ProjectStackRouteProp<T extends keyof ProjectStackParamList> = 
  ProjectStackScreenProps<T>['route'];

// Declare global navigation types for TypeScript
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

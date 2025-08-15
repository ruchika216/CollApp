import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { configureStore, PreloadedState } from '@reduxjs/toolkit';

// Import your store reducers
import userReducer, { UserState } from '../store/slices/userSlice';
import authReducer, { AuthState } from '../store/slices/authSlice';
import projectReducer from '../store/slices/projectSlice';
import meetingReducer from '../store/slices/meetingSlice';
import uiReducer from '../store/slices/uiSlice';

// Create a type for the root state
export interface RootState {
  user: UserState;
  auth: AuthState;
  projects: any;
  meetings: any;
  ui: any;
}

// Create test store function
export function createTestStore(initialState?: PreloadedState<RootState>) {
  return configureStore({
    reducer: {
      user: userReducer,
      auth: authReducer,
      projects: projectReducer,
      meetings: meetingReducer,
      ui: uiReducer,
    },
    preloadedState: initialState,
  });
}

// Default test state
export const defaultTestState: RootState = {
  user: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    allUsers: [],
    approvedUsers: [],
    pendingUsers: [],
    selectedUser: null,
  },
  auth: {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
    isFirstTime: true,
    onboardingCompleted: false,
    approvalStatus: null,
  },
  projects: {
    projects: [],
    selectedProject: null,
    userProjects: [],
    loading: false,
    error: null,
    filters: {
      status: [],
      priority: [],
      assignedTo: [],
    },
  },
  meetings: {
    meetings: [],
    userMeetings: [],
    todaysMeetings: [],
    upcomingMeetings: [],
    selectedMeeting: null,
    loading: false,
    error: null,
    filters: {},
  },
  ui: {
    loading: false,
    refreshing: false,
    drawerOpen: false,
    activeTab: 'home',
    modalVisible: false,
    bottomSheetVisible: false,
    searchQuery: '',
    filterOptions: {
      status: [],
      priority: [],
      assignee: [],
    },
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    selectedProject: null,
  },
};

// Test user objects
export const testUsers = {
  unapprovedDeveloper: {
    uid: 'dev-123',
    email: 'dev@example.com',
    displayName: 'Developer User',
    name: 'Developer User',
    photoURL: null,
    providerId: 'google.com',
    role: 'developer' as const,
    approved: false,
    projects: [],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  approvedDeveloper: {
    uid: 'dev-456',
    email: 'approved-dev@example.com',
    displayName: 'Approved Developer',
    name: 'Approved Developer',
    photoURL: null,
    providerId: 'google.com',
    role: 'developer' as const,
    approved: true,
    projects: ['project-1'],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  admin: {
    uid: 'admin-789',
    email: 'admin@example.com',
    displayName: 'Admin User',
    name: 'Admin User',
    photoURL: null,
    providerId: 'google.com',
    role: 'admin' as const,
    approved: true,
    projects: [],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
};

// Navigation wrapper component
const Stack = createNativeStackNavigator();

interface TestWrapperProps {
  children: React.ReactNode;
  store?: ReturnType<typeof createTestStore>;
  navigationInitialRoute?: string;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  store,
  navigationInitialRoute = 'Test',
}) => {
  const testStore = store || createTestStore(defaultTestState);

  return (
    <Provider store={testStore}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={navigationInitialRoute}>
          <Stack.Screen 
            name="Test" 
            component={() => <>{children}</>} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Login" 
            component={() => <div>Login Screen</div>} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PendingApproval" 
            component={() => <div>Pending Approval Screen</div>} 
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: PreloadedState<RootState>;
  store?: ReturnType<typeof createTestStore>;
  navigationInitialRoute?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    initialState,
    store = initialState ? createTestStore(initialState) : createTestStore(defaultTestState),
    navigationInitialRoute = 'Test',
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestWrapper store={store} navigationInitialRoute={navigationInitialRoute}>
      {children}
    </TestWrapper>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Helper functions for creating test states
export const createAuthenticatedState = (user = testUsers.approvedDeveloper): Partial<RootState> => ({
  user: {
    ...defaultTestState.user,
    user,
    isAuthenticated: true,
  },
  auth: {
    ...defaultTestState.auth,
    isAuthenticated: true,
    user,
    approvalStatus: user.approved ? 'approved' : 'pending',
  },
});

export const createUnauthenticatedState = (): Partial<RootState> => ({
  user: {
    ...defaultTestState.user,
    user: null,
    isAuthenticated: false,
  },
  auth: {
    ...defaultTestState.auth,
    isAuthenticated: false,
    user: null,
    approvalStatus: null,
  },
});

export const createLoadingState = (): Partial<RootState> => ({
  user: {
    ...defaultTestState.user,
    loading: true,
  },
  auth: {
    ...defaultTestState.auth,
    loading: true,
  },
});

// Re-export testing library utilities
export * from '@testing-library/react-native';
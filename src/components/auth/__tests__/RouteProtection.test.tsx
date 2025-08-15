import React from 'react';
import { Text, View } from 'react-native';
import {
  renderWithProviders,
  createAuthenticatedState,
  createUnauthenticatedState,
  createLoadingState,
  testUsers,
  defaultTestState,
} from '../../../test-utils/test-utils';

import RouteProtection from '../RouteProtection';

// Mock React Navigation
const mockDispatch = jest.fn();
const mockNavigation = {
  dispatch: mockDispatch,
  navigate: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
  canGoBack: jest.fn(() => true),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  CommonActions: {
    reset: jest.fn((config) => ({ type: 'RESET', payload: config })),
  },
}));

// Test child component
const TestChild: React.FC = () => (
  <View testID="protected-content">
    <Text>Protected Content</Text>
  </View>
);

describe('RouteProtection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should render nothing when user is null and not authenticated', () => {
      const { queryByTestId } = renderWithProviders(
        <RouteProtection>
          <TestChild />
        </RouteProtection>,
        { initialState: { ...defaultTestState, ...createLoadingState() } }
      );

      expect(queryByTestId('protected-content')).toBeNull();
    });
  });

  describe('Unauthenticated State', () => {
    it('should redirect to login when not authenticated', () => {
      renderWithProviders(
        <RouteProtection>
          <TestChild />
        </RouteProtection>,
        { initialState: { ...defaultTestState, ...createUnauthenticatedState() } }
      );

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'RESET',
        payload: {
          index: 0,
          routes: [{ name: 'Login' }],
        },
      });
    });

    it('should not render children when not authenticated', () => {
      const { queryByTestId } = renderWithProviders(
        <RouteProtection>
          <TestChild />
        </RouteProtection>,
        { initialState: { ...defaultTestState, ...createUnauthenticatedState() } }
      );

      expect(queryByTestId('protected-content')).toBeNull();
    });

    it('should redirect to login when user is null but isAuthenticated is true', () => {
      renderWithProviders(
        <RouteProtection>
          <TestChild />
        </RouteProtection>,
        {
          initialState: {
            ...defaultTestState,
            user: { ...defaultTestState.user, user: null, isAuthenticated: true },
            auth: { ...defaultTestState.auth, isAuthenticated: true, user: null },
          },
        }
      );

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'RESET',
        payload: {
          index: 0,
          routes: [{ name: 'Login' }],
        },
      });
    });
  });

  describe('Approval Required State', () => {
    it('should redirect to pending approval when requireApproval=true and user not approved', () => {
      renderWithProviders(
        <RouteProtection requireApproval={true}>
          <TestChild />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createAuthenticatedState(testUsers.unapprovedDeveloper) 
          } 
        }
      );

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'RESET',
        payload: {
          index: 0,
          routes: [{ name: 'PendingApproval' }],
        },
      });
    });

    it('should not render children when requireApproval=true and user not approved', () => {
      const { queryByTestId } = renderWithProviders(
        <RouteProtection requireApproval={true}>
          <TestChild />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createAuthenticatedState(testUsers.unapprovedDeveloper) 
          } 
        }
      );

      expect(queryByTestId('protected-content')).toBeNull();
    });

    it('should render children when requireApproval=false and user not approved', () => {
      const { getByTestId } = renderWithProviders(
        <RouteProtection requireApproval={false}>
          <TestChild />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createAuthenticatedState(testUsers.unapprovedDeveloper) 
          } 
        }
      );

      expect(getByTestId('protected-content')).toBeTruthy();
    });

    it('should use default requireApproval=true when not specified', () => {
      renderWithProviders(
        <RouteProtection>
          <TestChild />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createAuthenticatedState(testUsers.unapprovedDeveloper) 
          } 
        }
      );

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'RESET',
        payload: {
          index: 0,
          routes: [{ name: 'PendingApproval' }],
        },
      });
    });
  });

  describe('Approved State', () => {
    it('should render children when authenticated and approved', () => {
      const { getByTestId } = renderWithProviders(
        <RouteProtection>
          <TestChild />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createAuthenticatedState(testUsers.approvedDeveloper) 
          } 
        }
      );

      expect(getByTestId('protected-content')).toBeTruthy();
    });

    it('should not call navigation dispatch when authenticated and approved', () => {
      renderWithProviders(
        <RouteProtection>
          <TestChild />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createAuthenticatedState(testUsers.approvedDeveloper) 
          } 
        }
      );

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should render children when requireApproval=false and user approved', () => {
      const { getByTestId } = renderWithProviders(
        <RouteProtection requireApproval={false}>
          <TestChild />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createAuthenticatedState(testUsers.approvedDeveloper) 
          } 
        }
      );

      expect(getByTestId('protected-content')).toBeTruthy();
    });
  });

  describe('Admin User', () => {
    it('should render children when authenticated admin user', () => {
      const { getByTestId } = renderWithProviders(
        <RouteProtection>
          <TestChild />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createAuthenticatedState(testUsers.admin) 
          } 
        }
      );

      expect(getByTestId('protected-content')).toBeTruthy();
    });
  });

  describe('Re-render behavior', () => {
    it('should re-evaluate when authentication state changes', () => {
      // Start with unauthenticated state
      const { queryByTestId } = renderWithProviders(
        <RouteProtection>
          <TestChild />
        </RouteProtection>,
        { initialState: { ...defaultTestState, ...createUnauthenticatedState() } }
      );

      expect(queryByTestId('protected-content')).toBeNull();
      expect(mockDispatch).toHaveBeenCalled();
      
      // Clear the mock for next assertion
      mockDispatch.mockClear();

      // Test that component works correctly when re-rendered with authenticated state
      const { getByTestId } = renderWithProviders(
        <RouteProtection>
          <TestChild />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createAuthenticatedState(testUsers.approvedDeveloper) 
          } 
        }
      );

      expect(getByTestId('protected-content')).toBeTruthy();
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle user approval status change from approved to unapproved', () => {
      const unapprovedUser = { ...testUsers.approvedDeveloper, approved: false };
      
      const { queryByTestId } = renderWithProviders(
        <RouteProtection requireApproval={true}>
          <TestChild />
        </RouteProtection>,
        {
          initialState: {
            ...defaultTestState,
            ...createAuthenticatedState(unapprovedUser),
            auth: {
              ...defaultTestState.auth,
              isAuthenticated: true,
              user: unapprovedUser,
              approvalStatus: 'rejected',
            },
          },
        }
      );

      expect(queryByTestId('protected-content')).toBeNull();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'RESET',
        payload: {
          index: 0,
          routes: [{ name: 'PendingApproval' }],
        },
      });
    });

    it('should handle mixed authentication states gracefully', () => {
      // Test edge case where user is authenticated in one slice but not the other
      const { queryByTestId } = renderWithProviders(
        <RouteProtection>
          <TestChild />
        </RouteProtection>,
        {
          initialState: {
            ...defaultTestState,
            user: { 
              ...defaultTestState.user, 
              user: testUsers.approvedDeveloper, 
              isAuthenticated: true 
            },
            auth: { 
              ...defaultTestState.auth, 
              isAuthenticated: false, 
              user: null 
            },
          },
        }
      );

      expect(queryByTestId('protected-content')).toBeNull();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'RESET',
        payload: {
          index: 0,
          routes: [{ name: 'Login' }],
        },
      });
    });

    it('should prioritize requireApproval prop over user approval status', () => {
      // When requireApproval is false, should render even if user is not approved
      const { getByTestId } = renderWithProviders(
        <RouteProtection requireApproval={false}>
          <TestChild />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createAuthenticatedState(testUsers.unapprovedDeveloper) 
          } 
        }
      );

      expect(getByTestId('protected-content')).toBeTruthy();
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });
});
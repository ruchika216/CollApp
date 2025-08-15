import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { act, fireEvent, waitFor } from '@testing-library/react-native';
import {
  renderWithProviders,
  createAuthenticatedState,
  createUnauthenticatedState,
  testUsers,
  defaultTestState,
} from '../../../test-utils/test-utils';

import RouteProtection from '../RouteProtection';

// Mock navigation actions for integration testing
const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    dispatch: mockDispatch,
    reset: mockReset,
    goBack: jest.fn(),
    canGoBack: jest.fn(() => true),
    addListener: jest.fn(() => jest.fn()),
  }),
  CommonActions: {
    reset: jest.fn((config) => ({ type: 'RESET', payload: config })),
  },
}));

// Integration test components
const ProtectedScreen: React.FC = () => (
  <View testID="protected-screen">
    <Text>This is a protected screen</Text>
    <TouchableOpacity testID="protected-button">
      <Text>Protected Action</Text>
    </TouchableOpacity>
  </View>
);

const UnprotectedScreen: React.FC = () => (
  <View testID="unprotected-screen">
    <Text>This screen doesn't require approval</Text>
  </View>
);

describe('RouteProtection Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Flow Integration', () => {
    it('should handle complete authentication flow from unauthenticated to authenticated', async () => {
      // Start with unauthenticated state
      const { queryByTestId, store } = renderWithProviders(
        <RouteProtection>
          <ProtectedScreen />
        </RouteProtection>,
        { initialState: { ...defaultTestState, ...createUnauthenticatedState() } }
      );

      // Should not render protected content initially
      expect(queryByTestId('protected-screen')).toBeNull();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'RESET',
        payload: {
          index: 0,
          routes: [{ name: 'Login' }],
        },
      });

      // Clear mock for next phase
      mockDispatch.mockClear();

      // Simulate user login by dispatching auth success action
      await act(async () => {
        store.dispatch({
          type: 'user/setUser',
          payload: testUsers.approvedDeveloper,
        });
        store.dispatch({
          type: 'auth/setUser',
          payload: testUsers.approvedDeveloper,
        });
      });

      // Wait for component to re-render with new state
      await waitFor(() => {
        expect(queryByTestId('protected-screen')).toBeTruthy();
      });

      // Should not redirect since user is now authenticated and approved
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should handle approval workflow for pending users', async () => {
      // Start with authenticated but unapproved user
      const { queryByTestId, store } = renderWithProviders(
        <RouteProtection requireApproval={true}>
          <ProtectedScreen />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createAuthenticatedState(testUsers.unapprovedDeveloper) 
          } 
        }
      );

      // Should redirect to pending approval
      expect(queryByTestId('protected-screen')).toBeNull();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'RESET',
        payload: {
          index: 0,
          routes: [{ name: 'PendingApproval' }],
        },
      });

      mockDispatch.mockClear();

      // Simulate admin approving the user
      await act(async () => {
        const approvedUser = { ...testUsers.unapprovedDeveloper, approved: true };
        store.dispatch({
          type: 'user/setUser',
          payload: approvedUser,
        });
        store.dispatch({
          type: 'auth/setUser',
          payload: approvedUser,
        });
      });

      // Wait for component to re-render with approved user
      await waitFor(() => {
        expect(queryByTestId('protected-screen')).toBeTruthy();
      });

      // Should not redirect since user is now approved
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('Role-based Access Control', () => {
    it('should allow admin users full access', () => {
      const { getByTestId } = renderWithProviders(
        <RouteProtection>
          <ProtectedScreen />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createAuthenticatedState(testUsers.admin) 
          } 
        }
      );

      // Admin should have immediate access
      expect(getByTestId('protected-screen')).toBeTruthy();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should handle developer users with approval requirement', () => {
      const { getByTestId } = renderWithProviders(
        <RouteProtection requireApproval={true}>
          <ProtectedScreen />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createAuthenticatedState(testUsers.approvedDeveloper) 
          } 
        }
      );

      // Approved developer should have access
      expect(getByTestId('protected-screen')).toBeTruthy();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should bypass approval for screens that dont require it', () => {
      const { getByTestId } = renderWithProviders(
        <RouteProtection requireApproval={false}>
          <UnprotectedScreen />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createAuthenticatedState(testUsers.unapprovedDeveloper) 
          } 
        }
      );

      // Should render even for unapproved users when approval not required
      expect(getByTestId('unprotected-screen')).toBeTruthy();
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('Component Interaction Integration', () => {
    it('should allow interaction with protected components when authorized', () => {
      const { getByTestId } = renderWithProviders(
        <RouteProtection>
          <ProtectedScreen />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createAuthenticatedState(testUsers.approvedDeveloper) 
          } 
        }
      );

      const protectedButton = getByTestId('protected-button');
      expect(protectedButton).toBeTruthy();

      // Should be able to interact with protected elements
      fireEvent.press(protectedButton);
      // Button interaction should work without navigation side effects
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should prevent access to protected components when unauthorized', () => {
      const { queryByTestId } = renderWithProviders(
        <RouteProtection>
          <ProtectedScreen />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createUnauthenticatedState() 
          } 
        }
      );

      // Should not be able to access protected elements
      expect(queryByTestId('protected-button')).toBeNull();
      expect(queryByTestId('protected-screen')).toBeNull();
    });
  });

  describe('Error Boundary Integration', () => {
    it('should handle navigation errors gracefully', () => {
      // Mock navigation dispatch to throw error
      mockDispatch.mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      // Should not crash when navigation fails
      expect(() => {
        renderWithProviders(
          <RouteProtection>
            <ProtectedScreen />
          </RouteProtection>,
          { 
            initialState: { 
              ...defaultTestState, 
              ...createUnauthenticatedState() 
            } 
          }
        );
      }).not.toThrow();
    });
  });

  describe('State Synchronization', () => {
    it('should handle auth and user state discrepancies', () => {
      // Test mismatched auth states between slices
      const { queryByTestId } = renderWithProviders(
        <RouteProtection>
          <ProtectedScreen />
        </RouteProtection>,
        {
          initialState: {
            ...defaultTestState,
            user: {
              ...defaultTestState.user,
              user: testUsers.approvedDeveloper,
              isAuthenticated: true,
            },
            auth: {
              ...defaultTestState.auth,
              isAuthenticated: false, // Mismatch here
              user: null,
            },
          },
        }
      );

      // Should prioritize the more restrictive state (auth.isAuthenticated = false)
      expect(queryByTestId('protected-screen')).toBeNull();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'RESET',
        payload: {
          index: 0,
          routes: [{ name: 'Login' }],
        },
      });
    });
  });

  describe('Performance Tests', () => {
    it('should not cause excessive re-renders for stable auth state', () => {
      let renderCount = 0;
      
      const TrackingComponent: React.FC = () => {
        renderCount++;
        return <ProtectedScreen />;
      };

      const { rerender } = renderWithProviders(
        <RouteProtection>
          <TrackingComponent />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createAuthenticatedState(testUsers.approvedDeveloper) 
          } 
        }
      );

      const initialRenderCount = renderCount;

      // Re-render with same state
      rerender(
        <RouteProtection>
          <TrackingComponent />
        </RouteProtection>
      );

      // Should not cause excessive re-renders
      expect(renderCount).toBe(initialRenderCount + 1);
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility props for protected content', () => {
      const AccessibleScreen: React.FC = () => (
        <View 
          testID="accessible-screen" 
          accessible={true} 
          accessibilityLabel="Protected accessible screen"
        >
          <Text>Accessible content</Text>
        </View>
      );

      const { getByTestId } = renderWithProviders(
        <RouteProtection>
          <AccessibleScreen />
        </RouteProtection>,
        { 
          initialState: { 
            ...defaultTestState, 
            ...createAuthenticatedState(testUsers.approvedDeveloper) 
          } 
        }
      );

      const accessibleScreen = getByTestId('accessible-screen');
      expect(accessibleScreen).toBeTruthy();
      expect(accessibleScreen.props.accessible).toBe(true);
      expect(accessibleScreen.props.accessibilityLabel).toBe('Protected accessible screen');
    });
  });
});
# Testing Setup for CollApp

This directory contains testing utilities and setup files for the CollApp React Native application.

## Files

- `setupTests.js` - Jest setup file with mocks for React Native modules
- `test-utils.tsx` - Custom testing utilities with Redux store and navigation wrappers

## Usage

### Basic Component Testing

```typescript
import { renderWithProviders } from '../test-utils/test-utils';
import MyComponent from '../MyComponent';

test('renders component', () => {
  const { getByText } = renderWithProviders(<MyComponent />);
  expect(getByText('Hello World')).toBeTruthy();
});
```

### Testing with Authentication

```typescript
import { 
  renderWithProviders, 
  createAuthenticatedState, 
  testUsers 
} from '../test-utils/test-utils';

test('renders for authenticated user', () => {
  const { getByTestId } = renderWithProviders(
    <ProtectedComponent />,
    { initialState: createAuthenticatedState(testUsers.approvedDeveloper) }
  );
  expect(getByTestId('protected-content')).toBeTruthy();
});
```

### Testing Navigation

```typescript
// Mock navigation is automatically set up in setupTests.js
// You can access mock functions in your tests

const mockNavigation = useNavigation();
expect(mockNavigation.navigate).toHaveBeenCalledWith('ScreenName');
```

## Test Users

Predefined test users are available:
- `testUsers.unapprovedDeveloper` - Developer user pending approval
- `testUsers.approvedDeveloper` - Approved developer user  
- `testUsers.admin` - Admin user

## State Helpers

- `createAuthenticatedState(user)` - Creates authenticated state with given user
- `createUnauthenticatedState()` - Creates unauthenticated state
- `createLoadingState()` - Creates loading state
- `defaultTestState` - Default test state for all slices

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- RouteProtection.test.tsx

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Test Categories

1. **Unit Tests** - Test individual components in isolation
2. **Integration Tests** - Test component interactions and workflows  
3. **Navigation Tests** - Test route protection and navigation flows
4. **State Tests** - Test Redux state management and updates

## Mocked Modules

The following modules are mocked in `setupTests.js`:
- React Navigation
- Firebase services  
- Google Sign-In
- React Native modules (StatusBar, Dimensions, etc.)
- Vector Icons
- Linear Gradient
- Reanimated
- Safe Area Context

## Best Practices

1. Use `renderWithProviders` instead of plain `render`
2. Use predefined test users and state helpers
3. Clear mocks between tests with `beforeEach(() => jest.clearAllMocks())`
4. Test both success and error scenarios
5. Use descriptive test names and organize with `describe` blocks
6. Test accessibility props where relevant
7. Use `waitFor` for asynchronous operations
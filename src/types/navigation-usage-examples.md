# TypeScript Navigation Usage Examples

This document provides comprehensive examples of using the typed navigation system in the CollApp React Native application.

## Navigation Type Hierarchy

```
RootStackParamList (Auth Flow)
└── MainStackParamList (After Authentication)
    └── DrawerParamList (Drawer Navigation)
        └── BottomTabParamList (Tab Navigation)
            └── ProjectStackParamList (Project Flow)
```

## Basic Usage Patterns

### 1. Screen Component with Props (Recommended)

```typescript
import type { BottomTabScreenPropsType } from '../types/navigation';

interface HomeScreenProps extends BottomTabScreenPropsType<'Home'> {}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  // navigation and route are fully typed

  const handleNavigateToProjects = () => {
    navigation.navigate('Projects', {
      screen: 'ProjectList',
    });
  };

  const handleNavigateToProfile = () => {
    navigation.navigate('Profile');
  };

  return <View>{/* Your component JSX */}</View>;
};
```

### 2. Using Navigation Hooks with Types

```typescript
import { useNavigation, useRoute } from '@react-navigation/native';
import type {
  BottomTabNavigationProp,
  BottomTabRouteProp,
} from '../types/navigation';

const MyComponent: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<'Home'>>();
  const route = useRoute<BottomTabRouteProp<'Home'>>();

  const handleNavigate = () => {
    navigation.navigate('Chat');
  };

  return <View>{/* Your component JSX */}</View>;
};
```

### 3. Navigation with Parameters

```typescript
import type { ProjectStackNavigationProp } from '../types/navigation';

const ProjectListScreen: React.FC = () => {
  const navigation = useNavigation<ProjectStackNavigationProp<'ProjectList'>>();

  const handleViewProject = (projectId: string) => {
    // TypeScript enforces the required projectId parameter
    navigation.navigate('ProjectDetail', { projectId });
  };

  const handleEditProject = (projectId: string) => {
    navigation.navigate('EditProject', { projectId });
  };

  return <View>{/* Your component JSX */}</View>;
};
```

### 4. Cross-Stack Navigation

```typescript
import type {
  BottomTabNavigationProp,
  MainStackNavigationProp,
} from '../types/navigation';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<'Home'>>();

  const handleGoToSettings = () => {
    // Navigate to a screen in the parent Main Stack
    const mainNavigation =
      navigation.getParent<MainStackNavigationProp<'Main'>>();
    mainNavigation?.navigate('SettingsScreen');
  };

  return <View>{/* Your component JSX */}</View>;
};
```

### 5. Root Level Navigation (Authentication)

```typescript
import { CommonActions } from '@react-navigation/native';

const SignOutButton: React.FC = () => {
  const navigation = useNavigation();

  const handleSignOut = () => {
    // Reset to login screen
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    );
  };

  const handleGoToPendingApproval = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'PendingApproval' }],
      }),
    );
  };

  return (
    <TouchableOpacity onPress={handleSignOut}>
      <Text>Sign Out</Text>
    </TouchableOpacity>
  );
};
```

## Advanced Patterns

### 6. Conditional Navigation Based on User Role

```typescript
import { useAppSelector } from '../store/hooks';
import type { BottomTabNavigationProp } from '../types/navigation';

const DashboardButton: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<'Home'>>();
  const user = useAppSelector(state => state.auth.user);

  const handleNavigateToDashboard = () => {
    // Navigation is typed and knows about the Dashboard route
    navigation.navigate('Dashboard');
  };

  if (!user?.approved) {
    return null; // Don't show if user not approved
  }

  return (
    <TouchableOpacity onPress={handleNavigateToDashboard}>
      <Text>Go to Dashboard</Text>
    </TouchableOpacity>
  );
};
```

### 7. Navigation with State and Callbacks

```typescript
import type { ProjectStackScreenPropsType } from '../types/navigation';

interface ProjectDetailScreenProps
  extends ProjectStackScreenPropsType<'ProjectDetail'> {}

const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { projectId } = route.params; // TypeScript knows projectId exists and is a string

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback navigation
      navigation.navigate('ProjectList');
    }
  };

  const handleEditProject = () => {
    navigation.navigate('EditProject', { projectId });
  };

  return (
    <View>
      <Text>Project ID: {projectId}</Text>
      <TouchableOpacity onPress={handleEditProject}>
        <Text>Edit Project</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleGoBack}>
        <Text>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### 8. Navigation Listeners with Types

```typescript
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '../types/navigation';

const ProjectListScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<'Projects'>>();

  useFocusEffect(
    React.useCallback(() => {
      // Screen focused - refresh data
      console.log('Projects screen focused');

      return () => {
        // Screen unfocused - cleanup
        console.log('Projects screen unfocused');
      };
    }, []),
  );

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', e => {
      // Handle tab press
      console.log('Projects tab pressed');
    });

    return unsubscribe;
  }, [navigation]);

  return <View>{/* Your component JSX */}</View>;
};
```

## Best Practices

1. **Always use screen props when possible** - This provides the most comprehensive typing
2. **Import specific types** - Import only the types you need to keep bundle size small
3. **Use parent navigation for cross-stack navigation** - Access parent navigators with `getParent()`
4. **Handle navigation edge cases** - Always check `canGoBack()` before calling `goBack()`
5. **Type your route parameters** - Ensure all navigation parameters are properly typed
6. **Use CommonActions for auth flows** - Use `reset()` for authentication state changes

## Common TypeScript Errors and Solutions

### Error: Property 'navigate' does not exist

**Solution**: Import and use the correct navigation type

```typescript
// ❌ Incorrect
const navigation = useNavigation();

// ✅ Correct
const navigation = useNavigation<BottomTabNavigationProp<'Home'>>();
```

### Error: Argument of type 'X' is not assignable to parameter

**Solution**: Check your param list definitions and ensure parameters match

```typescript
// ❌ Incorrect - missing required parameter
navigation.navigate('ProjectDetail');

// ✅ Correct - providing required parameter
navigation.navigate('ProjectDetail', { projectId: 'project-123' });
```

### Error: Cannot find name 'ReactNavigation'

**Solution**: Make sure you've imported the global declaration from navigation.ts

The global declaration in `src/types/navigation.ts` should automatically provide global types for all React Navigation hooks.

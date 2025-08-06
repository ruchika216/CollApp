import React, { useEffect } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';

interface RouteProtectionProps {
  children: React.ReactNode;
  requireApproval?: boolean;
}

const RouteProtection: React.FC<RouteProtectionProps> = ({
  children,
  requireApproval = true,
}) => {
  const navigation = useNavigation();
  const user = useAppSelector(state => state.user.user);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' as never }],
        })
      );
      return;
    }

    // If approval required and user not approved, redirect to pending approval
    if (requireApproval && !user.approved) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'PendingApproval' as never }],
        })
      );
      return;
    }
  }, [navigation, isAuthenticated, user, requireApproval]);

  // Only render children if user is authenticated and approved (if required)
  if (!isAuthenticated || !user || (requireApproval && !user.approved)) {
    return null;
  }

  return <>{children}</>;
};

export default RouteProtection;
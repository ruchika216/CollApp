import React, { ReactNode } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PendingApprovalScreen from '../../screens/PendingApprovalScreen';
import { useAppSelector } from '../../store/hooks';

interface Props {
  children: ReactNode;
  requireApproval?: boolean;
  redirectIfUnauthenticated?: boolean;
}

export const RouteProtection: React.FC<Props> = ({
  children,
  requireApproval = false,
  redirectIfUnauthenticated = true,
}) => {
  const userState = useAppSelector(s => s.user);
  const user = userState?.user;
  const loading = userState?.loading;
  const nav = useNavigation<any>();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    if (redirectIfUnauthenticated) {
      setTimeout(() => {
        const last = nav.getState()?.routes?.slice(-1)[0];
        if (last?.name !== 'Login') {
          nav.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      }, 0);
    }
    return null;
  }

  if (requireApproval && user.approved === false) {
    return <PendingApprovalScreen />;
  }

  return <>{children}</>;
};

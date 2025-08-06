import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useTheme } from '../../theme/useTheme';
import CustomHeader from '../common/CustomHeader';

interface ScreenLayoutProps {
  children: React.ReactNode;
  title?: string;
  showMenuButton?: boolean;
  backgroundColor?: string;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
}

type DrawerNavigation = DrawerNavigationProp<any>;

const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  title,
  showMenuButton = true,
  backgroundColor,
  rightComponent,
  leftComponent,
}) => {
  const navigation = useNavigation<DrawerNavigation>();
  const { colors } = useTheme();

  const handleMenuPress = () => {
    navigation.openDrawer();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CustomHeader
        title={title}
        showMenuButton={showMenuButton}
        onMenuPress={handleMenuPress}
        backgroundColor={backgroundColor}
        rightComponent={rightComponent}
        leftComponent={leftComponent}
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default ScreenLayout;
// ScreenLayout.tsx
import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';

interface ScreenLayoutProps {
  children: React.ReactNode;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  showMenuButton?: boolean;
}

const HEADER_HEIGHT = Platform.OS === 'ios' ? 120 : 120;
const STATUS_BAR_HEIGHT =
  Platform.OS === 'ios' ? 20 : StatusBar.currentHeight || 24;

const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  leftComponent,
  rightComponent,
  showMenuButton = true,
}) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.primary,
            paddingTop: STATUS_BAR_HEIGHT,
            height: HEADER_HEIGHT,
          },
        ]}
      >
        <View style={styles.headerInner}>
          <View style={styles.left}>{leftComponent}</View>
          <View style={styles.right}>{rightComponent}</View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    justifyContent: 'center',
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  left: {
    flex: 1,
  },
  right: {},
});

export default ScreenLayout;

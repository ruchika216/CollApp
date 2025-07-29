import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface GlassButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function GlassButton({
  title,
  onPress,
  style,
  textStyle,
}: GlassButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.glassButton, style]}
    >
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.45)',
          'rgba(255,255,255,0.18)',
          'rgba(255,255,255,0.10)',
        ]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glassInner}
      >
        <View style={styles.glassHighlight} />
        <Text style={[styles.glassText, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  glassButton: {
    width: '76%',
    height: 54,
    borderRadius: 28,
    alignSelf: 'center',
    marginTop: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#4356af',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 12,
  },
  glassInner: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.35)',
    opacity: 0.7,
  },
  glassText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0208fd',
    textShadowColor: 'rgba(255,255,255,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    zIndex: 2,
  },
});

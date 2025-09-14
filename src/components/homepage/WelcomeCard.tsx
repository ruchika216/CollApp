import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/useTheme';
import Icon from '../common/Icon';
import { testFirestoreRules } from '../../utils/testFirestoreRules';

interface Props {
  shadows?: any;
  greeting: string;
  userName?: string;
}

const WelcomeCard: React.FC<Props> = ({ shadows, greeting, userName }) => {
  const { colors, gradients } = useTheme();
  const { width } = useWindowDimensions();

  // Responsive scale with a slight iOS boost for better presence
  const baseScale = width / 375;
  const extra = Platform.OS === 'ios' ? 1.08 : 1;
  const scale = Math.max(1.0, Math.min(1.25, baseScale * extra));
  const pad = Math.round(20 * scale);
  const radius = Math.round(16 * scale);
  const haloSize = Math.round((Platform.OS === 'ios' ? 88 : 78) * scale);
  const iconWrapSize =
    Platform.OS === 'ios'
      ? Math.min(84, Math.max(60, Math.round(64 * scale)))
      : Math.min(72, Math.max(52, Math.round(60 * scale)));
  const iconWrapRadius = Math.round(iconWrapSize / 2);
  const greetSize = Math.min(
    Platform.OS === 'ios' ? 28 : 26,
    Math.max(18, Math.round(22 * scale)),
  );
  const subSize = Math.min(16, Math.max(14, Math.round(15 * scale)));
  const chipPadH = Math.round(10 * scale);
  const chipPadV = Math.round(4 * scale);
  const chipTextSize = Math.min(13, Math.max(11, Math.round(12 * scale)));
  const nameIconSize = Math.min(16, Math.max(12, Math.round(14 * scale)));

  const dynamic = useMemo(
    () =>
      StyleSheet.create({
        card: {
          padding: pad,
          borderRadius: radius,
          // On iOS, reduce horizontal margins so the card appears wider
          ...(Platform.OS === 'ios' ? { marginHorizontal: 1 } : {}),
          minHeight: Math.round((Platform.OS === 'ios' ? 175 : 108) * scale),
          ...Platform.select({
            ios: {
              shadowRadius: 12 * scale,
              shadowOffset: { width: 0, height: Math.round(6 * scale) },
            },
            android: {
              // Keep elevation reasonable on small screens
              elevation: Math.round(6 * scale),
            },
          }),
        },
        iconHalo: {
          width: haloSize,
          height: haloSize,
          borderRadius: Math.round(haloSize / 2),
          right: Math.round(6 * scale),
        },
        iconWrap: {
          width: iconWrapSize,
          height: iconWrapSize,
          borderRadius: iconWrapRadius,
        },
        greetingText: {
          fontSize: greetSize,
        },
        subtitle: {
          fontSize: subSize,
        },
        dateChip: {
          paddingHorizontal: chipPadH,
          paddingVertical: chipPadV,
        },
        nameChip: {
          paddingHorizontal: chipPadH,
          paddingVertical: chipPadV,
          maxWidth: Math.round(160 * scale),
        },
        dateChipText: {
          fontSize: chipTextSize,
        },
        nameChipText: {
          fontSize: chipTextSize,
        },
      }),
    [
      pad,
      radius,
      haloSize,
      iconWrapSize,
      iconWrapRadius,
      greetSize,
      subSize,
      chipPadH,
      chipPadV,
      chipTextSize,
      scale,
    ],
  );

  const today = useMemo(() => {
    const d = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    try {
      return d.toLocaleDateString(undefined, options);
    } catch {
      return d.toDateString();
    }
  }, []);

  const gradientColors = (gradients as any)?.primary || [
    colors.primary,
    colors.primary,
  ];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, dynamic.card, shadows?.xl]}
    >
      <View style={styles.content}>
        <View style={styles.textCol}>
          <View style={styles.rowTop}>
            <View style={[styles.dateChip, dynamic.dateChip]}>
              <Text style={[styles.dateChipText, dynamic.dateChipText]}>
                {today}
              </Text>
            </View>
            {userName ? (
              <View style={[styles.nameChip, dynamic.nameChip]}>
                <Icon name="account" size={nameIconSize} color="#fff" />
                <Text
                  style={[styles.nameChipText, dynamic.nameChipText]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {userName}
                </Text>
              </View>
            ) : null}
          </View>

          <Text
            style={[styles.greetingText, dynamic.greetingText]}
            numberOfLines={1}
          >
            {greeting}!
          </Text>
          <Text style={[styles.subtitle, dynamic.subtitle]} numberOfLines={2}>
            Welcome to CollApp. Start your day and be productive.
          </Text>

          {/* Test Firebase Rules Button (Remove this in production) */}
          <TouchableOpacity
            style={styles.testButton}
            onPress={testFirestoreRules}
          >
            <Text style={styles.testButtonText}>Test Firebase Rules</Text>
          </TouchableOpacity>
        </View>

        {/* <View style={styles.iconCol}>
          <View style={[styles.iconHalo, dynamic.iconHalo]} />
          <View style={[styles.iconWrap, dynamic.iconWrap]}>
            <Icon name="dashboard" size={Math.round(32 * scale)} color="#fff" />
          </View>
        </View> */}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textCol: { flex: 1 },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameChip: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      },
    }),
  },
  nameChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginLeft: 6,
  },
  dateChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
  dateChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.92)' },
  iconCol: { marginLeft: 16 },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconHalo: {
    position: 'absolute',
    right: 6,
    top: 0,
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  testButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default WelcomeCard;

import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';

interface CarouselSection {
  key: string;
  render: () => React.ReactNode;
}

interface Props {
  sections: CarouselSection[];
  height?: number; // optional fixed height for stable snapping
  contentPaddingHorizontal?: number;
}

const { width } = Dimensions.get('window');

const SectionCarousel: React.FC<Props> = ({
  sections,
  height,
  contentPaddingHorizontal = 0,
}) => {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);

  const pageWidth = useMemo(() => width, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / pageWidth);
    if (i !== index) setIndex(i);
  };

  return (
    <View style={[styles.wrapper, { height: height || undefined }]}>
      <ScrollView
        horizontal
        pagingEnabled
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: contentPaddingHorizontal }}
      >
        {sections.map(s => (
          <View key={s.key} style={{ width: pageWidth }}>
            {s.render()}
          </View>
        ))}
      </ScrollView>
      <View style={styles.dotsRow}>
        {sections.map((_, i) => (
          <View
            key={`dot-${i}`}
            style={[
              styles.dot,
              {
                backgroundColor: i === index ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default SectionCarousel;

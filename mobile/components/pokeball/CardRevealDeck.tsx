import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { conditionLabel } from "../../lib/conditions";
import type { PokemonCard } from "../../lib/types";
import { colors } from "../../constants/Colors";

const { width: SCREEN_W } = Dimensions.get("window");

interface CardRevealDeckProps {
  cards: PokemonCard[];
  opened: SharedValue<number>;
  onPressCard: (card: PokemonCard) => void;
  onLongPressCard?: (card: PokemonCard) => void;
  emptyLabel?: string;
  /** Card width as fraction of page (smaller = more ball visible around it) */
  cardScale?: number;
}

function DeckCard({
  card,
  pageWidth,
  opened,
  cardScale,
  onPress,
  onLongPress,
}: {
  card: PokemonCard;
  pageWidth: number;
  opened: SharedValue<number>;
  cardScale: number;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const image = card.apiImageUrl || card.photoUrl;

  // Stay hidden until ball is mid-open, then pop out from center
  const anim = useAnimatedStyle(() => {
    const reveal = opened.value;
    const scale = interpolate(reveal, [0, 0.35, 0.65, 1], [0.12, 0.12, 0.85, 1], Extrapolation.CLAMP);
    const opacity = interpolate(reveal, [0, 0.4, 0.7, 1], [0, 0, 0.85, 1], Extrapolation.CLAMP);
    const ty = interpolate(reveal, [0.4, 1], [28, 0], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scale }, { translateY: ty }],
    };
  });

  return (
    <View style={[styles.page, { width: pageWidth }]}>
      <Animated.View style={[{ width: pageWidth * cardScale }, anim]}>
        <Pressable onPress={onPress} onLongPress={onLongPress}>
          <View style={styles.cardFrame}>
            {image ? (
              <Image source={{ uri: image }} style={styles.cardImage} resizeMode="cover" />
            ) : (
              <View style={styles.fallback}>
                <Text style={styles.fallbackLetter}>{card.name[0]}</Text>
              </View>
            )}
            <View style={styles.shine} pointerEvents="none" />
          </View>
          <Text numberOfLines={2} style={styles.name}>
            {card.name}
          </Text>
          {card.condition ? (
            <Text style={styles.cond}>{conditionLabel(card.condition)}</Text>
          ) : (
            <Text style={styles.hint}>Tap to edit · swipe for more</Text>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

export function CardRevealDeck({
  cards,
  opened,
  onPressCard,
  onLongPressCard,
  emptyLabel = "No cards yet — search or scan to add.",
  cardScale = 0.55,
}: CardRevealDeckProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pageWidth = SCREEN_W - 32;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const idx = viewableItems[0]?.index;
      if (typeof idx === "number") setActiveIndex(idx);
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      setActiveIndex(Math.round(x / pageWidth));
    },
    [pageWidth]
  );

  if (cards.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={cards}
        keyExtractor={(c) => c.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={pageWidth}
        snapToAlignment="start"
        disableIntervalMomentum
        onMomentumScrollEnd={onMomentumEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: pageWidth,
          offset: pageWidth * index,
          index,
        })}
        renderItem={({ item }) => (
          <DeckCard
            card={item}
            pageWidth={pageWidth}
            opened={opened}
            cardScale={cardScale}
            onPress={() => onPressCard(item)}
            onLongPress={onLongPressCard ? () => onLongPressCard(item) : undefined}
          />
        )}
      />
      <Text style={styles.pager}>
        {activeIndex + 1} / {cards.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    flex: 1,
    zIndex: 2,
  },
  list: {
    flex: 1,
    backgroundColor: "transparent",
  },
  listContent: {
    alignItems: "center",
  },
  page: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  cardFrame: {
    aspectRatio: 3 / 4,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.slateCard,
    borderWidth: 2,
    borderColor: "rgba(255,203,5,0.55)",
    shadowColor: colors.pikachu,
    shadowOpacity: 0.55,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  fallback: {
    flex: 1,
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.slateDeep,
  },
  fallbackLetter: {
    color: colors.pikachu,
    fontWeight: "900",
    fontSize: 56,
  },
  shine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  name: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
  },
  cond: {
    color: colors.pikachu,
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  hint: {
    color: colors.muted2,
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },
  pager: {
    color: colors.muted,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 10,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: 2,
  },
  emptyText: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
});

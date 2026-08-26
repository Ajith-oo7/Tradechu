import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../constants/Colors";

type OpenedProp = number | SharedValue<number>;

function useOpenedValue(opened: OpenedProp): SharedValue<number> {
  const local = useSharedValue(typeof opened === "number" ? opened : 0);
  useEffect(() => {
    if (typeof opened === "number") {
      local.value = withTiming(opened, { duration: 400 });
    }
  }, [opened, local]);
  return typeof opened === "number" ? local : opened;
}

interface LevitatingPokeballProps {
  size?: number;
  /** 0 = closed, 1 = fully open (halves split) */
  opened?: OpenedProp;
  dimmed?: boolean;
  float?: boolean;
}

export function LevitatingPokeball({
  size = 220,
  opened = 0,
  dimmed = false,
  float = true,
}: LevitatingPokeballProps) {
  const open = useOpenedValue(opened);
  const t = useSharedValue(0);

  useEffect(() => {
    if (!float) {
      t.value = 0;
      return;
    }
    t.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [float, t]);

  const floatStyle = useAnimatedStyle(() => {
    const bob = float ? Math.sin(t.value * Math.PI) * 10 : 0;
    const yaw = float ? Math.sin(t.value * Math.PI * 0.5) * 4 : 0;
    const breathe = float ? 1 + Math.sin(t.value * Math.PI) * 0.02 : 1;
    return {
      transform: [
        { translateY: bob },
        { rotateZ: `${yaw}deg` },
        { scale: breathe },
      ],
      opacity: dimmed ? 0.4 : 1,
    };
  });

  // Split far enough that halves clear a centered card
  const split = size * 0.72;

  const topStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -open.value * split }],
  }));

  const bottomStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: open.value * split }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: 1 - open.value,
    transform: [{ scale: 1 - open.value * 0.5 }],
  }));

  const bandStyle = useAnimatedStyle(() => ({
    opacity: 1 - open.value * 0.85,
  }));

  const r = size / 2;

  return (
    <Animated.View style={[{ width: size, height: size }, floatStyle]}>
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            width: size * 1.45,
            height: size * 1.45,
            borderRadius: size,
            left: -size * 0.225,
            top: -size * 0.225,
          },
        ]}
      />

      <Animated.View style={[styles.halfWrap, { width: size, height: size }, topStyle]}>
        <View
          style={{
            width: size,
            height: r,
            overflow: "hidden",
            borderTopLeftRadius: r,
            borderTopRightRadius: r,
          }}
        >
          <LinearGradient
            colors={["#FF4A4A", colors.pokeball, "#B01010"]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={{ width: size, height: size, borderRadius: r }}
          />
          <View
            style={{
              position: "absolute",
              top: size * 0.08,
              left: size * 0.18,
              width: size * 0.28,
              height: size * 0.14,
              borderRadius: size,
              backgroundColor: "rgba(255,255,255,0.28)",
              transform: [{ rotate: "-25deg" }],
            }}
          />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.halfWrap,
          { width: size, height: size, justifyContent: "flex-end" },
          bottomStyle,
        ]}
      >
        <View
          style={{
            width: size,
            height: r,
            overflow: "hidden",
            borderBottomLeftRadius: r,
            borderBottomRightRadius: r,
          }}
        >
          <View style={{ marginTop: -r }}>
            <LinearGradient
              colors={["#F8F8F8", "#FFFFFF", "#D8D8D8"]}
              start={{ x: 0.3, y: 0 }}
              end={{ x: 0.7, y: 1 }}
              style={{ width: size, height: size, borderRadius: r }}
            />
          </View>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.band,
          {
            top: r - size * 0.04,
            height: size * 0.08,
            width: size,
          },
          bandStyle,
        ]}
      />

      <Animated.View
        style={[
          styles.buttonOuter,
          {
            width: size * 0.22,
            height: size * 0.22,
            borderRadius: size,
            left: size * 0.39,
            top: size * 0.39,
            borderWidth: size * 0.025,
          },
          buttonStyle,
        ]}
      >
        <View
          style={{
            width: "55%",
            height: "55%",
            borderRadius: size,
            backgroundColor: "#F5F5F5",
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.15)",
          }}
        />
      </Animated.View>
    </Animated.View>
  );
}

/** Closed ball briefly, then open. Returns shared open progress 0→1. */
export function usePokeballOpen(shouldOpen: boolean, duration = 900) {
  const opened = useSharedValue(0);
  useEffect(() => {
    if (!shouldOpen) {
      opened.value = withTiming(0, { duration: 280 });
      return;
    }
    opened.value = 0;
    const id = setTimeout(() => {
      opened.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }, 450);
    return () => clearTimeout(id);
  }, [shouldOpen, duration, opened]);
  return opened;
}

const styles = StyleSheet.create({
  glow: {
    position: "absolute",
    backgroundColor: "rgba(238,21,21,0.22)",
  },
  halfWrap: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  band: {
    position: "absolute",
    left: 0,
    backgroundColor: "#1a1a1a",
  },
  buttonOuter: {
    position: "absolute",
    backgroundColor: "#F0F0F0",
    borderColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
});

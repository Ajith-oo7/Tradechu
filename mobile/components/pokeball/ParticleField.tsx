import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../../constants/Colors";

function seeded(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface ParticleFieldProps {
  density?: number;
  intensity?: "low" | "medium" | "high";
  style?: object;
}

function Particle({
  left,
  top,
  size,
  delay,
  duration,
  color,
  travel,
}: {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
  travel: number;
}) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, duration, p]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.15 + p.value * 0.75,
    transform: [
      { translateY: -p.value * travel },
      { scale: 0.6 + p.value * 0.6 },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: `${left}%`,
          top: `${top}%`,
          width: size,
          height: size,
          borderRadius: size,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export function ParticleField({
  density = 36,
  intensity = "medium",
  style,
}: ParticleFieldProps) {
  const particles = useMemo(() => {
    const count =
      intensity === "high" ? density : intensity === "low" ? Math.floor(density * 0.45) : density;
    return Array.from({ length: count }, (_, i) => {
      const gold = seeded(i, 1) > 0.55;
      return {
        id: i,
        left: seeded(i, 2) * 92 + 4,
        top: seeded(i, 3) * 88 + 6,
        size: 2 + seeded(i, 4) * (intensity === "high" ? 5 : 3.5),
        delay: seeded(i, 5) * 2200,
        duration: 1800 + seeded(i, 6) * 2400,
        travel: 12 + seeded(i, 7) * (intensity === "high" ? 40 : 24),
        color: gold
          ? colors.pikachu
          : seeded(i, 8) > 0.5
            ? "rgba(255,255,255,0.95)"
            : "rgba(255,220,150,0.9)",
      };
    });
  }, [density, intensity]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </View>
  );
}

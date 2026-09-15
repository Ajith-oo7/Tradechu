import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ParticleField } from "./ParticleField";
import { colors } from "../../constants/Colors";

interface ShrineBackdropProps {
  intensity?: "low" | "medium" | "high";
}

export function ShrineBackdrop({ intensity = "high" }: ShrineBackdropProps) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[
          colors.background,
          "rgba(255,226,74,0.18)",
          "rgba(255,255,255,0.65)",
          "rgba(188,0,7,0.08)",
          colors.background,
        ]}
        locations={[0, 0.28, 0.5, 0.72, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.core} />
      <ParticleField density={48} intensity={intensity} />
    </View>
  );
}

const styles = StyleSheet.create({
  core: {
    position: "absolute",
    alignSelf: "center",
    top: "18%",
    width: "78%",
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: "rgba(255,226,74,0.16)",
  },
});

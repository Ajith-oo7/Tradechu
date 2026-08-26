import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ParticleField } from "./ParticleField";

interface ShrineBackdropProps {
  intensity?: "low" | "medium" | "high";
}

export function ShrineBackdrop({ intensity = "high" }: ShrineBackdropProps) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[
          "transparent",
          "rgba(255,203,5,0.12)",
          "rgba(255,255,255,0.18)",
          "rgba(255,203,5,0.22)",
          "transparent",
        ]}
        locations={[0, 0.25, 0.5, 0.72, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["transparent", "rgba(255,240,180,0.25)", "transparent"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Radial-ish core glow */}
      <View style={styles.core} />
      <ParticleField density={48} intensity={intensity} />
    </View>
  );
}

const styles = StyleSheet.create({
  core: {
    position: "absolute",
    alignSelf: "center",
    top: "22%",
    width: "70%",
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: "rgba(255,203,5,0.12)",
  },
});

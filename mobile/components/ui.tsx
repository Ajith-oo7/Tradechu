import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { colors } from "../constants/Colors";

export function Screen({ children }: { children: React.ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function Field(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.muted2}
      style={styles.input}
      {...props}
    />
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primaryBtn,
        (disabled || loading) && { opacity: 0.5 },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.slateDeep} />
      ) : (
        <Text style={styles.primaryLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.secondaryBtn}>
      <Text style={styles.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

export function CardTile({
  name,
  setName,
  condition,
  imageUrl,
  onPress,
}: {
  name: string;
  setName?: string;
  condition?: string;
  imageUrl?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.cardTile}>
      <View style={styles.cardArt}>
        {imageUrl ? (
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          <Text style={styles.cardArtPlaceholder}>IMG</Text>
        ) : (
          <Text style={styles.cardArtPlaceholder}>{name.slice(0, 1)}</Text>
        )}
      </View>
      <Text numberOfLines={2} style={styles.cardName}>
        {name}
      </Text>
      {setName ? (
        <Text numberOfLines={1} style={styles.cardMeta}>
          {setName}
        </Text>
      ) : null}
      {condition ? <Text style={styles.cardCond}>{condition}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.slateDeep,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 6,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: colors.pikachu,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  primaryLabel: {
    color: colors.slateDeep,
    fontWeight: "800",
    fontSize: 16,
  },
  secondaryBtn: {
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryLabel: {
    color: colors.muted,
    fontWeight: "600",
    fontSize: 14,
  },
  cardTile: {
    width: "47%",
    marginBottom: 14,
  },
  cardArt: {
    aspectRatio: 3 / 4,
    borderRadius: 12,
    backgroundColor: colors.slateCard,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardArtPlaceholder: {
    color: colors.pikachu,
    fontWeight: "900",
    fontSize: 28,
  },
  cardName: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
    textAlign: "center",
  },
  cardMeta: {
    color: colors.muted2,
    fontSize: 10,
    textAlign: "center",
  },
  cardCond: {
    color: colors.pikachu,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 2,
  },
});

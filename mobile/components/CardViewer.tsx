import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CARD_CONDITIONS } from "../lib/conditions";
import type { CardCondition, PokemonCard } from "../lib/types";
import { colors } from "../constants/Colors";
import { PrimaryButton, SecondaryButton } from "./ui";

interface CardViewerProps {
  card: PokemonCard;
  onClose: () => void;
  onSave: (patch: { name: string; condition?: CardCondition; note?: string }) => void;
  onRemove: () => void;
}

export function CardViewer({ card, onClose, onSave, onRemove }: CardViewerProps) {
  const [name, setName] = useState(card.name);
  const [condition, setCondition] = useState<CardCondition | undefined>(
    card.condition ?? "NM"
  );
  const [note, setNote] = useState(card.note ?? "");
  const image = card.apiImageUrl || card.photoUrl;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Card</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Text style={styles.close}>Close</Text>
              </Pressable>
            </View>

            <View style={styles.artWrap}>
              {image ? (
                <Image source={{ uri: image }} style={styles.art} resizeMode="contain" />
              ) : (
                <View style={[styles.art, styles.artFallback]}>
                  <Text style={styles.artLetter}>{card.name[0]}</Text>
                </View>
              )}
            </View>

            {card.setName ? (
              <Text style={styles.meta}>
                {card.setName}
                {card.cardNumber ? ` · #${card.cardNumber}` : ""}
              </Text>
            ) : null}

            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholderTextColor={colors.muted2}
              style={styles.input}
            />

            <Text style={styles.label}>Condition</Text>
            <View style={styles.condGrid}>
              {CARD_CONDITIONS.map((c) => {
                const active = condition === c.value;
                return (
                  <Pressable
                    key={c.value}
                    onPress={() => setCondition(c.value)}
                    style={[styles.condChip, active && styles.condChipActive]}
                  >
                    <Text style={[styles.condText, active && styles.condTextActive]}>
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={(t) => setNote(t.slice(0, 120))}
              placeholder="e.g. small crease bottom left"
              placeholderTextColor={colors.muted2}
              multiline
              style={[styles.input, { minHeight: 72, textAlignVertical: "top" }]}
            />
            <Text style={styles.counter}>{note.length}/120</Text>

            <PrimaryButton
              label="Save"
              onPress={() =>
                onSave({
                  name: name.trim() || card.name,
                  condition,
                  note: note.trim() || undefined,
                })
              }
            />
            <SecondaryButton label="Remove from list" onPress={onRemove} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "92%",
    backgroundColor: colors.slateCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: { color: colors.white, fontWeight: "900", fontSize: 18 },
  close: { color: colors.muted, fontWeight: "700" },
  artWrap: {
    alignItems: "center",
    marginBottom: 12,
  },
  art: {
    width: "70%",
    aspectRatio: 3 / 4,
    borderRadius: 12,
  },
  artFallback: {
    backgroundColor: colors.slateDeep,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  artLetter: { color: colors.pikachu, fontWeight: "900", fontSize: 48 },
  meta: {
    color: colors.muted,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  condGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  condChip: {
    width: "31%",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  condChipActive: {
    borderColor: "rgba(255,203,5,0.5)",
    backgroundColor: "rgba(255,203,5,0.15)",
  },
  condText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  condTextActive: { color: colors.pikachu },
  counter: {
    color: colors.muted2,
    fontSize: 10,
    textAlign: "right",
    marginBottom: 4,
  },
});

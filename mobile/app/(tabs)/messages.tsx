import { FlatList, Text, View } from "react-native";
import { Screen, Subtitle, Title } from "../../components/ui";
import { colors } from "../../constants/Colors";

const DEMO = [
  {
    id: "1",
    user: "TrainerY",
    preview: "Meet at table 4 after round 2?",
    trade: "Pikachu ex ↔ Eevee",
  },
  {
    id: "2",
    user: "RareCollector",
    preview: "Is the Charizard NM?",
    trade: "Charizard ex ↔ Ancient Mew",
  },
];

export default function MessagesScreen() {
  return (
    <Screen>
      <Title>Messages</Title>
      <Subtitle>Trade chats. Connect Supabase to sync across phones.</Subtitle>
      <FlatList
        data={DEMO}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: colors.glass,
              borderRadius: 16,
              padding: 14,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.white, fontWeight: "800" }}>@{item.user}</Text>
            <Text style={{ color: colors.pikachu, fontSize: 11, marginTop: 2 }}>{item.trade}</Text>
            <Text style={{ color: colors.muted, marginTop: 6 }}>{item.preview}</Text>
          </View>
        )}
      />
    </Screen>
  );
}

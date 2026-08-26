import { useRef, useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { Field, PrimaryButton, Screen, SecondaryButton, Subtitle } from "../components/ui";
import { useApp } from "../providers/AppProvider";
import { colors } from "../constants/Colors";
import type { CardListType } from "../lib/types";

export default function ScanScreen() {
  const { list } = useLocalSearchParams<{ list?: string }>();
  const listType: CardListType = list === "binder" ? "binder" : "wishlist";
  const { addNamedCard } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [name, setName] = useState("");

  const capture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (photo?.uri) setPhotoUri(photo.uri);
  };

  const pickGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]?.uri) setPhotoUri(res.assets[0].uri);
  };

  const save = () => {
    if (!name.trim()) {
      Alert.alert("Name the card", "Type the card name (OCR matching comes next).");
      return;
    }
    addNamedCard(name.trim(), listType, photoUri ?? undefined);
    router.back();
  };

  if (!permission?.granted) {
    return (
      <Screen>
        <Subtitle>Camera access is needed to scan cards.</Subtitle>
        <PrimaryButton label="Allow camera" onPress={() => void requestPermission()} />
        <SecondaryButton label="Choose from gallery" onPress={() => void pickGallery()} />
      </Screen>
    );
  }

  if (photoUri) {
    return (
      <Screen>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        <Subtitle>
          Confirm the card name (native OCR can be wired to the same TCGdex search as web).
        </Subtitle>
        <Field placeholder="e.g. Charizard ex" value={name} onChangeText={setName} />
        <PrimaryButton label="Add card" onPress={save} />
        <SecondaryButton label="Retake" onPress={() => setPhotoUri(null)} />
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.slateDeep }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
      <View style={styles.controls}>
        <PrimaryButton label="Capture" onPress={() => void capture()} />
        <SecondaryButton label="Gallery" onPress={() => void pickGallery()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 16,
    marginBottom: 12,
  },
  controls: {
    padding: 16,
    gap: 4,
    backgroundColor: colors.slateDeep,
  },
});

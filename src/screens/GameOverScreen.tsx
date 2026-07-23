import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { RootStackScreenProps } from "../types/navigationTypes";

const RESULT_COPY = {
  win: { title: "You win", subtitle: "Checkmate" },
  loss: { title: "You lose", subtitle: "Better luck next time" },
  draw: { title: "Draw", subtitle: "Stalemate or agreement" },
} as const;

export function GameOverScreen({
  navigation,
  route,
}: RootStackScreenProps<"GameOver">) {
  const { result } = route.params;
  const copy = RESULT_COPY[result];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>Game over</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primary,
              pressed && styles.pressed,
            ]}
            onPress={() => navigation.replace("Game", { difficulty: 1 })}
          >
            <Text style={styles.primaryLabel}>Play again</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.secondary,
              pressed && styles.pressed,
            ]}
            onPress={() => navigation.popToTop()}
          >
            <Text style={styles.secondaryLabel}>Home</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#323232",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: "600",
    color: "#b58863",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 12,
    fontSize: 48,
    fontWeight: "700",
    color: "#f0d9b5",
    letterSpacing: 2,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#b58863",
  },
  actions: {
    marginTop: 48,
    width: "100%",
    maxWidth: 280,
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primary: {
    backgroundColor: "#b58863",
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#b58863",
  },
  pressed: {
    opacity: 0.75,
  },
  primaryLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  secondaryLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#f0d9b5",
  },
});

import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AiLevel } from "js-chess-engine";

import { Board } from "@/components/chess/Board";
import { useChaseGame } from "@/hooks/useChaseGame";
import type { RootStackScreenProps } from "../types/navigationTypes";

export function GameScreen({
  navigation,
  route,
}: RootStackScreenProps<"Game">) {
  const {
    board,
    squarePieces,
    pieceMotion,
    fadingPieces,
    selected,
    legalTargets,
    dropTarget,
    canInteract,
    playerColor,
    onSquarePress,
    beginDrag,
    updateDropTarget,
    completeDrag,
    completeFadeOut,
  } = useChaseGame({
    difficulty: 1,
    playerColor: "white",
    onGameOver: (result) => navigation.replace("GameOver", { result }),
  });

  const turnLabel = board.turn === "white" ? "Your turn" : "AI turn";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <Text style={styles.turn}>{turnLabel}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.boardWrap}>
        <Board
          pieces={board.pieces}
          squarePieces={squarePieces}
          pieceMotion={pieceMotion}
          fadingPieces={fadingPieces}
          selected={selected}
          legalTargets={legalTargets}
          dropTarget={dropTarget}
          playerColor={playerColor}
          canInteract={canInteract}
          onSquarePress={onSquarePress}
          onDragStart={beginDrag}
          onDragHover={updateDropTarget}
          onDragEnd={completeDrag}
          onFadeOutComplete={completeFadeOut}
        />
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.secondary,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.replace("GameOver", { result: "loss" })}
        >
          <Text style={styles.secondaryLabel}>Resign</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#323232",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backButton: {
    minWidth: 64,
    paddingVertical: 8,
  },
  backLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f0d9b5",
  },
  turn: {
    fontSize: 16,
    fontWeight: "600",
    color: "#b58863",
  },
  headerSpacer: {
    minWidth: 64,
  },
  boardWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 16,
    alignItems: "center",
  },
  button: {
    width: "100%",
    maxWidth: 280,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#b58863",
  },
  pressed: {
    opacity: 0.75,
  },
  secondaryLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#f0d9b5",
  },
});

import { Button, Text, View } from "react-native";
import { Game } from "js-chess-engine";
import type { BoardConfig, MovesMap } from "js-chess-engine";

import type { RootStackScreenProps } from "../types/navigationTypes";

export function GameScreen({
  navigation,
  route,
}: RootStackScreenProps<"Game">) {
  const { difficulty } = route.params;

  const game = new Game();

  return (
    <View>
      <Text>Game Screen (difficulty: {difficulty})</Text>
      <Button
        title="End game"
        onPress={() => navigation.replace("GameOver", { result: "win" })}
      />
    </View>
  );
}

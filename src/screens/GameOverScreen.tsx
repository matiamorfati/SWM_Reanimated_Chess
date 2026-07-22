import { Button, Text, View } from "react-native";

import type { RootStackScreenProps } from "../types/navigationTypes";

export function GameOverScreen({
  navigation,
  route,
}: RootStackScreenProps<"GameOver">) {
  const { result } = route.params;

  return (
    <View>
      <Text>Game Over: {result}</Text>
      <Button title="Home" onPress={() => navigation.popToTop()} />
    </View>
  );
}

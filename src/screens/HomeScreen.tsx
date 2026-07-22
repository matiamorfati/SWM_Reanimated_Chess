import { Button, Text, View } from "react-native";

import type { RootStackScreenProps } from "../types/navigationTypes";

export function HomeScreen({ navigation }: RootStackScreenProps<"Home">) {
  return (
    <View>
      <Text>Home</Text>
      <Button
        title="Play"
        onPress={() => navigation.navigate("Game", { difficulty: 1 })}
      />
      <Button
        title="Settings"
        onPress={() => navigation.navigate("Settings")}
      />
    </View>
  );
}

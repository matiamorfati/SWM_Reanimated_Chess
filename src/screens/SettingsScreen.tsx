import { Text, View } from "react-native";

import type { RootStackScreenProps } from "../types/navigationTypes";

type Props = RootStackScreenProps<"Settings">;

export function SettingsScreen(_props: Props) {
  return (
    <View>
      <Text>Settings Screen</Text>
    </View>
  );
}

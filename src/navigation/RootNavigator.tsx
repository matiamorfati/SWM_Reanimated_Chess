import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { GameOverScreen } from "../screens/GameOverScreen";
import { GameScreen } from "../screens/GameScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import type { RootStackParamList } from "../types/navigationTypes";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{ title: "Game" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
      <Stack.Screen
        name="GameOver"
        component={GameOverScreen}
        options={{
          title: "Game over",
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}

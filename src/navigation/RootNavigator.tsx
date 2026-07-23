import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { GameOverScreen } from "../screens/GameOverScreen";
import { GameScreen } from "../screens/GameScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import type { RootStackParamList } from "../types/navigationTypes";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen
        name="GameOver"
        component={GameOverScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}

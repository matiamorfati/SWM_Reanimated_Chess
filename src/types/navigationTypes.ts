import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Home: undefined;
  Game: {
    difficulty: number;
  };
  Settings: undefined;
  GameOver: {
    result: "win" | "loss" | "draw";
  };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

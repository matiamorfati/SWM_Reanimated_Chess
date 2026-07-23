import { StyleSheet, View } from "react-native";
import type { PieceCode } from "js-chess-engine";

import { PIECE_CODE_MAP } from "./PieceCode";

type Props = {
  code: PieceCode;
  size: number;
};

const OPTICAL_NUDGE_X = -0.04;

export function Piece({ code, size }: Props) {
  const Icon = PIECE_CODE_MAP[code];
  if (!Icon) return null;

  const iconSize = size * 0.85;
  return (
    <View
      style={[
        styles.wrap,
        { transform: [{ translateX: size * OPTICAL_NUDGE_X }] },
      ]}
    >
      <Icon width={iconSize} height={iconSize} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});

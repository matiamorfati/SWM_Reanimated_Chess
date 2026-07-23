import { useEffect, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { Color, PiecesMap, Square } from "js-chess-engine";

import type {
  PieceEntity,
  PieceId,
  PieceMotion,
  SquarePieces,
} from "@/chess";

import { PiecesOverlay } from "./PiecesOverlay";

const FILES = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;
const INDICATOR_FADE_MS = 180;

function FadeInView({
  style,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: INDICATOR_FADE_MS });
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}

type Props = {
  pieces: PiecesMap;
  squarePieces: SquarePieces;
  pieceMotion?: PieceMotion | null;
  fadingPieces?: PieceEntity[];
  selected?: Square | null;
  legalTargets?: Square[];
  dropTarget?: Square | null;
  playerColor: Color;
  canInteract: boolean;
  onSquarePress?: (square: Square) => void;
  onDragStart: (square: Square) => boolean;
  onDragHover: (square: Square | null) => void;
  onDragEnd: (from: Square, to: Square | null) => boolean;
  onFadeOutComplete?: (id: PieceId) => void;
};

export function Board({
  pieces,
  squarePieces,
  pieceMotion = null,
  fadingPieces = [],
  selected = null,
  legalTargets = [],
  dropTarget = null,
  playerColor,
  canInteract,
  onSquarePress,
  onDragStart,
  onDragHover,
  onDragEnd,
  onFadeOutComplete,
}: Props) {
  const { width } = useWindowDimensions();
  const size = Math.floor(Math.min(width - 32, 400));
  const squareSize = size / 8;

  return (
    <View style={[styles.board, { width: size, height: size }]}>
      {RANKS.map((rank) => (
        <View key={rank} style={styles.row}>
          {FILES.map((file) => {
            const square = `${file}${rank}` as Square;
            const piece = pieces[square];
            const isLight = (file.charCodeAt(0) + rank) % 2 === 0;
            const isSelected = selected === square;
            const isLegal = legalTargets.includes(square);
            const isDropTarget = dropTarget === square;

            return (
              <Pressable
                key={square}
                onPress={() => onSquarePress?.(square)}
                style={[
                  styles.square,
                  {
                    width: squareSize,
                    height: squareSize,
                    backgroundColor: isSelected
                      ? "#cdd26a"
                      : isLight
                        ? "#f0d9b5"
                        : "#b58863",
                  },
                ]}
              >
                {isLegal && !piece ? <FadeInView style={styles.dot} /> : null}
                {isLegal && piece ? (
                  <FadeInView style={styles.captureRing} />
                ) : null}
                {isDropTarget ? (
                  <FadeInView style={styles.dropIndicator} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
      <PiecesOverlay
        size={size}
        squarePieces={squarePieces}
        pieceMotion={pieceMotion}
        fadingPieces={fadingPieces}
        playerColor={playerColor}
        canInteract={canInteract}
        onDragStart={onDragStart}
        onDragHover={onDragHover}
        onDragEnd={onDragEnd}
        onFadeOutComplete={onFadeOutComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    overflow: "hidden",
    borderRadius: 10,
  },
  row: { flexDirection: "row" },
  square: { alignItems: "center", justifyContent: "center" },
  dot: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  captureRing: {
    ...StyleSheet.absoluteFill,
    borderWidth: 3,
    borderColor: "rgba(0,0,0,0.25)",
    borderRadius: 4,
  },
  dropIndicator: {
    ...StyleSheet.absoluteFill,
    borderWidth: 3,
    borderColor: "#6aaf6a",
    backgroundColor: "rgba(106, 175, 106, 0.35)",
    borderRadius: 4,
  },
});

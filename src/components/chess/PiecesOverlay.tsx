import { StyleSheet, View } from "react-native";
import type { Color, Square } from "js-chess-engine";

import {
  isPlayerPiece,
  listPieceEntities,
  type PieceEntity,
  type PieceId,
  type PieceMotion,
  type SquarePieces,
} from "@/chess";

import { AnimatedPiece } from "./AnimatedPiece";

type Props = {
  size: number;
  squarePieces: SquarePieces;
  pieceMotion?: PieceMotion | null;
  fadingPieces?: PieceEntity[];
  playerColor: Color;
  canInteract: boolean;
  onDragStart: (square: Square) => boolean;
  onDragHover: (square: Square | null) => void;
  onDragEnd: (from: Square, to: Square | null) => boolean;
  onFadeOutComplete?: (id: PieceId) => void;
};

export function PiecesOverlay({
  size,
  squarePieces,
  pieceMotion = null,
  fadingPieces = [],
  playerColor,
  canInteract,
  onDragStart,
  onDragHover,
  onDragEnd,
  onFadeOutComplete,
}: Props) {
  const squareSize = size / 8;
  const entities = listPieceEntities(squarePieces);
  const movingIds = new Set(pieceMotion?.ids ?? []);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.overlay, { width: size, height: size }]}
    >
      {entities.map((entity) => {
        const isMoving = movingIds.has(entity.id);
        const motionSource = isMoving ? pieceMotion?.source : null;
        const draggable =
          canInteract && isPlayerPiece(entity.code, playerColor);

        return (
          <AnimatedPiece
            key={entity.id}
            entity={entity}
            squareSize={squareSize}
            boardSize={size}
            draggable={draggable}
            motionSource={motionSource}
            zIndex={isMoving ? 10 : 0}
            onDragStart={onDragStart}
            onDragHover={onDragHover}
            onDragEnd={onDragEnd}
          />
        );
      })}
      {fadingPieces.map((entity) => (
        <AnimatedPiece
          key={entity.id}
          entity={entity}
          squareSize={squareSize}
          boardSize={size}
          fadeOut
          zIndex={0}
          onFadeOutComplete={onFadeOutComplete}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
  },
});

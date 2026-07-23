import type { PieceCode, Square } from "js-chess-engine";

export type MoveKind =
  | "quiet"
  | "capture"
  | "enPassant"
  | "castle"
  | "promotion";

export type MoveEvent = {
  from: Square;
  to: Square;
  kind: MoveKind;
  piece: PieceCode;
  captured?: PieceCode;
  rookFrom?: Square;
  rookTo?: Square;
  promotedTo?: PieceCode;
};

export type GameResult = "win" | "loss" | "draw" | null;

export type PieceMotionSource = "player" | "ai";

export type PieceMotion = {
  ids: string[];
  source: PieceMotionSource;
};

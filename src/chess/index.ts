export { createChessEngine } from "./engine";
export type { AiMoveResult, ChessEngine, TryMoveResult } from "./engine";
export { classifyMove } from "./movesDiff";
export {
  applyMoveToSquareMap,
  getCapturedPieceEntity,
  getMovingPieceIds,
  isPlayerPiece,
  listPieceEntities,
  piecesMapToEntities,
  piecesMapToSquareMap,
  squareToXY,
  xyToSquare,
} from "./pieces";
export type {
  PieceEntity,
  PieceId,
  SquarePieces,
  SquareXY,
} from "./pieces";
export type {
  GameResult,
  MoveEvent,
  MoveKind,
  PieceMotion,
  PieceMotionSource,
} from "./types";

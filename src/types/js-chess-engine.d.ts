declare module "js-chess-engine" {
  export type Square = string;
  export type PieceCode =
    | "K"
    | "Q"
    | "R"
    | "B"
    | "N"
    | "P"
    | "k"
    | "q"
    | "r"
    | "b"
    | "n"
    | "p";
  export type Color = "white" | "black";
  export type AiLevel = 0 | 1 | 2 | 3 | 4;

  export type MovesMap = Record<Square, Square[]>;
  export type PiecesMap = Record<Square, PieceCode>;
  export type PlayedMove = Record<Square, Square>;

  export type BoardConfig = {
    turn?: Color;
    pieces: PiecesMap;
    moves?: MovesMap;
    isFinished?: boolean;
    check?: boolean;
    checkMate?: boolean;
    castling?: {
      whiteLong?: boolean;
      whiteShort?: boolean;
      blackLong?: boolean;
      blackShort?: boolean;
    };
    enPassant?: Square | null;
    halfMove?: number;
    fullMove?: number;
  };

  export type BoardConfiguration = BoardConfig | string;

  export type HistoryEntry = {
    from: Square;
    to: Square;
    configuration: BoardConfig;
  };

  export class Game {
    constructor(configuration?: BoardConfiguration);
    move(from: Square, to: Square): PlayedMove;
    moves(from: Square): Square[];
    moves(from?: null): MovesMap | Square[];
    setPiece(location: Square, piece: PieceCode): void;
    removePiece(location: Square): void;
    aiMove(level?: AiLevel | number): PlayedMove;
    getHistory(reversed?: boolean): HistoryEntry[];
    printToConsole(): void;
    exportJson(): BoardConfig;
    exportFEN(): string;
  }

  export function moves(config: BoardConfiguration): MovesMap | Square[];
  export function status(config: BoardConfiguration): BoardConfig;
  export function getFen(config: BoardConfiguration): string;
  export function move(
    config: BoardConfiguration,
    from: Square,
    to: Square,
  ): BoardConfig | string;
  export function aiMove(
    config: BoardConfiguration,
    level?: AiLevel | number,
  ): PlayedMove;
}

import { Game } from "js-chess-engine";
import type {
  AiLevel,
  BoardConfig,
  BoardConfiguration,
  Color,
  MovesMap,
  PieceCode,
  PlayedMove,
  Square,
} from "js-chess-engine";

import { classifyMove } from "./movesDiff";
import type { GameResult, MoveEvent } from "./types";

export type TryMoveResult =
  | { ok: true; board: BoardConfig; event: MoveEvent }
  | { ok: false };

export type AiMoveResult = {
  from: Square;
  to: Square;
  board: BoardConfig;
  event: MoveEvent;
};

export type ChessEngine = {
  getBoard: () => BoardConfig;
  getFen: () => string;
  getLegalMoves: (from?: Square) => Square[] | MovesMap;
  tryMove: (from: Square, to: Square) => TryMoveResult;
  playAi: (level?: AiLevel) => AiMoveResult;
  setPiece: (square: Square, piece: PieceCode) => BoardConfig;
  getResult: (playerColor?: Color) => GameResult;
};

function normalize(square: Square): Square {
  return square.toUpperCase();
}

function parsePlayedMove(played: PlayedMove): { from: Square; to: Square } {
  const from = Object.keys(played)[0];
  if (!from) {
    throw new Error("playAi: empty move from engine");
  }
  return { from: normalize(from), to: normalize(played[from]) };
}

function isLegalTarget(targets: Square[], to: Square): boolean {
  const toSq = normalize(to);
  return targets.some((square) => normalize(square) === toSq);
}

function resolveResult(board: BoardConfig, playerColor: Color): GameResult {
  if (!board.isFinished) {
    return null;
  }

  if (board.checkMate) {
    return board.turn === playerColor ? "loss" : "win";
  }

  return "draw";
}

export function createChessEngine(initial?: BoardConfiguration): ChessEngine {
  const game = new Game(initial);

  return {
    getBoard: () => game.exportJson(),

    getFen: () => game.exportFEN(),

    getLegalMoves: (from) => {
      if (from == null) {
        return game.moves();
      }
      return game.moves(normalize(from));
    },

    tryMove: (from, to) => {
      const fromSq = normalize(from);
      const toSq = normalize(to);
      const legal = game.moves(fromSq);

      if (!Array.isArray(legal) || !isLegalTarget(legal, toSq)) {
        return { ok: false };
      }

      const before = game.exportJson();
      game.move(fromSq, toSq);
      const after = game.exportJson();
      const event = classifyMove(before, after, fromSq, toSq);

      return { ok: true, board: after, event };
    },

    playAi: (level = 2) => {
      const before = game.exportJson();
      const played = game.aiMove(level);
      const { from, to } = parsePlayedMove(played);
      const after = game.exportJson();
      const event = classifyMove(before, after, from, to);

      return { from, to, board: after, event };
    },

    setPiece: (square, piece) => {
      game.setPiece(normalize(square), piece);
      return game.exportJson();
    },

    getResult: (playerColor = "white") =>
      resolveResult(game.exportJson(), playerColor),
  };
}

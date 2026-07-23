import type { PieceCode, PiecesMap, Square } from "js-chess-engine";

import type { MoveEvent } from "./types";

export type PieceId = string;

export type PieceEntity = {
  id: PieceId;
  code: PieceCode;
  square: Square;
};

export type SquarePieces = Partial<Record<Square, PieceEntity>>;

export type SquareXY = {
  x: number;
  y: number;
};

function normalize(square: Square): Square {
  return square.toUpperCase() as Square;
}

function fileIndex(square: Square): number {
  return normalize(square).charCodeAt(0) - 65; // A=0
}

function rank(square: Square): number {
  return Number(normalize(square)[1]);
}

export function squareToXY(square: Square, squareSize: number): SquareXY {
  const sq = normalize(square);
  return {
    x: fileIndex(sq) * squareSize,
    y: (8 - rank(sq)) * squareSize,
  };
}

function clampIndex(value: number): number {
  return Math.max(0, Math.min(7, value));
}

/** Inverse of squareToXY — maps a board-local point (e.g. piece center) to a square. */
export function xyToSquare(
  x: number,
  y: number,
  squareSize: number,
): Square {
  const file = clampIndex(Math.floor(x / squareSize));
  const rankFromTop = clampIndex(Math.floor(y / squareSize));
  const fileChar = String.fromCharCode(65 + file);
  const squareRank = 8 - rankFromTop;
  return `${fileChar}${squareRank}` as Square;
}

export function isPlayerPiece(
  code: PieceCode,
  playerColor: "white" | "black",
): boolean {
  const isWhite = code === code.toUpperCase();
  return playerColor === "white" ? isWhite : !isWhite;
}

function createPieceId(code: PieceCode, square: Square): PieceId {
  return `${normalize(square)}:${code}`;
}

export function piecesMapToSquareMap(pieces: PiecesMap): SquarePieces {
  const map: SquarePieces = {};

  for (const [square, code] of Object.entries(pieces)) {
    if (!code) continue;
    const sq = normalize(square);
    map[sq] = {
      id: createPieceId(code, sq),
      code,
      square: sq,
    };
  }

  return map;
}

export function listPieceEntities(map: SquarePieces): PieceEntity[] {
  return Object.values(map).filter((entity): entity is PieceEntity => !!entity);
}

export function piecesMapToEntities(pieces: PiecesMap): PieceEntity[] {
  return listPieceEntities(piecesMapToSquareMap(pieces));
}


export function getMovingPieceIds(
  map: SquarePieces,
  event: MoveEvent,
): PieceId[] {
  const ids: PieceId[] = [];
  const mover = map[normalize(event.from)];
  if (mover) ids.push(mover.id);

  if (event.kind === "castle" && event.rookFrom) {
    const rook = map[normalize(event.rookFrom)];
    if (rook) ids.push(rook.id);
  }

  return ids;
}

/** Piece that will leave the board for this event (capture / en passant / promo capture). */
export function getCapturedPieceEntity(
  map: SquarePieces,
  event: MoveEvent,
): PieceEntity | null {
  if (event.kind === "enPassant") {
    const from = normalize(event.from);
    const to = normalize(event.to);
    const capturedSquare = `${to[0]}${rank(from)}` as Square;
    return map[normalize(capturedSquare)] ?? null;
  }

  if (
    (event.kind === "capture" || event.kind === "promotion") &&
    event.captured
  ) {
    return map[normalize(event.to)] ?? null;
  }

  return null;
}

function moveEntity(
  map: SquarePieces,
  from: Square,
  to: Square,
  nextCode?: PieceCode,
): void {
  const fromSq = normalize(from);
  const toSq = normalize(to);
  const entity = map[fromSq];

  if (!entity) {
    throw new Error(`applyMoveToSquareMap: no piece on ${fromSq}`);
  }

  delete map[fromSq];
  map[toSq] = {
    ...entity,
    square: toSq,
    code: nextCode ?? entity.code,
  };
}

function removeEntity(map: SquarePieces, square: Square): void {
  delete map[normalize(square)];
}

export function applyMoveToSquareMap(
  map: SquarePieces,
  event: MoveEvent,
): SquarePieces {
  const next: SquarePieces = { ...map };
  const from = normalize(event.from);
  const to = normalize(event.to);

  switch (event.kind) {
    case "quiet": {
      moveEntity(next, from, to);
      break;
    }
    case "capture": {
      removeEntity(next, to);
      moveEntity(next, from, to);
      break;
    }
    case "enPassant": {
      const capturedSquare = `${to[0]}${rank(from)}` as Square;
      removeEntity(next, capturedSquare);
      moveEntity(next, from, to);
      break;
    }
    case "castle": {
      if (!event.rookFrom || !event.rookTo) {
        throw new Error("applyMoveToSquareMap: castle missing rook squares");
      }
      moveEntity(next, from, to);
      moveEntity(next, event.rookFrom, event.rookTo);
      break;
    }
    case "promotion": {
      if (event.captured) {
        removeEntity(next, to);
      }
      moveEntity(next, from, to, event.promotedTo);
      break;
    }
    default: {
      const _exhaustive: never = event.kind;
      throw new Error(`applyMoveToSquareMap: unknown kind ${_exhaustive}`);
    }
  }

  return next;
}

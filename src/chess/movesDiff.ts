import type { BoardConfig, PieceCode, Square } from "js-chess-engine";

import type { MoveEvent } from "./types";

function normalize(square: Square): Square {
  return square.toUpperCase();
}

function fileIndex(square: Square): number {
  return normalize(square).charCodeAt(0) - 65; // A=0
}

function rank(square: Square): number {
  return Number(normalize(square)[1]);
}

function isPawn(piece: PieceCode): boolean {
  return piece === "P" || piece === "p";
}

function isKing(piece: PieceCode): boolean {
  return piece === "K" || piece === "k";
}

function getPiece(
  pieces: BoardConfig["pieces"],
  square: Square,
): PieceCode | undefined {
  const key = normalize(square);
  return pieces[key] ?? pieces[square];
}

function castleRookSquares(
  from: Square,
  to: Square,
): { rookFrom: Square; rookTo: Square } {
  const toFile = normalize(to)[0];
  const r = normalize(from)[1];

  // Short castle
  if (toFile === "G") {
    return { rookFrom: `H${r}`, rookTo: `F${r}` };
  }

  // Long castle
  return { rookFrom: `A${r}`, rookTo: `D${r}` };
}

export function classifyMove(
  before: BoardConfig,
  after: BoardConfig,
  from: Square,
  to: Square,
): MoveEvent {
  const fromSq = normalize(from);
  const toSq = normalize(to);
  const piece = getPiece(before.pieces, fromSq);

  if (!piece) {
    throw new Error(`classifyMove: no piece on ${fromSq}`);
  }

  const targetBefore = getPiece(before.pieces, toSq);
  const pieceAfter = getPiece(after.pieces, toSq);
  const fileDiff = Math.abs(fileIndex(fromSq) - fileIndex(toSq));

  if (isKing(piece) && fileDiff === 2) {
    const { rookFrom, rookTo } = castleRookSquares(fromSq, toSq);
    return {
      from: fromSq,
      to: toSq,
      kind: "castle",
      piece,
      rookFrom,
      rookTo,
    };
  }

  const enPassantTarget = before.enPassant ? normalize(before.enPassant) : null;
  if (
    isPawn(piece) &&
    fileDiff === 1 &&
    !targetBefore &&
    enPassantTarget === toSq
  ) {
    const capturedSquare = `${toSq[0]}${rank(fromSq)}` as Square;
    const captured = getPiece(before.pieces, capturedSquare);
    return {
      from: fromSq,
      to: toSq,
      kind: "enPassant",
      piece,
      captured,
    };
  }

  const toRank = rank(toSq);
  if (isPawn(piece) && (toRank === 8 || toRank === 1)) {
    return {
      from: fromSq,
      to: toSq,
      kind: "promotion",
      piece,
      captured: targetBefore,
      promotedTo: pieceAfter,
    };
  }

  if (targetBefore) {
    return {
      from: fromSq,
      to: toSq,
      kind: "capture",
      piece,
      captured: targetBefore,
    };
  }

  return {
    from: fromSq,
    to: toSq,
    kind: "quiet",
    piece,
  };
}

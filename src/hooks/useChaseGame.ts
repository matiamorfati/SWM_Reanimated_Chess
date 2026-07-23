import { useCallback, useRef, useState } from "react";
import type { AiLevel, BoardConfig, Color, Square } from "js-chess-engine";

import {
  applyMoveToSquareMap,
  createChessEngine,
  getCapturedPieceEntity,
  getMovingPieceIds,
  isPlayerPiece,
  piecesMapToSquareMap,
  type GameResult,
  type MoveEvent,
  type PieceEntity,
  type PieceId,
  type PieceMotion,
  type PieceMotionSource,
  type SquarePieces,
} from "@/chess";

type Params = {
  difficulty: AiLevel;
  playerColor?: Color;
  onGameOver?: (result: Exclude<GameResult, null>) => void;
  onMove?: (move: MoveEvent) => void;
};

function normalizeSquare(square: Square): Square {
  return square.toUpperCase() as Square;
}

export function useChaseGame({
  difficulty,
  playerColor = "white",
  onGameOver,
  onMove,
}: Params) {
  const engineRef = useRef(createChessEngine());
  const squarePiecesRef = useRef<SquarePieces>(
    piecesMapToSquareMap(engineRef.current.getBoard().pieces),
  );

  const [board, setBoard] = useState<BoardConfig>(() =>
    engineRef.current.getBoard(),
  );
  const [squarePieces, setSquarePieces] = useState<SquarePieces>(
    () => squarePiecesRef.current,
  );
  const [pieceMotion, setPieceMotion] = useState<PieceMotion | null>(null);
  const [fadingPieces, setFadingPieces] = useState<PieceEntity[]>([]);
  const [selected, setSelected] = useState<Square | null>(null);
  const [legalTargets, setLegalTargets] = useState<Square[]>([]);
  const [dropTarget, setDropTarget] = useState<Square | null>(null);
  const [busy, setBusy] = useState(false);
  const legalTargetsRef = useRef<Square[]>([]);

  const canInteract =
    !busy && (board.turn ?? "white") === playerColor;

  const clearSelection = useCallback(() => {
    legalTargetsRef.current = [];
    setSelected(null);
    setLegalTargets([]);
    setDropTarget(null);
  }, []);

  const finishIfNeeded = useCallback(() => {
    const result = engineRef.current.getResult(playerColor);
    if (result) onGameOver?.(result);
  }, [onGameOver, playerColor]);

  const commitMove = useCallback(
    (event: MoveEvent, nextBoard: BoardConfig, source: PieceMotionSource) => {
      onMove?.(event);

      const prev = squarePiecesRef.current;
      const ids = getMovingPieceIds(prev, event);
      const captured = getCapturedPieceEntity(prev, event);
      const nextPieces = applyMoveToSquareMap(prev, event);
      squarePiecesRef.current = nextPieces;

      setPieceMotion({ ids, source });
      setSquarePieces(nextPieces);
      setBoard(nextBoard);
      if (captured) {
        setFadingPieces((list) => [...list, captured]);
      }
    },
    [onMove],
  );

  const completeFadeOut = useCallback((id: PieceId) => {
    setFadingPieces((list) => list.filter((piece) => piece.id !== id));
  }, []);

  const applyPlayerMove = useCallback(
    (from: Square, to: Square) => {
      const result = engineRef.current.tryMove(from, to);
      if (!result.ok) return false;

      commitMove(result.event, result.board, "player");
      clearSelection();
      finishIfNeeded();
      return true;
    },
    [clearSelection, commitMove, finishIfNeeded],
  );

  const playAiTurn = useCallback(() => {
    if (engineRef.current.getResult(playerColor)) return;

    setBusy(true);

    const delayMs = 1000 + Math.random() * 1000;

    setTimeout(() => {
      const ai = engineRef.current.playAi(difficulty);
      commitMove(ai.event, ai.board, "ai");
      setBusy(false);
      finishIfNeeded();
    }, delayMs);
  }, [commitMove, difficulty, finishIfNeeded, playerColor]);

  const selectOwnPiece = useCallback(
    (square: Square) => {
      const sq = normalizeSquare(square);
      const piece = board.pieces[sq] ?? board.pieces[square];
      if (!piece || !isPlayerPiece(piece, playerColor)) {
        clearSelection();
        return false;
      }

      const moves = engineRef.current.getLegalMoves(sq);
      if (!Array.isArray(moves)) return false;

      const targets = moves.map(normalizeSquare);
      legalTargetsRef.current = targets;
      setSelected(sq);
      setLegalTargets(targets);
      setDropTarget(null);
      return true;
    },
    [board.pieces, clearSelection, playerColor],
  );

  const beginDrag = useCallback(
    (square: Square) => {
      if (!canInteract) return false;
      return selectOwnPiece(square);
    },
    [canInteract, selectOwnPiece],
  );

  const updateDropTarget = useCallback((square: Square | null) => {
    if (!square) {
      setDropTarget((prev) => (prev === null ? prev : null));
      return;
    }
    const sq = normalizeSquare(square);
    const next = legalTargetsRef.current.includes(sq) ? sq : null;
    setDropTarget((prev) => (prev === next ? prev : next));
  }, []);

  const completeDrag = useCallback(
    (from: Square, to: Square | null) => {
      setDropTarget(null);
      if (!to) return false;

      const moved = applyPlayerMove(normalizeSquare(from), normalizeSquare(to));
      if (moved) playAiTurn();
      return moved;
    },
    [applyPlayerMove, playAiTurn],
  );

  const onSquarePress = useCallback(
    (square: Square) => {
      if (!canInteract) return;

      const sq = normalizeSquare(square);

      if (selected) {
        if (sq === selected) {
          clearSelection();
          return;
        }

        const moved = applyPlayerMove(selected, sq);
        if (moved) {
          playAiTurn();
          return;
        }
      }

      selectOwnPiece(sq);
    },
    [
      applyPlayerMove,
      canInteract,
      clearSelection,
      playAiTurn,
      selectOwnPiece,
      selected,
    ],
  );

  return {
    board,
    squarePieces,
    pieceMotion,
    fadingPieces,
    selected,
    legalTargets,
    dropTarget,
    busy,
    canInteract,
    playerColor,
    onSquarePress,
    beginDrag,
    updateDropTarget,
    completeDrag,
    completeFadeOut,
  };
}

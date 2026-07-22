import { useCallback, useRef, useState } from "react";
import type { AiLevel, BoardConfig, Square } from "js-chess-engine";

import { createChessEngine } from "@/chess/engine";
import type { GameResult, MoveEvent } from "@/chess";

type Params = {
  difficulty: AiLevel;
  playerColor?: "white" | "black";
  onGameOver?: (result: Exclude<GameResult, null>) => void;
  onMove?: (move: MoveEvent) => void;
};

export function useChaseGame({
  difficulty,
  playerColor = "white",
  onGameOver,
  onMove,
}: Params) {
  const engineRef = useRef(createChessEngine());

  const [board, setBoard] = useState<BoardConfig>(() =>
    engineRef.current.getBoard(),
  );
  const [selected, setSelected] = useState<Square | null>(null);
  const [legalTargets, setLegalTargets] = useState<Square[]>([]);
  const [busy, setBusy] = useState(false);

  const clearSelection = useCallback(() => {
    setSelected(null);
    setLegalTargets([]);
  }, []);

  const finishIfNeeded = useCallback(() => {
    const result = engineRef.current.getResult(playerColor);
    if (result) onGameOver?.(result);
  }, [onGameOver, playerColor]);

  const applyPlayerMove = useCallback(
    (from: Square, to: Square) => {
      const result = engineRef.current.tryMove(from, to);
      if (!result.ok) return false;

      onMove?.(result.event);
      setBoard(result.board);
      clearSelection();
      finishIfNeeded();
      return true;
    },
    [clearSelection, finishIfNeeded, onMove],
  );

  const playAiTurn = useCallback(() => {
    if (engineRef.current.getResult(playerColor)) return;

    setBusy(true);

    Promise.resolve().then(() => {
      const ai = engineRef.current.playAi(difficulty);
      onMove?.(ai.event);
      setBoard(ai.board);
      setBusy(false);
      finishIfNeeded();
    });
  }, [difficulty, finishIfNeeded, onMove, playerColor]);

  const onSquarePress = useCallback(
    (square: Square) => {
      if (busy) return;

      const engine = engineRef.current;
      if (board.turn !== playerColor) return;

      if (selected) {
        if (square === selected) {
          clearSelection();
          return;
        }

        const moved = applyPlayerMove(selected, square);
        if (moved) {
          playAiTurn();
          return;
        }
      }

      const piece = board.pieces[square] ?? board.pieces[square.toUpperCase()];
      if (!piece) {
        clearSelection();
        return;
      }

      const isWhitePiece = piece === piece.toUpperCase();
      const isMine =
        (playerColor === "white" && isWhitePiece) ||
        (playerColor === "black" && !isWhitePiece);

      if (!isMine) {
        clearSelection();
        return;
      }

      const moves = engine.getLegalMoves(square);
      if (!Array.isArray(moves)) return;

      setSelected(square);
      setLegalTargets(moves);
    },
    [
      applyPlayerMove,
      board.pieces,
      board.turn,
      busy,
      clearSelection,
      playAiTurn,
      playerColor,
      selected,
    ],
  );

  return {
    board,
    selected,
    legalTargets,
    busy,
    onSquarePress,
  };
}

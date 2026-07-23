import type { FC } from "react";
import type { PieceCode } from "js-chess-engine";
import type { SvgProps } from "react-native-svg";

import BlackBishop from "../../assets/pieces/black/Chess_bdt45.svg";
import BlackKing from "../../assets/pieces/black/Chess_kdt45.svg";
import BlackKnight from "../../assets/pieces/black/Chess_ndt45.svg";
import BlackPawn from "../../assets/pieces/black/Chess_pdt45.svg";
import BlackQueen from "../../assets/pieces/black/Chess_qdt45.svg";
import BlackRook from "../../assets/pieces/black/Chess_rdt45.svg";
import WhiteBishop from "../../assets/pieces/white/Chess_blt45.svg";
import WhiteKing from "../../assets/pieces/white/Chess_klt45.svg";
import WhiteKnight from "../../assets/pieces/white/Chess_nlt45.svg";
import WhitePawn from "../../assets/pieces/white/Chess_plt45.svg";
import WhiteQueen from "../../assets/pieces/white/Chess_qlt45.svg";
import WhiteRook from "../../assets/pieces/white/Chess_rlt45.svg";

export type PieceIcon = FC<SvgProps>;

export const PIECE_CODE_MAP: Record<PieceCode, PieceIcon> = {
  K: WhiteKing,
  Q: WhiteQueen,
  R: WhiteRook,
  B: WhiteBishop,
  N: WhiteKnight,
  P: WhitePawn,
  k: BlackKing,
  q: BlackQueen,
  r: BlackRook,
  b: BlackBishop,
  n: BlackKnight,
  p: BlackPawn,
};

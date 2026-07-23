import { useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { Square } from "js-chess-engine";

import type { PieceEntity, PieceId, PieceMotionSource } from "@/chess";
import { squareToXY, xyToSquare } from "@/chess";

import { Piece } from "./Piece";

const CAPTURE_FADE_MS = 500;

type Props = {
  entity: PieceEntity;
  squareSize: number;
  boardSize: number;
  draggable?: boolean;
  motionSource?: PieceMotionSource | null;
  fadeOut?: boolean;
  zIndex?: number;
  onDragStart?: (square: Square) => boolean;
  onDragHover?: (square: Square | null) => void;
  onDragEnd?: (from: Square, to: Square | null) => boolean;
  onFadeOutComplete?: (id: PieceId) => void;
};

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(max, Math.max(min, value));
}

const SOFT_DROP_SPRING = { damping: 16, stiffness: 140, mass: 0.8 };

export function AnimatedPiece({
  entity,
  squareSize,
  boardSize,
  draggable = false,
  motionSource = null,
  fadeOut = false,
  zIndex = 0,
  onDragStart,
  onDragHover,
  onDragEnd,
  onFadeOutComplete,
}: Props) {
  const initial = squareToXY(entity.square, squareSize);
  const translateX = useSharedValue(initial.x);
  const translateY = useSharedValue(initial.y);
  const originX = useSharedValue(initial.x);
  const originY = useSharedValue(initial.y);
  const dragScale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const isDragging = useSharedValue(false);

  const panActiveRef = useRef(false);
  const dragFromRef = useRef<Square>(entity.square);
  const squareSizeRef = useRef(squareSize);
  squareSizeRef.current = squareSize;

  const callbacksRef = useRef({
    onDragStart,
    onDragHover,
    onDragEnd,
    square: entity.square,
  });
  callbacksRef.current = {
    onDragStart,
    onDragHover,
    onDragEnd,
    square: entity.square,
  };

  useEffect(() => {
    if (!fadeOut) return;

    opacity.value = withTiming(0, { duration: CAPTURE_FADE_MS }, (finished) => {
      if (finished && onFadeOutComplete) {
        runOnJS(onFadeOutComplete)(entity.id);
      }
    });
  }, [entity.id, fadeOut, onFadeOutComplete, opacity]);

  useEffect(() => {
    if (panActiveRef.current || fadeOut) return;

    const { x, y } = squareToXY(entity.square, squareSize);
    originX.value = x;
    originY.value = y;

    if (motionSource === "player") {
      translateX.value = withSpring(x, SOFT_DROP_SPRING);
      translateY.value = withSpring(y, SOFT_DROP_SPRING);
      return;
    }

    translateX.value = x;
    translateY.value = y;
  }, [
    entity.square,
    squareSize,
    motionSource,
    fadeOut,
    translateX,
    translateY,
    originX,
    originY,
  ]);

  const gesture = useMemo(() => {
    const selectOnly = () => {
      callbacksRef.current.onDragStart?.(callbacksRef.current.square);
    };

    const beginPan = () => {
      const { square, onDragStart: start } = callbacksRef.current;
      dragFromRef.current = square;
      panActiveRef.current = true;
      start?.(square);
    };

    const hoverAt = (x: number, y: number) => {
      const square = xyToSquare(x, y, squareSizeRef.current);
      callbacksRef.current.onDragHover?.(square);
    };

    const endPan = (centerX: number, centerY: number) => {
      if (!panActiveRef.current) return;
      panActiveRef.current = false;

      const size = squareSizeRef.current;
      const to = xyToSquare(centerX, centerY, size);
      const from = dragFromRef.current;
      const moved = callbacksRef.current.onDragEnd?.(from, to) ?? false;

      if (moved) {
        const dest = squareToXY(to, size);
        // Soft-drop: glide from release point to square center (don't teleport).
        translateX.value = withSpring(dest.x, SOFT_DROP_SPRING);
        translateY.value = withSpring(dest.y, SOFT_DROP_SPRING);
        originX.value = dest.x;
        originY.value = dest.y;
      } else {
        translateX.value = withSpring(originX.value, SOFT_DROP_SPRING);
        translateY.value = withSpring(originY.value, SOFT_DROP_SPRING);
      }

      dragScale.value = withSpring(1);
      callbacksRef.current.onDragHover?.(null);
    };

    const pan = Gesture.Pan()
      .enabled(draggable)
      .minDistance(4)
      .onStart(() => {
        isDragging.value = true;
        originX.value = translateX.value;
        originY.value = translateY.value;
        dragScale.value = withSpring(1.08);
        runOnJS(beginPan)();
      })
      .onUpdate((event) => {
        const max = boardSize - squareSize;
        const nextX = clamp(originX.value + event.translationX, 0, max);
        const nextY = clamp(originY.value + event.translationY, 0, max);
        translateX.value = nextX;
        translateY.value = nextY;
        runOnJS(hoverAt)(nextX + squareSize / 2, nextY + squareSize / 2);
      })
      .onFinalize(() => {
        if (!isDragging.value) return;
        const centerX = translateX.value + squareSize / 2;
        const centerY = translateY.value + squareSize / 2;
        isDragging.value = false;
        runOnJS(endPan)(centerX, centerY);
      });

    const tap = Gesture.Tap()
      .enabled(draggable)
      .onEnd(() => {
        runOnJS(selectOnly)();
      });

    return Gesture.Exclusive(pan, tap);
  }, [
    boardSize,
    draggable,
    dragScale,
    isDragging,
    originX,
    originY,
    squareSize,
    translateX,
    translateY,
  ]);

  const aiAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: withTiming(translateX.value, { duration: 500 }) },
      { translateY: withTiming(translateY.value, { duration: 500 }) },
      { scale: dragScale.value },
    ],
    zIndex: isDragging.value ? 20 : zIndex,
  }));

  const playerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: dragScale.value },
    ],
    zIndex: isDragging.value ? 20 : zIndex,
  }));

  const animatedStyle =
    motionSource === "ai" ? aiAnimatedStyle : playerAnimatedStyle;

  const body = (
    <Animated.View
      pointerEvents={draggable ? "auto" : "none"}
      style={[
        styles.slot,
        { width: squareSize, height: squareSize },
        animatedStyle,
      ]}
    >
      <Piece code={entity.code} size={squareSize} />
    </Animated.View>
  );

  if (!draggable) {
    return body;
  }

  return <GestureDetector gesture={gesture}>{body}</GestureDetector>;
}

const styles = StyleSheet.create({
  slot: {
    position: "absolute",
    left: 0,
    top: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});

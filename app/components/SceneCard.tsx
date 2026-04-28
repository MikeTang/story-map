"use client";

import { useRef, useEffect, useCallback } from "react";

export interface SceneCardData {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
  tilt: number;
  /** CSS gradient string for the pin */
  pinColor: string;
  /** Use tape instead of pin */
  useTape?: boolean;
  zIndex: number;
}

interface SceneCardProps {
  card: SceneCardData;
  onMove: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
}

export default function SceneCard({
  card,
  onMove,
  onDelete,
  onBringToFront,
}: SceneCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  // Drag state lives in a ref so pointer event handlers always see the latest
  // values without triggering extra re-renders.
  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
  });

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Don't start a drag when the user clicks the delete button (or any
      // child of it, e.g. the ✕ text node's parent).
      if ((e.target as HTMLElement).closest(".delete-btn")) return;
      e.preventDefault();
      onBringToFront(card.id);
      drag.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        startLeft: card.x,
        startTop: card.y,
      };
      cardRef.current?.setPointerCapture(e.pointerId);
      cardRef.current?.classList.add("dragging");
    },
    [card.id, card.x, card.y, onBringToFront]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.startX;
      const dy = e.clientY - drag.current.startY;
      onMove(card.id, drag.current.startLeft + dx, drag.current.startTop + dy);
    },
    [card.id, onMove]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag.current.active) return;
      drag.current.active = false;
      cardRef.current?.releasePointerCapture(e.pointerId);
      cardRef.current?.classList.remove("dragging");
    },
    []
  );

  // Keep drag.current start coords in sync when card position changes
  // from outside (e.g. initial placement), but only while not dragging.
  useEffect(() => {
    if (!drag.current.active) {
      drag.current.startLeft = card.x;
      drag.current.startTop = card.y;
    }
  }, [card.x, card.y]);

  return (
    <div
      ref={cardRef}
      className="index-card"
      style={{
        width: 205,
        left: card.x,
        top: card.y,
        // @ts-expect-error CSS custom property
        "--tilt": `${card.tilt}deg`,
        transform: `rotate(${card.tilt}deg)`,
        zIndex: card.zIndex,
        padding: "28px 14px 16px",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {card.useTape ? (
        <div className="tape" />
      ) : (
        <div className="pin" style={{ background: card.pinColor }} />
      )}
      {/* Delete button — visible on card hover via CSS (.index-card:hover .delete-btn) */}
      <button
        className="delete-btn"
        aria-label={`Delete scene: ${card.title}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(card.id);
        }}
      >
        ✕
      </button>
      <div className="card-title">{card.title}</div>
      <div className="card-desc">{card.description}</div>
    </div>
  );
}

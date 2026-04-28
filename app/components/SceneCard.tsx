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
  onEdit: (id: string, field: "title" | "description", value: string) => void;
}

export default function SceneCard({
  card,
  onMove,
  onDelete,
  onBringToFront,
  onEdit,
}: SceneCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  // Drag state lives in a ref so pointer event handlers always see the latest
  // values without triggering extra re-renders.
  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
  });

  // Track whether we're currently editing so we can suppress drag initiation.
  const editingRef = useRef(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Don't start a drag when the user clicks the delete button or an
      // editable field.
      if ((e.target as HTMLElement).closest(".delete-btn")) return;
      if ((e.target as HTMLElement).closest(".card-editable")) return;
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

  // Sync DOM content when the card data changes externally (e.g. initial load).
  // We only update if the element isn't currently focused to avoid clobbering
  // an in-progress edit.
  useEffect(() => {
    if (titleRef.current && document.activeElement !== titleRef.current) {
      titleRef.current.textContent = card.title;
    }
  }, [card.title]);

  useEffect(() => {
    if (descRef.current && document.activeElement !== descRef.current) {
      descRef.current.textContent = card.description;
    }
  }, [card.description]);

  // Commit an edit on blur. Reverts to the previous value if the user clears
  // the field entirely.
  const handleTitleBlur = useCallback(() => {
    editingRef.current = false;
    const raw = titleRef.current?.textContent?.trim() ?? "";
    const next = raw || card.title; // revert if empty
    if (titleRef.current) titleRef.current.textContent = next;
    if (next !== card.title) onEdit(card.id, "title", next);
  }, [card.id, card.title, onEdit]);

  const handleDescBlur = useCallback(() => {
    editingRef.current = false;
    const raw = descRef.current?.textContent?.trim() ?? "";
    const next = raw || card.description; // revert if empty
    if (descRef.current) descRef.current.textContent = next;
    if (next !== card.description) onEdit(card.id, "description", next);
  }, [card.id, card.description, onEdit]);

  // Pressing Enter in the title field moves focus to description; Escape blurs.
  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        descRef.current?.focus();
      } else if (e.key === "Escape") {
        // Revert and blur
        if (titleRef.current) titleRef.current.textContent = card.title;
        titleRef.current?.blur();
      }
    },
    [card.title]
  );

  // Pressing Escape in the description field reverts and blurs.
  const handleDescKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        if (descRef.current) descRef.current.textContent = card.description;
        descRef.current?.blur();
      }
    },
    [card.description]
  );

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

      {/*
        Title — contentEditable.
        card-editable class is used by onPointerDown to skip drag initiation
        when the user clicks directly on an editable field.
      */}
      <div
        ref={titleRef}
        className="card-title card-editable"
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onFocus={() => {
          editingRef.current = true;
          onBringToFront(card.id);
        }}
        onBlur={handleTitleBlur}
        onKeyDown={handleTitleKeyDown}
        // Prevent pointer events from bubbling to the drag handler
        onPointerDown={(e) => e.stopPropagation()}
        style={{ cursor: "text", outline: "none", minHeight: "28px" }}
        title="Click to edit title"
      />

      {/* Description — contentEditable */}
      <div
        ref={descRef}
        className="card-desc card-editable"
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onFocus={() => {
          editingRef.current = true;
          onBringToFront(card.id);
        }}
        onBlur={handleDescBlur}
        onKeyDown={handleDescKeyDown}
        onPointerDown={(e) => e.stopPropagation()}
        style={{ cursor: "text", outline: "none", minHeight: "28px" }}
        title="Click to edit description"
      />
    </div>
  );
}

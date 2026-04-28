"use client";

import { useState, useCallback, useRef } from "react";
import SceneCard, { SceneCardData } from "./SceneCard";
import AddSceneModal from "./AddSceneModal";

// Tilts cycle through these values to give each card a slightly different angle
const TILTS = [-2, 1.5, -1, 2.5, -3, 1, -1.5, 2, -0.5, 3];

const INITIAL_CARDS: SceneCardData[] = [
  {
    id: "1",
    title: "Opening Scene",
    description: "Elena finds the locked box in her grandmother's attic. Rain. A single candle.",
    x: 60, y: 100, tilt: -2,
    pinColor: "linear-gradient(135deg,#e05555,#b03030)",
    zIndex: 10,
  },
  {
    id: "2",
    title: "The Letter",
    description: "Inside the box: a letter from 1943. Name crossed out. Two dates circled in red ink.",
    x: 295, y: 85, tilt: 1.5,
    pinColor: "linear-gradient(135deg,#4a90d9,#2563a8)",
    zIndex: 11,
  },
  {
    id: "3",
    title: "Market District",
    description: "Elena follows the address. A shop that shouldn't still exist. Old man won't meet her eyes.",
    x: 540, y: 110, tilt: -1,
    pinColor: "",
    useTape: true,
    zIndex: 9,
  },
  {
    id: "4",
    title: "Confrontation",
    description: "She returns at night. The shop is open. Someone else is already there.",
    x: 770, y: 90, tilt: 2.5,
    pinColor: "linear-gradient(135deg,#6ab04c,#3d7a27)",
    zIndex: 10,
  },
];

export default function Corkboard() {
  const [cards, setCards] = useState<SceneCardData[]>(INITIAL_CARDS);
  const [modalOpen, setModalOpen] = useState(false);
  // Global z-index counter so bringing-to-front always wins
  const zCounter = useRef(100);

  const handleMove = useCallback((id: string, x: number, y: number) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, x, y } : c))
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleBringToFront = useCallback((id: string) => {
    zCounter.current += 1;
    const z = zCounter.current;
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, zIndex: z } : c))
    );
  }, []);

  const handleAdd = useCallback(
    (title: string, description: string, pinColor: string) => {
      // Place randomly in the visible board area (card is 205px wide, ~180px tall)
      const boardW = typeof window !== "undefined" ? window.innerWidth : 1200;
      const boardH = typeof window !== "undefined" ? window.innerHeight - 56 : 700;
      const x = 80 + Math.random() * Math.max(0, boardW - 320);
      const y = 80 + Math.random() * Math.max(0, boardH - 280);
      const tilt = TILTS[Math.floor(Math.random() * TILTS.length)];
      zCounter.current += 1;
      const newCard: SceneCardData = {
        id: crypto.randomUUID(),
        title,
        description,
        x,
        y,
        tilt,
        pinColor,
        zIndex: zCounter.current,
      };
      setCards((prev) => [...prev, newCard]);
    },
    []
  );

  const sceneCount = cards.length;

  return (
    <>
      {/* Top bar */}
      <div className="topbar fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <span style={{ fontSize: "1.25rem" }}>📌</span>
          <div>
            <h1
              style={{
                fontFamily: "'Caveat', cursive",
                fontWeight: 700,
                fontSize: "1.4rem",
                color: "#fdf6e3",
                lineHeight: 1,
              }}
            >
              Story Map
            </h1>
            <p className="scene-count">
              {sceneCount} {sceneCount === 1 ? "scene pinned" : "scenes pinned"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "0.9rem",
              color: "#c9a86c",
              opacity: 0.8,
            }}
          >
            The Glass Meridian — Act II
          </div>
          <button
            className="add-btn flex items-center gap-2 px-4 py-2 rounded-sm"
            onClick={() => setModalOpen(true)}
          >
            <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>+</span>
            New Scene
          </button>
        </div>
      </div>

      {/* Corkboard */}
      <div
        className="corkboard w-full h-full pt-14"
        style={{ position: "relative", overflow: "hidden" }}
      >
        {cards.map((card) => (
          <SceneCard
            key={card.id}
            card={card}
            onMove={handleMove}
            onDelete={handleDelete}
            onBringToFront={handleBringToFront}
          />
        ))}
      </div>

      {/* Modal */}
      <AddSceneModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
      />
    </>
  );
}

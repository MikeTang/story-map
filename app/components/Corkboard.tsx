"use client";

import { useState, useCallback, useRef } from "react";
import SceneCard, { SceneCardData } from "./SceneCard";
import AddSceneModal from "./AddSceneModal";

// Tilts cycle through these values to give each card a slightly different angle
const TILTS = [-2, 1.5, -1, 2.5, -3, 1, -1.5, 2, -0.5, 3];

// Pin-color options — kept in sync with AddSceneModal's picker.
const PIN_GRADIENTS = [
  "linear-gradient(135deg,#e05555,#b03030)",
  "linear-gradient(135deg,#4a90d9,#2563a8)",
  "linear-gradient(135deg,#6ab04c,#3d7a27)",
  "linear-gradient(135deg,#f0a500,#c07800)",
  "linear-gradient(135deg,#c46ebb,#8e3a99)",
];

// Sample cards shown on first load so the board doesn't feel empty.
// These match the eight scenes from the design mockup.
const INITIAL_CARDS: SceneCardData[] = [
  {
    id: "1",
    title: "Opening Scene",
    description:
      "Elena finds the locked box in her grandmother's attic. Rain. A single candle.",
    x: 60,
    y: 100,
    tilt: -2,
    pinColor: PIN_GRADIENTS[0],
    zIndex: 10,
  },
  {
    id: "2",
    title: "The Letter",
    description:
      "Inside the box: a letter from 1943. Name crossed out. Two dates circled in red ink.",
    x: 295,
    y: 85,
    tilt: 1.5,
    pinColor: PIN_GRADIENTS[1],
    zIndex: 11,
  },
  {
    id: "3",
    title: "Market District",
    description:
      "Elena follows the address. A shop that shouldn't still exist. Old man won't meet her eyes.",
    x: 540,
    y: 110,
    tilt: -1,
    pinColor: "",
    useTape: true,
    zIndex: 9,
  },
  {
    id: "4",
    title: "Confrontation",
    description:
      "She returns at night. The shop is open. Someone else is already there.",
    x: 770,
    y: 90,
    tilt: 2.5,
    pinColor: PIN_GRADIENTS[2],
    zIndex: 10,
  },
  {
    id: "5",
    title: "The Archive",
    description:
      "City records. 1943 directory lists the shop owner — same name as the letter. Impossible.",
    x: 80,
    y: 310,
    tilt: 1,
    pinColor: PIN_GRADIENTS[3],
    zIndex: 8,
  },
  {
    id: "6",
    title: "Phone Call",
    description:
      "Unknown number. Breathing. Then: \"You found the box. Stop now.\"",
    x: 330,
    y: 295,
    tilt: -1.5,
    pinColor: PIN_GRADIENTS[4],
    zIndex: 12,
  },
  {
    id: "7",
    title: "The Photograph",
    description:
      "Hidden inside the letter's envelope: a photograph. Elena's grandmother. Younger. Standing beside a man Elena has already met this week.",
    x: 570,
    y: 315,
    tilt: 2,
    pinColor: PIN_GRADIENTS[0],
    zIndex: 9,
  },
  {
    id: "8",
    title: "Meridian",
    description:
      "The shop again — but the street is different. The city it's on didn't exist until 1987.",
    x: 810,
    y: 305,
    tilt: -0.5,
    pinColor: "",
    useTape: true,
    zIndex: 7,
  },
];

export default function Corkboard() {
  const [cards, setCards] = useState<SceneCardData[]>(INITIAL_CARDS);
  const [modalOpen, setModalOpen] = useState(false);
  // Global z-index counter so bringing-to-front always wins.
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
      // Place the new card randomly within the visible board area.
      // Card dimensions: ~205px wide, ~180px tall. Top bar is 56px.
      const boardW = window.innerWidth;
      const boardH = window.innerHeight - 56;
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

  const handleEdit = useCallback(
    (id: string, field: "title" | "description", value: string) => {
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
      );
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
              Story Map (Stage)
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
            onEdit={handleEdit}
          />
        ))}
      </div>

      {/* Add Scene Modal */}
      <AddSceneModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
      />
    </>
  );
}

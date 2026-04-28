"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const PIN_COLORS = [
  { value: "linear-gradient(135deg,#e05555,#b03030)", label: "Red" },
  { value: "linear-gradient(135deg,#4a90d9,#2563a8)", label: "Blue" },
  { value: "linear-gradient(135deg,#6ab04c,#3d7a27)", label: "Green" },
  { value: "linear-gradient(135deg,#f0a500,#c07800)", label: "Amber" },
  { value: "linear-gradient(135deg,#c46ebb,#8e3a99)", label: "Purple" },
];

interface AddSceneModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string, description: string, pinColor: string) => void;
}

export default function AddSceneModal({
  open,
  onClose,
  onAdd,
}: AddSceneModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(PIN_COLORS[0].value);

  // Auto-focus title when modal opens; reset form when it closes.
  useEffect(() => {
    if (open) {
      titleRef.current?.focus();
    } else {
      setTitle("");
      setDescription("");
      setSelectedColor(PIN_COLORS[0].value);
    }
  }, [open]);

  const handleSubmit = useCallback(() => {
    onAdd(
      title.trim() || "Untitled Scene",
      description.trim() || "No description yet.",
      selectedColor
    );
    onClose();
  }, [title, description, selectedColor, onAdd, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
    },
    [onClose, handleSubmit]
  );

  if (!open) return null;

  return (
    <div
      className="modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="modal-box w-full max-w-md p-7" role="dialog" aria-modal="true" aria-label="Add new scene">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "#2c1a00",
            }}
          >
            📌 Pin a New Scene
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ color: "#a07040", fontSize: "1.3rem", lineHeight: 1, cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="modal-title"
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "1rem",
                color: "#5a3e20",
                display: "block",
                marginBottom: 5,
                fontWeight: 600,
              }}
            >
              Scene Title
            </label>
            <input
              id="modal-title"
              ref={titleRef}
              type="text"
              className="modal-input w-full px-3 py-2 text-sm"
              placeholder="e.g. The Last Train North"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="modal-desc"
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "1rem",
                color: "#5a3e20",
                display: "block",
                marginBottom: 5,
                fontWeight: 600,
              }}
            >
              Description
            </label>
            <textarea
              id="modal-desc"
              rows={3}
              className="modal-input w-full px-3 py-2 text-sm resize-none"
              placeholder="What happens in this scene? Who's there? What changes?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Pin color */}
          <div>
            <label
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "1rem",
                color: "#5a3e20",
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Pin Color
            </label>
            <div className="flex gap-3">
              {PIN_COLORS.map((c) => (
                <button
                  key={c.value}
                  aria-label={`${c.label} pin`}
                  onClick={() => setSelectedColor(c.value)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: c.value,
                    border: `2px solid ${selectedColor === c.value ? "white" : "transparent"}`,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 2,
                background: "#e8d5b0",
                color: "#5a3e20",
                fontFamily: "'Lato', sans-serif",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="add-btn flex-1 py-2 rounded-sm text-sm"
            >
              Pin Scene
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

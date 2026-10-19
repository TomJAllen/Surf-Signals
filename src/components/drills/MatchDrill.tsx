"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import type { DrillTracking } from "./ChoiceDrill";

export interface MatchRow {
  letter: string; // shown before the slot is filled
  term: string; // revealed once the slot is filled correctly
}

export interface MatchCard {
  text: string;
  row: number; // index of the row it belongs to
}

interface MatchDrillProps {
  rows: MatchRow[];
  makeCards: () => MatchCard[]; // one card per row, already shuffled; called again on "Try again"
  intro?: string;
  trackAs?: DrillTracking;
}

interface Drag {
  card: number;
  x: number;
  y: number;
  width: number;
  offsetX: number;
  offsetY: number;
  over: number | null;
}

// Drag each statement onto the letter it belongs to: letters down the left, a slot
// for each on the right. Tapping a statement and then a slot does the same, which
// is easier on a phone and works with a keyboard. A wrong drop is counted and the
// statement goes back.
export default function MatchDrill({ rows, makeCards, intro, trackAs }: MatchDrillProps) {
  const [cards, setCards] = useState<MatchCard[]>(makeCards);
  const [placed, setPlaced] = useState<Record<number, number>>({}); // row -> card
  const [selected, setSelected] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [wrongRow, setWrongRow] = useState<number | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [announce, setAnnounce] = useState("");
  const [round, setRound] = useState(0);

  const pending = useRef<{ card: number; x: number; y: number; started: boolean; rect: DOMRect } | null>(null);
  const justDragged = useRef(false);

  const placedCards = new Set(Object.values(placed));
  const pool = cards.map((c, i) => ({ ...c, i })).filter((c) => !placedCards.has(c.i));
  const done = Object.keys(placed).length === rows.length;

  useEffect(() => {
    if (trackAs) track("drill_started", { ...trackAs, item: trackAs.item ?? null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  useEffect(() => {
    if (done && trackAs) track("drill_completed", { ...trackAs, item: trackAs.item ?? null, mistakes, total: rows.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (wrongRow === null) return;
    const t = setTimeout(() => setWrongRow(null), 700);
    return () => clearTimeout(t);
  }, [wrongRow, mistakes]);

  const place = useCallback(
    (card: number, row: number) => {
      if (placed[row] !== undefined) return;
      if (cards[card].row === row) {
        setPlaced((p) => ({ ...p, [row]: card }));
        setSelected(null);
        setAnnounce(`Correct: ${rows[row].letter}, ${rows[row].term}.`);
      } else {
        setMistakes((m) => m + 1);
        setWrongRow(row);
        setSelected(null);
        setAnnounce(`Not ${rows[row].letter}. Try another letter.`);
      }
    },
    [cards, placed, rows]
  );

  const rowAt = (x: number, y: number): number | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-slot]");
    if (!el) return null;
    const row = Number(el.dataset.slot);
    return placed[row] === undefined ? row : null;
  };

  // Dragging. With a mouse the whole card is the handle; on touch screens only the
  // grip is, so the list can still be scrolled with a finger.
  const onPointerDown = (e: React.PointerEvent<HTMLElement>, card: number) => {
    if (e.button !== 0) return;
    if (e.pointerType !== "mouse" && !(e.target as Element).closest("[data-grip]")) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    pending.current = { card, x: e.clientX, y: e.clientY, started: false, rect: el.getBoundingClientRect() };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const p = pending.current;
    if (!p) return;
    if (!p.started) {
      if (Math.hypot(e.clientX - p.x, e.clientY - p.y) < 6) return;
      p.started = true;
      setSelected(null);
    }
    e.preventDefault();
    // Scroll the page when dragging near the top or bottom edge
    const edge = 70;
    if (e.clientY < edge) window.scrollBy(0, -12);
    else if (e.clientY > window.innerHeight - edge) window.scrollBy(0, 12);
    setDrag({
      card: p.card,
      x: e.clientX,
      y: e.clientY,
      width: p.rect.width,
      offsetX: p.x - p.rect.left,
      offsetY: p.y - p.rect.top,
      over: rowAt(e.clientX, e.clientY),
    });
  };

  const endDrag = (e: React.PointerEvent<HTMLElement>, cancelled = false) => {
    const p = pending.current;
    pending.current = null;
    if (!p?.started) return;
    justDragged.current = true;
    setTimeout(() => (justDragged.current = false), 0);
    setDrag(null);
    if (cancelled) return;
    const row = rowAt(e.clientX, e.clientY);
    if (row !== null) place(p.card, row);
  };

  const restart = () => {
    setCards(makeCards());
    setPlaced({});
    setSelected(null);
    setMistakes(0);
    setWrongRow(null);
    setRound((r) => r + 1);
  };

  const Grip = () => (
    <span
      data-grip
      aria-hidden="true"
      className="shrink-0 -my-1 -ml-1 px-1 py-2 text-gray-400 cursor-grab touch-none select-none"
    >
      <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
        {[3, 10, 17].map((y) => (
          <g key={y}>
            <circle cx="3" cy={y} r="1.6" />
            <circle cx="9" cy={y} r="1.6" />
          </g>
        ))}
      </svg>
    </span>
  );

  return (
    <div className="space-y-4">
      {intro && <p className="text-gray-700">{intro}</p>}
      <p className="text-sm text-gray-500">
        Drag each card onto the letter it belongs to, or tap a card and then tap a letter.
      </p>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem] items-start">
        {/* Statements still to place */}
        {!done && (
          <div className="order-first lg:order-last sticky top-[4.5rem] z-10 lg:top-24">
            <div className="bg-sand/95 backdrop-blur rounded-lg border-2 border-ink p-3 space-y-2 max-h-[32vh] lg:max-h-[calc(100vh-8rem)] overflow-y-auto">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/70">
                {pool.length} to place · {mistakes} {mistakes === 1 ? "mistake" : "mistakes"}
              </p>
              {pool.map((c) => (
                <button
                  key={`${round}-${c.i}`}
                  type="button"
                  aria-pressed={selected === c.i}
                  onClick={() => {
                    if (justDragged.current) return;
                    setSelected((s) => (s === c.i ? null : c.i));
                  }}
                  onPointerDown={(e) => onPointerDown(e, c.i)}
                  onPointerMove={onPointerMove}
                  onPointerUp={(e) => endDrag(e)}
                  onPointerCancel={(e) => endDrag(e, true)}
                  className={`w-full flex items-start gap-2 text-left text-sm rounded-md border-2 px-3 py-2.5 transition-colors select-none lg:cursor-grab ${
                    drag?.card === c.i
                      ? "opacity-30 border-dashed border-gray-300"
                      : selected === c.i
                        ? "border-ink bg-secondary shadow-[3px_3px_0_#1C1917]"
                        : "border-ink bg-white shadow-[2px_2px_0_#1C1917] hover:bg-secondary/40"
                  }`}
                >
                  <Grip />
                  <span className="text-gray-900">{c.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Letters and slots */}
        <ol className={`space-y-2 ${done ? "lg:col-span-2" : ""}`}>
          {rows.map((r, row) => {
            const card = placed[row];
            const filled = card !== undefined;
            const over = drag?.over === row;
            const canTap = selected !== null && !filled;
            return (
              <li key={row} className="flex items-stretch gap-3">
                <span
                  className={`shrink-0 w-11 rounded-md border-2 border-ink flex items-center justify-center font-display text-2xl font-extrabold ${
                    filled ? "bg-correct text-white" : "bg-primary text-white"
                  }`}
                  aria-label={`Letter ${row + 1}: ${r.letter}`}
                >
                  {r.letter}
                </span>
                <button
                  type="button"
                  data-slot={row}
                  disabled={filled || selected === null}
                  onClick={() => selected !== null && place(selected, row)}
                  aria-label={filled ? `${r.letter}: ${r.term}. ${cards[card].text}` : `Place on letter ${row + 1}, ${r.letter}`}
                  className={`flex-1 min-h-[3.5rem] rounded-md border-2 px-3 py-2 text-left text-sm transition-all ${
                    filled
                      ? "border-correct bg-green-50"
                      : wrongRow === row
                        ? "border-red-400 bg-red-50 motion-safe:animate-shake"
                        : over
                          ? "border-ink bg-secondary scale-[1.01]"
                          : canTap
                            ? "border-dashed border-ink bg-white hover:bg-secondary/40 cursor-pointer"
                            : "border-dashed border-stone-400 bg-white"
                  }`}
                >
                  {filled ? (
                    <span className="block">
                      {cards[card].text !== r.term && (
                        <span className="block text-xs font-bold uppercase tracking-wide text-correct">{r.term}</span>
                      )}
                      <span className="block text-gray-900">{cards[card].text}</span>
                    </span>
                  ) : (
                    <span className={`${canTap || over ? "text-primary font-medium" : "text-gray-400"}`}>
                      {wrongRow === row ? "Not this one" : canTap ? "Tap to place here" : "Drop here"}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {done && (
        <div className="card text-center space-y-3" role="status">
          <p className="font-display text-3xl font-bold text-ink">All matched</p>
          <p className="text-gray-600">
            {mistakes === 0 ? "No mistakes. Nice work." : `${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"} along the way.`}
          </p>
          <button onClick={restart} className="btn-primary w-full">
            Try again
          </button>
        </div>
      )}

      {/* The card following the pointer while dragging */}
      {drag && (
        <div
          aria-hidden="true"
          className="fixed z-50 pointer-events-none flex items-start gap-2 text-sm rounded-md border-2 border-ink bg-secondary px-3 py-2.5 shadow-[4px_4px_0_#1C1917] rotate-1"
          style={{ left: drag.x - drag.offsetX, top: drag.y - drag.offsetY, width: drag.width }}
        >
          <Grip />
          <span className="text-gray-900">{cards[drag.card].text}</span>
        </div>
      )}
    </div>
  );
}

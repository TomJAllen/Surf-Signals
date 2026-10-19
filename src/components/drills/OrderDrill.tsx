"use client";

import { useState } from "react";
import { shuffle } from "@/lib/shuffle";

export interface OrderItem {
  label: string;
  tag?: string; // small label shown on the chip, e.g. "You" / "SurfCom"
}

interface OrderDrillProps {
  instructions: string;
  items: OrderItem[]; // in the correct order
}

// Tap the pieces in the right order. A wrong tap is counted and flagged, not placed.
export default function OrderDrill({ instructions, items }: OrderDrillProps) {
  const [pool, setPool] = useState<number[]>(() => shuffle(items.map((_, i) => i)));
  const [placed, setPlaced] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);

  const done = placed.length === items.length;

  const tap = (i: number) => {
    if (i === placed.length) {
      setPlaced((p) => [...p, i]);
      setPool((p) => p.filter((x) => x !== i));
      setWrong(null);
    } else {
      setMistakes((m) => m + 1);
      setWrong(i);
    }
  };

  const restart = () => {
    setPool(shuffle(items.map((_, i) => i)));
    setPlaced([]);
    setMistakes(0);
    setWrong(null);
  };

  const Chip = ({ i, state }: { i: number; state: "placed" | "pool" | "wrong" }) => (
    <span className="flex items-start gap-2 text-left">
      {items[i].tag && (
        <span
          className={`shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
            state === "placed" ? "bg-white/30 text-white" : "bg-gray-900 text-white"
          }`}
        >
          {items[i].tag}
        </span>
      )}
      <span>{items[i].label}</span>
    </span>
  );

  return (
    <div className="card space-y-4">
      <p className="text-gray-700">{instructions}</p>

      <ol className="space-y-2">
        {placed.map((i, n) => (
          <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-500 text-white font-semibold">
            <span className="shrink-0 w-6 text-right">{n + 1}.</span>
            <Chip i={i} state="placed" />
          </li>
        ))}
      </ol>

      {!done ? (
        <>
          <p className="text-sm font-bold text-gray-500">Tap what comes next{wrong !== null && " (not that one)"}</p>
          <div className="space-y-2">
            {pool.map((i) => (
              <button
                key={i}
                onClick={() => tap(i)}
                className={`w-full p-3 rounded-xl font-semibold transition-all active:scale-[0.98] ${
                  wrong === i ? "bg-red-100 text-red-800 ring-2 ring-red-400" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
              >
                <Chip i={i} state={wrong === i ? "wrong" : "pool"} />
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center space-y-3 pt-2">
          <p className="font-bold text-gray-900">
            {mistakes === 0 ? "Perfect, no mistakes." : `Done, with ${mistakes} wrong tap${mistakes === 1 ? "" : "s"}.`}
          </p>
          <button onClick={restart} className="btn-primary w-full">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

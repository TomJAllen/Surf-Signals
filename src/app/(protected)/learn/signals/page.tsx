"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Signal, SignalCategory } from "@/types";
import {
  getSignalDefinitions,
  getSignalsWithSameShape,
  SIGNAL_POSE_DESCRIPTIONS,
} from "@/lib/pose/signalDefinitions";
import { MOTION_LABELS } from "@/lib/pose/motion";
import Breadcrumbs from "@/components/Breadcrumbs";

const CATEGORY_INFO: Record<SignalCategory, { label: string; blurb: string; badge: string }> = {
  "beach-to-water": {
    label: "Beach to Water",
    blurb: "Given from the beach to swimmers, lifesavers and craft in the water.",
    badge: "bg-amber-500",
  },
  "water-to-beach": {
    label: "Water to Beach",
    blurb: "Given by a lifesaver in the water back to the beach.",
    badge: "bg-blue-500",
  },
};


function SignalCard({ signal }: { signal: Signal }) {
  const [showVideo, setShowVideo] = useState(false);
  const howTo = signal.poseHint || SIGNAL_POSE_DESCRIPTIONS[signal.name];
  const motion = getSignalDefinitions(signal.name).find((d) => d.motion)?.motion;
  const lookalikes = getSignalsWithSameShape(signal.name);
  const info = CATEGORY_INFO[signal.category];

  return (
    <article className="card flex flex-col gap-3" id={signal.id}>
      <div className="relative h-48 bg-white border border-gray-100 rounded-xl overflow-hidden">
        <Image
          src={signal.imageUrl}
          alt={signal.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-3"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          {motion && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-900 text-white">
              {MOTION_LABELS[motion]}
            </span>
          )}
          {info && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${info.badge}`}>
              {info.label}
            </span>
          )}
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-900">{signal.name}</h2>
      <p className="text-gray-700 text-sm">{signal.description}</p>

      {howTo && (
        <div className="text-sm">
          <span className="font-bold text-gray-900">How to do it: </span>
          <span className="text-gray-700">{howTo}</span>
        </div>
      )}

      {signal.videoUrl &&
        (showVideo ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900">
            <iframe
              src={signal.videoUrl}
              title={`${signal.name}: official SLS demonstration`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        ) : (
          <button
            onClick={() => setShowVideo(true)}
            className="self-start text-sm font-bold text-primary hover:underline"
          >
            ▶ Watch the official demo
          </button>
        ))}

      {lookalikes.length > 0 && (
        <p className="text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
          Looks similar to: {lookalikes.join(", ")}
        </p>
      )}
    </article>
  );
}

export default function LearnPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<SignalCategory | null>(null);

  useEffect(() => {
    fetch("/api/signals")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((data: Signal[]) => setSignals(data))
      .catch(() => setError("Couldn't load the signals. Please refresh to try again."))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    const cats: SignalCategory[] = category ? [category] : ["beach-to-water", "water-to-beach"];
    return cats.map((c) => ({ category: c, signals: signals.filter((s) => s.category === c) }));
  }, [signals, category]);

  const tabClass = (active: boolean) =>
    `px-4 py-2 rounded-xl text-sm font-bold transition-all ${
      active ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-3">
        <Breadcrumbs trail={[{ href: "/learn", label: "Learn" }]} />
        <h1 className="text-3xl font-bold text-gray-900">Signals</h1>
        <p className="text-gray-600 max-w-2xl">
          All {signals.length || 14} signals, what they mean and how to do them. Read through
          these first, then test yourself. Based on the SLSA Public Safety and Aquatic Rescue
          Training Manual (35th edition).
        </p>
        <div className="flex flex-wrap gap-2">
          <button className={tabClass(category === null)} onClick={() => setCategory(null)}>
            All
          </button>
          <button
            className={tabClass(category === "beach-to-water")}
            onClick={() => setCategory("beach-to-water")}
          >
            Beach to Water
          </button>
          <button
            className={tabClass(category === "water-to-beach")}
            onClick={() => setCategory("water-to-beach")}
          >
            Water to Beach
          </button>
        </div>
      </header>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      )}

      {error && <p className="text-primary font-medium">{error}</p>}

      {!loading &&
        !error &&
        groups.map(({ category: c, signals: list }) =>
          list.length === 0 ? null : (
            <section key={c} className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {CATEGORY_INFO[c].label}{" "}
                  <span className="text-gray-500 font-medium">({list.length})</span>
                </h2>
                <p className="text-sm text-gray-600">{CATEGORY_INFO[c].blurb}</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((s) => (
                  <SignalCard key={s.id} signal={s} />
                ))}
              </div>
            </section>
          )
        )}

      {!loading && !error && (
        <div className="card text-center space-y-3">
          <p className="font-bold text-gray-900">Ready to test yourself?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/study/identify" className="px-6 py-3 bg-secondary text-gray-900 rounded-xl font-bold hover:bg-secondary-light">
              Identify signals
            </Link>
            <Link href="/study/perform" className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark">
              Perform signals
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

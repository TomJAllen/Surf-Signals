"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface AdminSignal {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  poseHint: string | null;
}

export default function AdminSignalsPage() {
  const [signals, setSignals] = useState<AdminSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingHints, setEditingHints] = useState<Record<string, string>>({});
  const [savingHint, setSavingHint] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [imageCacheBuster, setImageCacheBuster] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/admin/signals")
      .then((res) => res.json())
      .then((data: AdminSignal[]) => {
        setSignals(data);
        const hints: Record<string, string> = {};
        data.forEach((s: AdminSignal) => {
          hints[s.id] = s.poseHint || "";
        });
        setEditingHints(hints);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function savePoseHint(signalId: string) {
    setSavingHint(signalId);
    try {
      const res = await fetch(`/api/admin/signals/${signalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poseHint: editingHints[signalId] }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSignals((prev) =>
          prev.map((s) => (s.id === signalId ? { ...s, poseHint: updated.poseHint } : s))
        );
      }
    } catch (err) {
      console.error("Failed to save pose hint:", err);
    } finally {
      setSavingHint(null);
    }
  }

  async function uploadImage(signalId: string, file: File) {
    setUploadingImage(signalId);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`/api/admin/signals/${signalId}/image`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setImageCacheBuster((prev) => ({ ...prev, [signalId]: Date.now() }));
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
    } finally {
      setUploadingImage(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Signals</h1>

      <div className="space-y-6">
        {signals.map((signal) => (
          <div key={signal.id} className="card">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Image
                  src={
                    signal.imageUrl +
                    (imageCacheBuster[signal.id]
                      ? `?v=${imageCacheBuster[signal.id]}`
                      : "")
                  }
                  alt={signal.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-bold text-gray-900">{signal.name}</h2>
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    {signal.category}
                  </span>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pose Hint
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      value={editingHints[signal.id] || ""}
                      onChange={(e) =>
                        setEditingHints((prev) => ({
                          ...prev,
                          [signal.id]: e.target.value,
                        }))
                      }
                      rows={2}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g. Raise both arms above your head"
                    />
                    <button
                      onClick={() => savePoseHint(signal.id)}
                      disabled={savingHint === signal.id}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 self-end"
                    >
                      {savingHint === signal.id ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Replace Image
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(signal.id, file);
                      }}
                      className="text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                      disabled={uploadingImage === signal.id}
                    />
                    {uploadingImage === signal.id && (
                      <span className="text-sm text-gray-500">Uploading...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

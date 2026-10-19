"use client";

import { useEffect, useState } from "react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  totalAttempts: number;
  accuracy: number;
}

function ResetLinkButton({ userId }: { userId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "copied" | "error">("idle");
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");

  const create = async () => {
    setState("loading");
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-link`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't create a link");
      setLink(data.url);
      setMessage(`Valid for ${data.expiresInMinutes} minutes, and only once.`);
      try {
        await navigator.clipboard.writeText(data.url);
        setState("copied");
      } catch {
        setState("idle");
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Couldn't create a link");
      setState("error");
    }
  };

  return (
    <div className="mt-2 space-y-1">
      <button onClick={create} disabled={state === "loading"} className="text-sm font-semibold text-primary hover:underline disabled:opacity-50">
        {state === "loading" ? "Creating…" : link ? "Create a new reset link" : "Password reset link"}
      </button>
      {link && (
        <div className="space-y-1">
          <input
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="Reset link"
            className="w-full text-xs font-mono border border-gray-200 rounded-lg px-2 py-1 bg-gray-50"
          />
          <p className="text-xs text-gray-500">
            {state === "copied" ? "Copied. " : ""}
            {message} Send it to the user yourself.
          </p>
        </div>
      )}
      {state === "error" && <p className="text-xs text-red-700">{message}</p>}
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>

      <div className="card divide-y divide-gray-100">
        {users.map((user) => (
          <div key={user.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">
                    {user.name || "Unnamed"}
                  </p>
                  {user.role === "admin" && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-primary text-white rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <ResetLinkButton userId={user.id} />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.totalAttempts} attempts
                </p>
                <p className="text-sm text-gray-500">
                  {user.accuracy}% accuracy
                </p>
              </div>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-gray-500 text-center py-4">No users found.</p>
        )}
      </div>
    </div>
  );
}

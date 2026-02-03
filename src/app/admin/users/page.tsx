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
            <div className="flex items-center justify-between">
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

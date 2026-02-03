"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AdminStats {
  userCount: number;
  signalCount: number;
  attemptCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats)
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary">{stats?.userCount ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Users</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary">{stats?.signalCount ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Signals</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary">{stats?.attemptCount ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Attempts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/users" className="card hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Manage Users</h2>
          <p className="text-sm text-gray-500">View all registered users, their activity, and roles.</p>
        </Link>
        <Link href="/admin/signals" className="card hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Manage Signals</h2>
          <p className="text-sm text-gray-500">Edit pose hints and upload signal images.</p>
        </Link>
      </div>
    </div>
  );
}

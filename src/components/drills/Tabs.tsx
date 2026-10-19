"use client";

interface TabsProps<T extends string> {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}

export default function Tabs<T extends string>({ tabs, active, onChange }: TabsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            active === t.id ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

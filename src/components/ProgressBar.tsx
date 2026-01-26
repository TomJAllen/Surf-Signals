interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "green" | "red" | "yellow";
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = "md",
  color = "blue",
}: ProgressBarProps) {
  const percentage = Math.round((value / max) * 100);

  const sizeClasses = {
    sm: "h-2",
    md: "h-4",
    lg: "h-6",
  };

  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between mb-1 text-sm">
          {label && <span className="text-gray-600">{label}</span>}
          {showPercentage && (
            <span className="text-gray-500">{percentage}%</span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}
      >
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

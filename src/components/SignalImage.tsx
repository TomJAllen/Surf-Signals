import Image from "next/image";

interface SignalImageProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function SignalImage({
  src,
  alt,
  size = "md",
  className = "",
}: SignalImageProps) {
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-48 h-48",
    lg: "w-72 h-72",
  };

  return (
    <div
      className={`relative bg-gray-100 rounded-lg overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-2"
      />
    </div>
  );
}

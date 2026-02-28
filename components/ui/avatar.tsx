import Image from "next/image";
import { getInitials } from "@/lib/utils";

export function Avatar({
  name,
  imageUrl,
  className = ""
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <div className={`relative h-10 w-10 overflow-hidden rounded-full ${className}`}>
        <Image src={imageUrl} alt={name} fill className="object-cover" sizes="40px" unoptimized />
      </div>
    );
  }

  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-accent font-semibold text-slate-950 ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}

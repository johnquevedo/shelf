import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  coverUrl?: string | null;
  href?: string;
  className?: string;
};

function BookCoverInner({ title, coverUrl, className }: Omit<Props, "href">) {
  if (coverUrl) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden rounded-[22px]", className)}>
        <Image src={coverUrl} alt={title} fill className="object-cover" sizes="(max-width: 768px) 33vw, 160px" unoptimized />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-[22px] border border-white/10 bg-slate-900 p-4 text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-400",
        className
      )}
    >
      No Cover Yet
    </div>
  );
}

export function BookCover(props: Props) {
  if (props.href) {
    return (
      <Link href={props.href} className="block">
        <BookCoverInner {...props} />
      </Link>
    );
  }

  return <BookCoverInner {...props} />;
}

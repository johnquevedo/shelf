export default function ExploreLoading() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <section key={index} className="shell-card animate-pulse p-6">
          <div className="h-8 w-56 rounded-full bg-white/10" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 6 }).map((__, cardIndex) => (
              <div key={cardIndex} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="mx-auto aspect-[2/3] w-full max-w-[140px] rounded-[22px] bg-white/10" />
                <div className="mt-4 h-5 w-3/4 rounded-full bg-white/10" />
                <div className="mt-2 h-4 w-1/2 rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

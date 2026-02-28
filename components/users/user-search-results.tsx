import Link from "next/link";
import { FollowButton } from "@/components/feed/follow-button";

export function UserSearchResults({
  users,
  followingIds
}: {
  users: Array<{
    id: string;
    name: string;
    username: string;
    bio: string | null;
    _count: { followers: number; reviews: number };
  }>;
  followingIds: Set<string>;
}) {
  if (!users.length) {
    return null;
  }

  return (
    <section className="shell-card p-6">
      <h2 className="font-display text-3xl">People</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {users.map((user) => (
          <div key={user.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <Link href={`/users/${user.username}`} className="font-semibold text-white">
              {user.name}
            </Link>
            <p className="mt-1 text-sm text-white/45">@{user.username}</p>
            <p className="mt-3 text-sm leading-6 text-white/60">{user.bio || "No bio yet."}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/30">
              {user._count.followers} followers • {user._count.reviews} reviews
            </p>
            <div className="mt-4">
              <FollowButton userId={user.id} initialFollowing={followingIds.has(user.id)} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

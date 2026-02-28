import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getNotifications } from "@/lib/notifications";

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await getNotifications(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-5xl">Notifications</h1>
        <p className="mt-2 text-sm text-white/50">Likes, comments, and follows across your account.</p>
      </div>
      <section className="shell-card p-6">
        <div className="space-y-4">
          {notifications.length ? (
            notifications.map((item) => (
              <div key={`${item.type}-${item.id}`} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">
                  {item.actorName} <span className="text-white/45">@{item.actorUsername}</span>
                </p>
                <p className="mt-1 text-sm text-white/65">{item.text}</p>
                {"body" in item && item.body ? <p className="mt-3 text-sm text-white/75">{item.body}</p> : null}
                <div className="mt-3 flex gap-3 text-sm">
                  <Link href={`/users/${item.actorUsername}`} className="text-accent">
                    View profile
                  </Link>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/30">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/45">No notifications yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

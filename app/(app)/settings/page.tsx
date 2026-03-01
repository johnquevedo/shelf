import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { ProfileForm } from "@/components/settings/profile-form";
import { GoodreadsImport } from "@/components/settings/goodreads-import";

export default async function SettingsPage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl sm:text-5xl">Settings</h1>
        <p className="mt-2 text-sm text-white/50">Manage your public profile and bring in prior reading history.</p>
      </div>
      <section className="shell-card p-6">
        <h2 className="font-display text-3xl">Account</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/35">Email</p>
            <p className="mt-3 text-sm text-white">{user.email}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/35">Username</p>
            <p className="mt-3 text-sm text-white">@{user.username}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/35">Joined</p>
            <p className="mt-3 text-sm text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </section>
      <ProfileForm user={user} />
      <GoodreadsImport />
    </div>
  );
}

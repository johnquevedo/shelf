"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { updateProfileAction } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit">{pending ? "Saving…" : "Save profile"}</Button>;
}

export function ProfileForm({
  user
}: {
  user: { name: string; username: string; bio: string | null; imageUrl: string | null };
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(updateProfileAction, { message: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <form action={formAction} className="shell-card space-y-4 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input name="name" defaultValue={user.name} />
          <Input name="username" defaultValue={user.username} />
        </div>
        <Textarea
          name="bio"
          defaultValue={user.bio ?? ""}
          className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
          placeholder="Short bio"
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-mint">{state.message}</p>
          <SubmitButton />
        </div>
      </form>

      <form
        className="shell-card space-y-4 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          const file = fileRef.current?.files?.[0];
          if (!file) return;
          const formData = new FormData();
          formData.append("file", file);

          startTransition(async () => {
            const response = await fetch("/api/profile/upload", {
              method: "POST",
              body: formData
            });
            const payload = (await response.json()) as { message?: string };
            setUploadMessage(payload.message ?? "Uploaded.");
            router.refresh();
          });
        }}
      >
        <div>
          <h3 className="font-display text-2xl">Profile photo</h3>
          <p className="mt-1 text-sm text-white/50">
            Upload a JPG, PNG, WebP, or AVIF image up to 5 MB.
          </p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="text-sm text-white/70" />
        <div className="flex items-center justify-between">
          <p className={`text-sm ${uploadMessage.toLowerCase().includes("unable") || uploadMessage.toLowerCase().includes("must") ? "text-rose-400" : "text-mint"}`}>
            {uploadMessage}
          </p>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Uploading…" : "Upload photo"}
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProfile, useUpdateProfile, useUploadAvatar } from "@/lib/account/hooks";
import { avatarHref } from "@/lib/account/client";

function initials(name: string): string {
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts.at(-1)?.[0] ?? "" : "")).toUpperCase() || "PB";
}

/**
 * ProfileView — name + avatar (editable) with read-only role / org / email. Identity comes
 * from the backend profile; auth context is the fallback while it loads.
 */
export function ProfileView() {
  const { user } = useAuth();
  const { show } = useToast();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const fileRef = useRef<HTMLInputElement>(null);

  const data = profile.data;
  const [name, setName] = useState("");
  useEffect(() => {
    if (data) setName(data.name);
  }, [data]);

  const displayName = data?.name ?? user?.name ?? user?.email ?? "";
  const role = data?.role ?? user?.role ?? "";
  const email = data?.email ?? user?.email ?? "";
  const org = data?.org ?? user?.tenantId ?? "";
  const avatar = avatarHref(data?.avatarUrl);

  function save() {
    updateProfile.mutate(
      { name: name.trim() },
      {
        onSuccess: () => show({ message: "Profile saved", tone: "success" }),
        onError: (e) => show({ message: (e as Error).message, tone: "danger" }),
      },
    );
  }

  function onAvatar(file: File | undefined) {
    if (!file) return;
    uploadAvatar.mutate(file, {
      onSuccess: () => show({ message: "Avatar updated", tone: "success" }),
      onError: (e) => show({ message: (e as Error).message, tone: "danger" }),
    });
  }

  if (profile.isLoading && !user) {
    return (
      <Card className="space-y-3">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-10 w-64" />
      </Card>
    );
  }

  return (
    <Card className="space-y-6">
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-muted bg-cover bg-center font-mono text-lg font-semibold text-accent"
          style={avatar ? { backgroundImage: `url(${avatar})` } : undefined}
          aria-hidden="true"
        >
          {!avatar && initials(displayName)}
        </div>
        <div>
          <p className="text-base font-semibold text-primary">{displayName}</p>
          <div className="mt-1 flex items-center gap-2">
            {role && <Badge tone="neutral">{role}</Badge>}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm text-accent underline-offset-2 hover:underline"
            >
              {uploadAvatar.isPending ? "Uploading…" : "Change photo"}
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              onAvatar(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="profile-name" label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </Field>
        <Field id="profile-email" label="Email">
          <Input value={email} disabled />
        </Field>
        <Field id="profile-role" label="Role" hint="Set by your administrator">
          <Input value={role} disabled />
        </Field>
        <Field id="profile-org" label="Organization">
          <Input value={org} disabled />
        </Field>
      </div>

      <Button onClick={save} disabled={updateProfile.isPending || name.trim() === ""}>
        {updateProfile.isPending ? "Saving…" : "Save profile"}
      </Button>
    </Card>
  );
}

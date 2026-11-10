"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { UserRound } from "lucide-react";
import { useSignOutMutation } from "@/features/auth/api/authApi";
import SignInGate from "@/features/auth/components/account-prompt/SignInGate";
import { useSession } from "@/features/auth/hooks/useSession";
import { useClearHistoryMutation } from "@/features/library/api/libraryApi";
import { ROUTES } from "@/lib/routes";
import { useAppDispatch } from "@/lib/store";
import { clearUserData } from "@/lib/store/clearUserData";
import { saveBlob } from "@/lib/utils/saveBlob";
import Button from "@/shared/ui/button/Button";
import Container from "@/shared/ui/container/Container";
import Switch from "@/shared/ui/form/Switch";
import Loader from "@/shared/ui/loaders/Loader";
import ConfirmSheet from "@/shared/ui/modal/ConfirmSheet";
import { useExportMyDataMutation, useGetSettingsQuery, useUpdateSettingsMutation } from "../api/settingsApi";
import SettingsRow from "./SettingsRow";

export default function SettingsScreen() {
  const { session, isSignedIn, isLoading } = useSession();

  return (
    <Container className="py-6 md:py-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>

        {isLoading ? (
          <Loader className="py-16" label="Loading settings" />
        ) : (
          <div className="mt-8 flex flex-col gap-10">
            {session ? (
              <section aria-label="Your account" className="flex items-center gap-4 rounded-2xl border border-border bg-surface/40 p-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-raised text-foreground">
                  <UserRound className="size-6" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {session.firstName} {session.lastName}
                  </p>
                  <p className="truncate text-sm text-muted">{session.email}</p>
                </div>
              </section>
            ) : (
              <SignInGate kind="account" />
            )}

            {isSignedIn && <PrivacySection />}

            <Group title="Account and about">
              {isSignedIn && <SettingsRow label="Change password" href={ROUTES.forgotPassword} />}
              <SettingsRow label="About and standards" href={ROUTES.about} />
              <SettingsRow label="Report an issue" href={ROUTES.report} />
              <SettingsRow label="Privacy notice and Terms" href={ROUTES.privacy} />
            </Group>

            {isSignedIn && <SignOutButton />}
          </div>
        )}
      </div>
    </Container>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  const id = `settings-${title.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-xl font-semibold text-foreground">
        {title}
      </h2>
      <ul className="mt-2">{children}</ul>
    </section>
  );
}

function PrivacySection() {
  const { data: settings } = useGetSettingsQuery();
  const [updateSettings] = useUpdateSettingsMutation();
  const [clearHistory, { isLoading: clearing }] = useClearHistoryMutation();
  const [exportMyData, { isLoading: exporting }] = useExportMyDataMutation();
  const [confirmClear, setConfirmClear] = useState(false);

  const setAnalytics = (allowAnalytics: boolean) =>
    updateSettings({ allowAnalytics }).unwrap().catch(() => toast.error("Couldn't save that change. Try again."));

  const downloadData = async () => {
    try {
      const data = await exportMyData().unwrap();
      const date = new Date().toISOString().slice(0, 10);
      saveBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `godswheel-my-data-${date}.json`);
      toast.success("Your data is downloading");
    } catch {
      toast.error("Couldn't prepare your data. Try again.");
    }
  };

  const clear = async () => {
    try {
      await clearHistory().unwrap();
      setConfirmClear(false);
      toast.success("Listening history cleared");
    } catch {
      toast.error("Couldn't clear your history. Try again.");
    }
  };

  return (
    <Group title="Privacy and data">
      <li className="flex items-center justify-between gap-4 border-b border-border py-4">
        <label htmlFor="allow-analytics" className="text-foreground">
          Allow analytics
          <span className="mt-0.5 block text-sm text-muted">Anonymous usage stats that help us improve GodsWheel.</span>
        </label>
        <Switch
          id="allow-analytics"
          checked={settings?.allowAnalytics ?? false}
          disabled={!settings}
          onChange={setAnalytics}
        />
      </li>
      <SettingsRow label="Clear listening history" onClick={() => setConfirmClear(true)} />
      <SettingsRow label={exporting ? "Preparing your data…" : "Request a copy of my data"} onClick={downloadData} disabled={exporting} />

      <ConfirmSheet
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Clear listening history?"
        message="This removes every sermon from Recently played and Continue listening. Saved sermons and notes stay."
        confirmLabel="Clear history"
        onConfirm={clear}
        busy={clearing}
      />
    </Group>
  );
}

function SignOutButton() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [signOut, { isLoading }] = useSignOutMutation();

  const handleSignOut = async () => {
    // Even if the server can't be reached, forget everything on this device.
    await signOut()
      .unwrap()
      .catch(() => undefined);
    clearUserData(dispatch);
    toast.success("Signed out");
    router.replace(ROUTES.home);
  };

  return (
    <Button type="button" variant="secondary" size="lg" disabled={isLoading} onClick={handleSignOut} className="w-full">
      {isLoading ? "Signing out…" : "Sign out"}
    </Button>
  );
}

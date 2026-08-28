import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, MailCheck, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { setAuthToken } from "@/api/campaignApi";

export const Route = createFileRoute("/auth/success")({
  head: () => ({
    meta: [
      { title: "Signing you in — MailFlow" },
      {
        name: "description",
        content: "Completing your MailFlow sign-in and preparing your campaign dashboard.",
      },
      { property: "og:title", content: "Signing you in — MailFlow" },
      {
        property: "og:description",
        content: "Completing your MailFlow sign-in.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthSuccessPage,
});

function AuthSuccessPage() {
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setFailed(true);
      return;
    }
    setAuthToken(token);
    const timer = window.setTimeout(() => {
      navigate({ to: "/dashboard", replace: true });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass w-full max-w-sm rounded-2xl p-10 text-center">
        {failed ? (
          <>
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
              <ShieldAlert className="size-6" />
            </span>
            <h1 className="mt-6 text-lg font-semibold">No token received</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The sign-in callback did not include an access token. Please try
              signing in again.
            </p>
            <Button className="mt-6 w-full" onClick={() => navigate({ to: "/" })}>
              Back to sign in
            </Button>
          </>
        ) : (
          <>
            <span className="glow-emerald mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <MailCheck className="size-6" />
            </span>
            <h1 className="mt-6 text-lg font-semibold">Signing you in</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Securing your session and loading your campaigns…
            </p>
            <Loader2 className="mx-auto mt-6 size-6 animate-spin text-accent" />
          </>
        )}
      </div>
    </main>
  );
}

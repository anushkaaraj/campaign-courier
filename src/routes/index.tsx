import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Activity,
  ArrowRight,
  Clock,
  Database,
  Gauge,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { campaignApi, getAuthToken } from "@/api/campaignApi";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MailFlow — Email Campaign Manager & Delivery Scheduler" },
      {
        name: "description",
        content:
          "Schedule email campaigns with reliable background queuing, smart SMTP rate-limiting and persistent Redis-backed delivery.",
      },
      { property: "og:title", content: "MailFlow — Email Campaign Manager" },
      {
        property: "og:description",
        content:
          "Background queuing, intelligent SMTP rate-limiting and persistent Redis delivery for your email campaigns.",
      },
    ],
  }),
  component: LandingPage,
});

const features = [
  {
    icon: Clock,
    title: "Reliable background queuing",
    description:
      "Every campaign is persisted to a durable job queue the moment you launch it — no lost sends on restart.",
    stat: "99.98%",
    statLabel: "job durability",
    badge: "Queue",
  },
  {
    icon: Gauge,
    title: "Intelligent SMTP rate-limiting",
    description:
      "Per-hour throttling and inter-message delays keep your sender reputation clean and inboxes happy.",
    stat: "20/hr",
    statLabel: "default limit",
    badge: "Throttle",
  },
  {
    icon: Database,
    title: "Persistent Redis delivery",
    description:
      "Redis-backed scheduling with automatic retries means delayed sends fire exactly when you planned.",
    stat: "0 loss",
    statLabel: "on restart",
    badge: "Redis",
  },
];

function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (getAuthToken()) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [navigate]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-16">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-gradient-brand glow-emerald flex size-10 items-center justify-center rounded-xl">
              <Mail className="size-5 text-primary-foreground" />
            </span>
            <span className="text-lg font-semibold tracking-tight">MailFlow</span>
          </div>
          <Badge variant="outline" className="gap-1.5 border-primary/40 text-primary">
            <Activity className="size-3.5" />
            System Online
          </Badge>
        </nav>

        <section className="mt-20 text-center">
          <Badge
            variant="outline"
            className="mb-6 gap-1.5 border-accent/40 bg-accent/10 text-accent"
          >
            <Sparkles className="size-3.5" />
            Background delivery scheduler
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Ship campaigns that{" "}
            <span className="text-gradient-brand">always land on time</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground">
            MailFlow queues, throttles and delivers your email campaigns in the
            background — so scheduling a thousand sends feels like sending one.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Button
              size="lg"
              className="glow-emerald group h-12 gap-2 px-7 text-base"
              onClick={() => {
                window.location.href = campaignApi.googleLoginUrl;
              }}
            >
              <GoogleGlyph />
              Sign in with Google
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              OAuth secured — we never store your mailbox password.
            </p>
          </div>
        </section>

        <section className="mt-24 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="glass group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary transition-colors group-hover:bg-primary/20">
                    <feature.icon className="size-5" />
                  </span>
                  <Badge
                    variant="outline"
                    className="border-accent/30 bg-accent/10 text-[11px] text-accent"
                  >
                    {feature.badge}
                  </Badge>
                </div>
                <h3 className="mt-5 text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
                <div className="mt-6 flex items-baseline gap-2 border-t border-border pt-4">
                  <span className="text-2xl font-semibold text-gradient-brand">
                    {feature.stat}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {feature.statLabel}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="glass mt-12 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 rounded-2xl px-8 py-7">
          {[
            { icon: Zap, label: "Median dispatch", value: "180ms" },
            { icon: Mail, label: "Emails delivered", value: "1.2M+" },
            { icon: Clock, label: "Schedules honored", value: "99.9%" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <item.icon className="size-5 text-accent" />
              <div>
                <p className="text-xl font-semibold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.64 4.1-5.35 4.1a5.9 5.9 0 1 1 0-11.8c1.69 0 2.82.72 3.47 1.34l2.37-2.28C16.3 3.97 14.35 3.1 12 3.1a8.9 8.9 0 1 0 0 17.8c5.14 0 8.54-3.61 8.54-8.7 0-.58-.06-1.03-.19-1.1Z"
      />
    </svg>
  );
}

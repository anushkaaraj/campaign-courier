import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  Eye,
  Gauge,
  Inbox,
  Loader2,
  LogOut,
  Mail,
  RefreshCw,
  Rocket,
  Search,
  Send,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LaunchCampaignModal } from "@/components/LaunchCampaignModal";
import {
  campaignApi,
  clearAuthToken,
  getAuthToken,
  recipientOf,
  scheduledTimeOf,
  type Campaign,
} from "@/api/campaignApi";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Campaign Dashboard — MailFlow" },
      {
        name: "description",
        content:
          "Track scheduled jobs, completed deliveries, queue health and rate limits for your MailFlow email campaigns.",
      },
      { property: "og:title", content: "Campaign Dashboard — MailFlow" },
      {
        property: "og:description",
        content: "Track scheduled jobs, deliveries and queue health in MailFlow.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

const HOURLY_LIMIT = 20;

function formatAbsolute(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400000],
    ["hour", 3600000],
    ["minute", 60000],
    ["second", 1000],
  ];
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unit, ms] of units) {
    if (abs >= ms || unit === "second") {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return "—";
}

function DashboardPage() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [upcoming, setUpcoming] = useState<Campaign[]>([]);
  const [completed, setCompleted] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("upcoming");
  const [launchOpen, setLaunchOpen] = useState(false);
  const [detail, setDetail] = useState<Campaign | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [up, done] = await Promise.all([
        campaignApi.getUpcoming(),
        campaignApi.getCompleted(),
      ]);
      setUpcoming(up);
      setCompleted(done);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reach the MailFlow API",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getAuthToken()) {
      navigate({ to: "/", replace: true });
      return;
    }
    setAuthorized(true);
    void load();
  }, [navigate, load]);

  const filter = useCallback(
    (rows: Campaign[]) => {
      const q = query.trim().toLowerCase();
      if (!q) return rows;
      return rows.filter(
        (row) =>
          recipientOf(row).toLowerCase().includes(q) ||
          String(row.subject ?? "")
            .toLowerCase()
            .includes(q),
      );
    },
    [query],
  );

  const filteredUpcoming = useMemo(() => filter(upcoming), [filter, upcoming]);
  const filteredCompleted = useMemo(() => filter(completed), [filter, completed]);

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="glass sticky top-0 z-30 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="bg-gradient-brand glow-emerald flex size-9 items-center justify-center rounded-xl">
              <Mail className="size-4 text-primary-foreground" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">MailFlow</p>
              <p className="text-xs text-muted-foreground">Campaign dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="hidden gap-1.5 border-primary/40 text-primary sm:flex"
            >
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              System Online
            </Badge>
            <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 py-1 pl-1 pr-3">
              <span className="flex size-7 items-center justify-center rounded-full bg-accent/20 text-accent">
                <User className="size-3.5" />
              </span>
              <span className="text-xs font-medium">Signed in</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                clearAuthToken();
                navigate({ to: "/", replace: true });
              }}
            >
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={CalendarClock}
            label="Upcoming scheduled jobs"
            value={upcoming.length}
            hint="Queued for background delivery"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Successfully sent"
            value={completed.length}
            hint="Delivered to recipients"
            accent
          />
          <MetricCard
            icon={Gauge}
            label="Hourly rate limit"
            value={`${HOURLY_LIMIT}/hr`}
            hint="SMTP throttle setting"
          />
          <MetricCard
            icon={Activity}
            label="Queue health"
            value={error ? "Degraded" : "Healthy"}
            hint={error ? "API unreachable" : "Active · Redis connected"}
            accent={!error}
          />
        </section>

        <section className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by recipient or subject…"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => void load()}>
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              className="glow-emerald gap-2"
              onClick={() => setLaunchOpen(true)}
            >
              <Rocket className="size-4" />
              Launch Campaign
            </Button>
          </div>
        </section>

        {error ? (
          <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList className="bg-secondary/60">
            <TabsTrigger value="upcoming" className="gap-1.5">
              <CalendarClock className="size-3.5" />
              Scheduled / Upcoming
              <Badge variant="secondary" className="ml-1">
                {upcoming.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1.5">
              <Send className="size-3.5" />
              Completed / Sent
              <Badge variant="secondary" className="ml-1">
                {completed.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            <Card className="glass overflow-hidden">
              <CardContent className="p-0">
                {loading ? (
                  <LoadingRow />
                ) : filteredUpcoming.length === 0 ? (
                  <EmptyState
                    icon={CalendarClock}
                    title="No scheduled emails"
                    description="Launch a campaign to queue your first background delivery."
                    action={() => setLaunchOpen(true)}
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Recipient</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Scheduled delivery</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUpcoming.map((row, i) => (
                        <TableRow key={row.id ?? row._id ?? i}>
                          <TableCell className="font-medium">
                            {recipientOf(row)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-muted-foreground">
                            {row.subject ?? "—"}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-accent">
                              {formatRelative(scheduledTimeOf(row))}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {formatAbsolute(scheduledTimeOf(row))}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="outline"
                              className="border-accent/40 bg-accent/10 text-accent"
                            >
                              SCHEDULED
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            <Card className="glass overflow-hidden">
              <CardContent className="p-0">
                {loading ? (
                  <LoadingRow />
                ) : filteredCompleted.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="No deliveries yet"
                    description="Sent emails will appear here once the queue drains."
                    action={() => setLaunchOpen(true)}
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Recipient</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Sent at</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompleted.map((row, i) => (
                        <TableRow key={row.id ?? row._id ?? i}>
                          <TableCell className="font-medium">
                            {recipientOf(row)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-muted-foreground">
                            {row.subject ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatAbsolute(row.sentAt ?? scheduledTimeOf(row))}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="border-primary/40 bg-primary/10 text-primary"
                            >
                              SENT
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => setDetail(row)}
                            >
                              <Eye className="size-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <LaunchCampaignModal
        open={launchOpen}
        onOpenChange={setLaunchOpen}
        onLaunched={() => void load()}
      />

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="glass max-w-xl">
          <DialogHeader>
            <DialogTitle>{detail?.subject ?? "Email details"}</DialogTitle>
            <DialogDescription>
              To {detail ? recipientOf(detail) : "—"} ·{" "}
              {formatAbsolute(detail?.sentAt ?? scheduledTimeOf(detail ?? {}))}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-border bg-secondary/40 p-4 text-sm leading-relaxed whitespace-pre-wrap">
            {detail?.body ?? "No body content was returned for this delivery."}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint: string;
  accent?: boolean;
}) {
  return (
    <Card className="glass transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40">
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <span
          className={`flex size-10 items-center justify-center rounded-xl ${
            accent ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"
          }`}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function LoadingRow() {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin text-primary" />
      Loading campaigns…
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <span className="glow-cyan flex size-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <Icon className="size-7" />
      </span>
      <h3 className="mt-5 text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      <Button className="mt-6 gap-2" variant="outline" onClick={action}>
        <Rocket className="size-4" />
        Launch Campaign
      </Button>
    </div>
  );
}

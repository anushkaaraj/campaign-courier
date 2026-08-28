import { useState } from "react";
import { Loader2, Rocket, Send, Settings2, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { campaignApi } from "@/api/campaignApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLaunched: () => void;
}

function parseEmails(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((e) => e.trim())
    .filter(Boolean);
}

export function LaunchCampaignModal({ open, onOpenChange, onLaunched }: Props) {
  const [tab, setTab] = useState("content");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [emailsRaw, setEmailsRaw] = useState("");
  const [sendAt, setSendAt] = useState("");
  const [delayMs, setDelayMs] = useState(2000);
  const [hourlyLimit, setHourlyLimit] = useState(20);
  const [submitting, setSubmitting] = useState(false);

  const emails = parseEmails(emailsRaw);

  function reset() {
    setTab("content");
    setSubject("");
    setBody("");
    setEmailsRaw("");
    setSendAt("");
    setDelayMs(2000);
    setHourlyLimit(20);
  }

  async function handleSubmit() {
    if (!subject.trim()) return toast.error("Subject is required");
    if (!body.trim()) return toast.error("Email body is required");
    if (emails.length === 0) return toast.error("Add at least one recipient");

    const when = sendAt ? new Date(sendAt) : new Date();
    if (Number.isNaN(when.getTime())) return toast.error("Invalid schedule date");

    setSubmitting(true);
    try {
      await campaignApi.launch({
        subject: subject.trim(),
        body,
        emails,
        sendAt: when.toISOString(),
        delayMs: Number(delayMs) || 0,
        hourlyLimit: Number(hourlyLimit) || 1,
      });
      toast.success(`Campaign queued for ${emails.length} recipient(s)`);
      reset();
      onOpenChange(false);
      onLaunched();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to launch campaign",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="glass max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="bg-gradient-brand flex size-8 items-center justify-center rounded-lg">
              <Rocket className="size-4 text-primary-foreground" />
            </span>
            Launch Campaign
          </DialogTitle>
          <DialogDescription>
            Compose your message, pick recipients and schedule background delivery.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/60">
            <TabsTrigger value="content" className="gap-1.5">
              <Send className="size-3.5" /> Content
            </TabsTrigger>
            <TabsTrigger value="recipients" className="gap-1.5">
              <Users className="size-3.5" /> Recipients
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-1.5">
              <Settings2 className="size-3.5" /> Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your product update is here"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={9}
                placeholder="Hi there, — write your email content here. HTML is supported."
              />
            </div>
          </TabsContent>

          <TabsContent value="recipients" className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emails">Recipient emails</Label>
              <Textarea
                id="emails"
                value={emailsRaw}
                onChange={(e) => setEmailsRaw(e.target.value)}
                rows={8}
                placeholder="user1@example.com, user2@example.com"
              />
              <p className="text-xs text-muted-foreground">
                Separate with commas, spaces or new lines.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {emails.slice(0, 12).map((email) => (
                <Badge
                  key={email}
                  variant="outline"
                  className="border-accent/30 bg-accent/10 text-accent"
                >
                  {email}
                </Badge>
              ))}
              {emails.length > 12 ? (
                <Badge variant="outline">+{emails.length - 12} more</Badge>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sendAt">Send at</Label>
              <Input
                id="sendAt"
                type="datetime-local"
                value={sendAt}
                onChange={(e) => setSendAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to start delivery immediately.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="delayMs">Delay between emails (ms)</Label>
                <Input
                  id="delayMs"
                  type="number"
                  min={0}
                  value={delayMs}
                  onChange={(e) => setDelayMs(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyLimit">Hourly limit</Label>
                <Input
                  id="hourlyLimit"
                  type="number"
                  min={1}
                  value={hourlyLimit}
                  onChange={(e) => setHourlyLimit(Number(e.target.value))}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4 gap-2 sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {emails.length} recipient(s) · {hourlyLimit}/hr · {delayMs}ms delay
          </p>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="glow-emerald gap-2"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Rocket className="size-4" />
            )}
            Launch campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

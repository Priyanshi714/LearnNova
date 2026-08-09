import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { getUserDisplayName, getUserInitials } from "@/lib/user-display-name";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — LearnNova" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profileName, setProfileName] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);
      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      const resolvedName = getUserDisplayName(user, profile?.full_name);
      setProfileName(resolvedName);
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setIsUpdating(true);

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: profileName.trim(),
      email: email.trim(),
    });

    setIsUpdating(false);
    if (error) {
      console.error("Profile save error:", error);
      toast.error("Failed to update profile name.");
    } else {
      toast.success("Profile updated successfully.");
      window.dispatchEvent(new CustomEvent("profile-updated"));
    }
  };

  const initials = getUserInitials(profileName);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Profile, appearance, and your data.</p>
      </div>

      {/* Profile */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/40">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-lg font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm" className="border-border/60">
                Upload Avatar
              </Button>
              <p className="mt-1.5 text-[11px] text-muted-foreground">PNG or JPG, up to 2MB.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                disabled
                className="opacity-75 cursor-not-allowed bg-muted/40"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={isUpdating || !profileName.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Row title="Dark Mode" description="LearnNova is optimized for the dark theme.">
            <Switch defaultChecked />
          </Row>
          <Row title="Reduce motion" description="Minimize animations for a calmer interface.">
            <Switch />
          </Row>
          <Row title="Compact density" description="Tighter spacing for power users.">
            <Switch />
          </Row>
        </CardContent>
      </Card>

      {/* Export */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base">Export Center</CardTitle>
          <p className="text-xs text-muted-foreground">Take your second brain with you. Always.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { l: "Problems", n: "248 items" },
              { l: "Notes", n: "412 entries" },
              { l: "Solutions", n: "412 saved" },
              { l: "Everything", n: "Full archive" },
            ].map((x) => (
              <div
                key={x.l}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 p-3.5"
              >
                <div>
                  <div className="text-sm font-medium">{x.l}</div>
                  <div className="text-[11px] text-muted-foreground">{x.n}</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border/60"
                  onClick={() => toast.success(`${x.l} export queued.`)}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Export
                </Button>
              </div>
            ))}
          </div>
          <div>
            <Label className="text-xs">Format</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="outline" className="border-border/60">
                <FileJson className="mr-2 h-4 w-4" /> JSON
              </Button>
              <Button variant="outline" className="border-border/60">
                <FileSpreadsheet className="mr-2 h-4 w-4" /> CSV
              </Button>
              <Button variant="outline" className="border-border/60">
                <FileText className="mr-2 h-4 w-4" /> PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-[11px] text-muted-foreground">{description}</div>
      </div>
      {children}
    </div>
  );
}

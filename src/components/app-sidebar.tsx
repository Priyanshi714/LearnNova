import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  BookOpen,
  FolderTree,
  RefreshCw,
  BarChart3,
  Settings,
  Sparkles,
  Flame,
  Trophy,
  GitBranch,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { getUserDisplayName, getUserInitials } from "@/lib/user-display-name";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV = [
  { title: "Home", url: "/home", icon: Home },
  { title: "My Problems", url: "/problems", icon: BookOpen },
  { title: "Topics", url: "/topics", icon: FolderTree },
  { title: "Patterns", url: "/patterns", icon: GitBranch },
  { title: "Revisions", url: "/revisions", icon: RefreshCw },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

function calculateStreak(activityDates: string[]) {
  if (activityDates.length === 0) return 0;

  const dates = Array.from(new Set(activityDates.filter(Boolean).map((d) => d.split("T")[0]))).sort(
    (a, b) => b.localeCompare(a),
  );

  if (dates.length === 0) return 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(dates[0]);

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i]);
    const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else if (diffDays > 1) {
      break;
    }
  }
  return streak;
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  // Dynamic state management for user profile details and stats
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userName, setUserName] = useState("Developer");
  const [streak, setStreak] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [level, setLevel] = useState(1);
  const [rank, setRank] = useState("DSA Initiate");
  const [nextLevelSolved, setNextLevelSolved] = useState(5);
  const [prevLevelSolved, setPrevLevelSolved] = useState(0);
  const [activeBadges, setActiveBadges] = useState<string[]>([]);

  useEffect(() => {
    async function loadSidebarStats() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) return;
      setUser(currentUser);

      const [problemsRes, solutionsRes, revisionsRes, profileRes] = await Promise.all([
        supabase.from("problems").select("created_at, status").eq("user_id", currentUser.id),
        supabase.from("solutions").select("created_at").eq("user_id", currentUser.id),
        supabase.from("revisions").select("revised_at").eq("user_id", currentUser.id),
        supabase.from("profiles").select("full_name").eq("id", currentUser.id).maybeSingle(),
      ]);

      const name = getUserDisplayName(currentUser, profileRes.data?.full_name);
      setUserName(name);

      const problems = problemsRes.data || [];
      const solutionsCount = solutionsRes.data?.length || 0;
      const revisions = revisionsRes.data || [];

      // Streak calculation
      const activityDates: string[] = [
        ...problems.map((p) => p.created_at),
        ...(solutionsRes.data || []).map((s: { created_at: string }) => s.created_at),
        ...revisions.map((r: { revised_at: string }) => r.revised_at),
      ];

      const currentStreak = calculateStreak(activityDates);
      setStreak(currentStreak);

      // Solves and Levels
      const solved = problems.filter((p) => p.status === "Solved").length;
      setSolvedCount(solved);

      let lvl = 1;
      let rk = "Initiate";
      let nextLvl = 5;
      let prevLvl = 0;

      if (solved <= 5) {
        lvl = 1;
        rk = "DSA Initiate";
        nextLvl = 5;
        prevLvl = 0;
      } else if (solved <= 15) {
        lvl = 2;
        rk = "DSA Explorer";
        nextLvl = 15;
        prevLvl = 5;
      } else if (solved <= 30) {
        lvl = 3;
        rk = "DSA Specialist";
        nextLvl = 30;
        prevLvl = 15;
      } else if (solved <= 50) {
        lvl = 4;
        rk = "DSA Master";
        nextLvl = 50;
        prevLvl = 30;
      } else {
        lvl = 5;
        rk = "DSA Grandmaster";
        nextLvl = 100;
        prevLvl = 50;
      }

      setLevel(lvl);
      setRank(rk);
      setNextLevelSolved(nextLvl);
      setPrevLevelSolved(prevLvl);

      // Achievements/Badges
      const badges: string[] = [];
      if (currentStreak >= 5) badges.push("🔥 Streak Elite");
      if (problems.length >= 10) badges.push("🛡️ Pattern Titan");
      if (solutionsCount >= 8) badges.push("⚡ Speed Runner");
      setActiveBadges(badges);
    }

    loadSidebarStats();

    // Listen for updates
    const handleProfileUpdate = () => {
      loadSidebarStats();
    };
    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, []);

  const progressPercent = Math.min(
    100,
    Math.round(((solvedCount - prevLevelSolved) / (nextLevelSolved - prevLevelSolved)) * 100),
  );

  const initials = getUserInitials(userName);

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border/40 bg-sidebar/55 backdrop-blur-md transition-all duration-300"
    >
      <SidebarHeader className="px-4 py-5 border-b border-sidebar-border/20">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow shadow-[0_0_20px_-4px_var(--primary)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight gradient-text">LearnNova</div>
              <div className="text-[10px] text-muted-foreground/80">DSA Second Brain</div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-4 space-y-4">
        {/* Dynamic Level Progress Panel */}
        {!collapsed && (
          <div className="mx-4 p-3.5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary-glow/5 backdrop-blur-sm shadow-inner space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary shadow-[0_0_10px_var(--primary-glow)] shrink-0">
                <Trophy className="h-4 w-4" />
              </div>
              <div className="leading-none min-w-0">
                <div className="text-xs font-black text-foreground truncate" title={rank}>
                  {rank}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Lvl {level} Mastery</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                <span>Next Lvl Progress</span>
                <span>
                  {solvedCount} / {nextLevelSolved}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-background/60 overflow-hidden border border-border/10">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Achievements group */}
        {!collapsed && activeBadges.length > 0 && (
          <SidebarGroup className="pt-0">
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-4">
              Achievements
            </SidebarGroupLabel>
            <div className="px-4 py-1 flex flex-wrap gap-2">
              {activeBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary-glow shadow-[0_0_8px_rgba(168,85,247,0.1)]"
                >
                  {badge}
                </span>
              ))}
            </div>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-4 mb-2">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-1">
              {NAV.map((item) => {
                const active = pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className={`w-full transition-all duration-300 rounded-lg h-9 px-3 flex items-center gap-3 ${
                        active
                          ? "bg-primary/20 text-white border border-primary/45 font-bold shadow-[0_0_15px_-3px_var(--primary-glow)] shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/25 transition-all duration-200"
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-3 w-full">
                        <item.icon
                          className={`h-4 w-4 shrink-0 transition-transform duration-300 ${active ? "text-primary shadow-[0_0_8px_var(--primary-glow)] scale-110" : "group-hover:scale-110"}`}
                        />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border/20">
        {collapsed ? (
          <div className="flex justify-center py-2">
            <Avatar className="h-8 w-8 ring-2 ring-primary/30 shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-[11px] font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary-glow/5 p-3.5 shadow-inner">
            <div className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8 ring-2 ring-primary/30 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-[11px] font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="leading-tight min-w-0 flex-1">
                <div className="text-xs font-bold text-foreground truncate" title={userName}>
                  {userName}
                </div>
                <div
                  className="text-[9px] text-muted-foreground/80 truncate"
                  title={user?.email || ""}
                >
                  {user?.email || "user@learnnova.app"}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/20 pt-2 mt-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-sidebar-foreground">
                <Flame className="h-3.5 w-3.5 fill-destructive text-destructive shrink-0" />
                <span>{streak} Day Streak</span>
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

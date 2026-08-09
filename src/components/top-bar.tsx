import { Bell, Search, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { getUserDisplayName, getUserInitials } from "@/lib/user-display-name";
import { UniversalSearch } from "./universal-search";

export function TopBar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();
    if (!error && data) {
      setProfileName(data.full_name);
    } else {
      setProfileName(null);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfileName(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user) {
        fetchProfile(user.id);
      }
    };

    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, [user]);

  // Handle global keyboard shortcuts Cmd+K and Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const displayName = getUserDisplayName(user, profileName);
  const initials = getUserInitials(displayName);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-border/40 bg-background/45 px-6 backdrop-blur-xl transition-all duration-300">
      <SidebarTrigger className="-ml-1 text-muted-foreground/80 hover:text-foreground transition-colors cursor-pointer" />

      {/* Desktop Search Button Trigger with striking Cmd+K/Ctrl+K badge */}
      <button
        onClick={() => setIsSearchOpen(true)}
        className="relative hidden flex-1 max-w-xl md:flex items-center text-left h-9 rounded-lg border border-border/40 bg-card/45 hover:bg-card/70 text-muted-foreground/70 text-sm focus:outline-none focus:ring-1 focus:ring-primary/45 transition-all duration-200 cursor-pointer shadow-inner px-9"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
        <span className="truncate">Search problems, notes, solutions...</span>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 select-none flex items-center gap-1">
          <kbd className="inline-flex h-5 items-center gap-0.5 rounded border border-primary/20 bg-primary/10 px-1.5 font-mono text-[9px] font-bold text-primary-glow shadow-[0_0_8px_rgba(168,85,247,0.1)]">
            ⌘K
          </kbd>
          <span className="text-[10px] text-muted-foreground/40">/</span>
          <kbd className="inline-flex h-5 items-center gap-0.5 rounded border border-primary/20 bg-primary/10 px-1.5 font-mono text-[9px] font-bold text-primary-glow shadow-[0_0_8px_rgba(168,85,247,0.1)]">
            Ctrl+K
          </kbd>
        </div>
      </button>

      <div className="ml-auto flex items-center gap-2">
        {/* Mobile Search Button Icon */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-muted-foreground/80 hover:text-foreground transition-all duration-200 hover:scale-105 cursor-pointer"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground/80 hover:text-foreground transition-all duration-200 hover:scale-105 cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary-glow)] animate-pulse" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/30">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-xs font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56 bg-card/95 backdrop-blur-md border border-border/40"
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                  Signed in as
                </p>
                <p
                  className="text-sm font-semibold leading-none truncate text-foreground"
                  title={displayName}
                >
                  {displayName}
                </p>
                <p
                  className="text-xs leading-none text-muted-foreground truncate"
                  title={user?.email || ""}
                >
                  {user?.email || "user@learnnova.app"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/20" />
            <DropdownMenuItem
              onClick={() => navigate({ to: "/settings" })}
              className="cursor-pointer focus:bg-primary/10 focus:text-primary-glow"
            >
              <User className="mr-2 h-4 w-4 text-muted-foreground/80" />
              <span>Profile</span>
              <kbd className="ml-auto hidden select-none items-center gap-1 rounded bg-muted/60 border border-border/40 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/75 sm:inline-flex">
                ⇧⌘P
              </kbd>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate({ to: "/settings" })}
              className="cursor-pointer focus:bg-primary/10 focus:text-primary-glow"
            >
              <Settings className="mr-2 h-4 w-4 text-muted-foreground/80" />
              <span>Settings</span>
              <kbd className="ml-auto hidden select-none items-center gap-1 rounded bg-muted/60 border border-border/40 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/75 sm:inline-flex">
                ⌘S
              </kbd>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/20" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
              <kbd className="ml-auto hidden select-none items-center gap-1 rounded bg-muted/60 border border-border/40 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/75 sm:inline-flex">
                ⌥L
              </kbd>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <UniversalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}

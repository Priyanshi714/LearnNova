import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";
import { supabase } from "@/lib/supabase";
import { getUserDisplayName } from "@/lib/user-display-name";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const ensureProfileExists = async (user: any) => {
    if (!user) return;
    try {
      console.log("Current User:", user);
      console.log("Checking profile...");
      const { data: profile, error: lookupError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (lookupError) {
        console.error("Error fetching user profile:", lookupError);
        return;
      }

      console.log("Profile lookup result:", profile);

      if (!profile) {
        console.log("Creating profile...");
        const fullName = getUserDisplayName(user, null);
        const { data: result, error } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            full_name: fullName,
            email: user.email || "",
          })
          .select();

        console.log("Profile insert result:", result);
        console.log("Profile insert error:", error);
      }
    } catch (err) {
      console.error("Exception in ensureProfileExists:", err);
    }
  };

  useEffect(() => {
    const checkAndInitProfile = async (session: any) => {
      if (session?.user) {
        await ensureProfileExists(session.user);
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!initialSession) {
        navigate({ to: "/login" });
      } else {
        checkAndInitProfile(initialSession);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!currentSession) {
        navigate({ to: "/login" });
      } else {
        checkAndInitProfile(currentSession);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading second brain...
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#030209] relative overflow-hidden">
        {/* Dashboard Ambient Glows (Clipped to layout boundary) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Top-left glow */}
          <div className="absolute top-[5%] -left-[10%] w-[600px] h-[600px] rounded-full bg-purple-600/[0.04] blur-[150px]" />
          {/* Hero section center-left glow */}
          <div className="absolute top-[20%] left-[10%] w-[800px] h-[800px] rounded-full bg-indigo-500/[0.03] blur-[200px]" />
          {/* Bottom-right glow */}
          <div className="absolute bottom-[10%] -right-[10%] w-[800px] h-[800px] rounded-full bg-purple-500/[0.04] blur-[200px]" />
        </div>

        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col bg-transparent relative z-10">
          <TopBar />
          <main className="flex-1 overflow-x-hidden">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

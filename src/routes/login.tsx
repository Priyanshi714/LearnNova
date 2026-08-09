import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Login — LearnNova" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("aakash@learnnova.app");
  const [password, setPassword] = useState("demopass");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate({ to: "/home" });
      }
    });
  }, [navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      // Automatic sign up check for dev convenience if they use demo credentials
      if (error.message.includes("Invalid login credentials")) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (signUpError) {
          toast.error(signUpError.message);
        } else {
          toast.success("Account created and logged in!");
          navigate({ to: "/home" });
        }
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Logged in successfully!");
      navigate({ to: "/home" });
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    });
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />

      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">LearnNova</span>
        </Link>

        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your second brain.</p>

          <form className="mt-6 space-y-4" onSubmit={handleEmailLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@learnnova.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full border-border/60"
              >
                Continue with Google
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            New here?{" "}
            <Link to="/home" className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

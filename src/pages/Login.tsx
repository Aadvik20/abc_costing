import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, Lock, LogIn, Train, User } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("admin");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If user is already logged in, directly open dashboard
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("abcCostingLoggedIn");

    if (isLoggedIn === "true") {
      navigate("/activitybasedcosting", { replace: true });
    }
  }, [navigate]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!userId.trim()) {
      setError("Please enter User ID.");
      return;
    }

    if (!password) {
      setError("Please enter password.");
      return;
    }

    setLoading(true);

    // Demo authentication
    setTimeout(() => {
      if (userId.trim() === "admin" && password === "123456") {
        // Save login state
        localStorage.setItem("abcCostingLoggedIn", "true");
        localStorage.setItem("abcCostingUser", userId.trim());

        setLoading(false);

        // Go to dashboard
        navigate("/activitybasedcosting", { replace: true });
      } else {
        setLoading(false);
        setError("Invalid User ID or password.");
      }
    }, 900);
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 p-4">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 size-96 rounded-full bg-sky-500/20 blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-black/40 dark:bg-slate-900">
        {/* Header */}
        <div className="space-y-3 px-8 pb-2 pt-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/30">
            <Train className="size-6" />
          </span>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to ABC Costing
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-5 p-8 pt-4">
          {/* User ID */}
          <div className="grid gap-1.5">
            <Label htmlFor="userId">User ID</Label>

            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="userId"
                type="text"
                autoComplete="username"
                autoFocus
                placeholder="Enter your User ID"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setError("");
                }}
                className="h-11 pl-9 focus-visible:border-blue-400"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>

              <button
                type="button"
                className="text-xs font-medium text-blue-600 hover:underline"
                onClick={() => {
                  setError("Please contact administrator to reset your password.");
                }}
              >
                Forgot password?
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="h-11 pl-9 pr-10 focus-visible:border-blue-400"
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
            >
              {error}
            </p>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full bg-gradient-to-r from-blue-600 to-sky-500 text-base font-semibold shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-sky-600"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="size-4" />
                Login
              </>
            )}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="border-t bg-slate-50 px-8 py-3 text-center dark:bg-slate-800">
          <p className="text-xs text-muted-foreground">
            Demo User ID:{" "}
            <span className="font-semibold text-foreground">admin</span>
            {"  |  "}
            Password:{" "}
            <span className="font-semibold text-foreground">123456</span>
          </p>
        </div>
      </div>
    </div>
  );
}


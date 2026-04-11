import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useBug } from "@/context/BugContext";
import { loginRequest } from "@/lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isBug } = useBug();

  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInternalError, setIsInternalError] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await loginRequest(email, password);

      if (isBug("login_500")) {
        setIsInternalError(true);
        return;
      }

      if (result.ok) {
        login(result.token);
        navigate("/dashboard", { replace: true });
        return;
      }

      if (result.status === 401) {
        if (!isBug("login_no_error")) {
          setError("Invalid credentials");
        }
        return;
      }

      setError(result.message);
    } catch {
      if (isBug("login_500")) {
        setIsInternalError(true);
        return;
      }

      setError("Unexpected error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isInternalError) {
    return (
      <main className="min-h-screen bg-white p-6 text-black">
        <p>Internal Server Error</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-amber-100/80 bg-white/85 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to access TaskMaster Pro.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error ? (
              <p className="text-sm font-semibold text-red-600">{error}</p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

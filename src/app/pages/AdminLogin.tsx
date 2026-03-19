import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, ShieldAlert, Clock, Mail } from "lucide-react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { login, getLockoutRemaining } from "../adminAuth";

interface Props { onSuccess: () => void; }

function formatMs(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.ceil((ms % 60000) / 1000);
  return m > 0 ? `${m} min ${s} s` : `${s} s`;
}

export function AdminLogin({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockoutMs, setLockoutMs] = useState(getLockoutRemaining());

  useEffect(() => {
    if (lockoutMs <= 0) return;
    const id = setInterval(() => {
      const remaining = getLockoutRemaining();
      setLockoutMs(remaining);
      if (remaining <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [lockoutMs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      onSuccess();
    } else if (result.reason === "locked_out") {
      setLockoutMs(result.remainingMs);
    } else {
      setPassword("");
      setError(
        result.attemptsLeft === 1
          ? "Identifiants incorrects. Encore 1 tentative avant blocage."
          : `Identifiants incorrects. Il reste ${result.attemptsLeft} tentatives.`
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Accès Admin</h1>
          <p className="text-sm text-muted-foreground">Espace réservé à l'administration</p>
        </div>

        <Card className="p-6 shadow-lg">
          {lockoutMs > 0 ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Compte temporairement bloqué</p>
                <p className="text-sm text-muted-foreground mt-1">Trop de tentatives incorrectes.</p>
              </div>
              <div className="flex items-center justify-center gap-2 bg-destructive/5 rounded-lg py-3 px-4">
                <Clock className="w-4 h-4 text-destructive" />
                <span className="text-sm font-mono font-medium text-destructive">{formatMs(lockoutMs)}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@votresite.com"
                    autoComplete="username"
                    required
                    className="pl-9"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="pr-10"
                  />
                  <button type="button" tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShow((v) => !v)}>
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-destructive/10 text-destructive rounded-lg px-3 py-2.5 text-sm">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" disabled={loading || !email || !password}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                {loading ? "Connexion…" : "Se connecter"}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          Compte créé dans Supabase Dashboard → Authentication → Users
        </p>
      </div>
    </div>
  );
}

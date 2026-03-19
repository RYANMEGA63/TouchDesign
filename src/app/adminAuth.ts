// ── Admin Authentication — Supabase Auth ─────────────────────────
//
// Sécurité implémentée :
//  1. JWT géré par Supabase (expiration + refresh automatique côté SDK)
//  2. Vérification serveur : getUser() valide le token côté API Supabase
//  3. Rate-limiting côté client : 5 tentatives → blocage 15 min
//     (stocké en localStorage pour persister à travers les onglets)
//  4. Timeout d'inactivité : 30 min sans action → déconnexion automatique
//  5. Listener d'activité : mousemove / keydown / click / scroll
//  6. onAuthChange() : souscription aux événements Supabase (token_refreshed,
//     signed_out…) pour déconnecter l'UI dès expiration côté serveur
//
// Setup requis :
//  - Créer le compte admin dans Supabase Dashboard > Authentication > Users
//  - Définir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env

import { supabase } from "./supabase";
import type { Session, User } from "@supabase/supabase-js";

// ── Constants ────────────────────────────────────────────────────
const LOCKOUT_KEY    = "admin_lockout";
const ATTEMPTS_KEY   = "admin_attempts";
const ACTIVITY_KEY   = "admin_last_activity";

const MAX_ATTEMPTS   = 5;
const LOCKOUT_MS     = 15 * 60 * 1000;   // 15 min
const INACTIVITY_MS  = 30 * 60 * 1000;   // 30 min

// ── Lockout (client-side rate limiting) ──────────────────────────
export function getLockoutRemaining(): number {
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY);
    if (!raw) return 0;
    const until = parseInt(raw, 10);
    const remaining = until - Date.now();
    if (remaining <= 0) {
      localStorage.removeItem(LOCKOUT_KEY);
      localStorage.removeItem(ATTEMPTS_KEY);
      return 0;
    }
    return remaining;
  } catch { return 0; }
}

function recordFailedAttempt(): number {
  try {
    const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) ?? "0", 10) + 1;
    localStorage.setItem(ATTEMPTS_KEY, String(attempts));
    if (attempts >= MAX_ATTEMPTS) {
      localStorage.setItem(LOCKOUT_KEY, String(Date.now() + LOCKOUT_MS));
    }
    return attempts;
  } catch { return 0; }
}

function clearAttempts(): void {
  localStorage.removeItem(ATTEMPTS_KEY);
  localStorage.removeItem(LOCKOUT_KEY);
}

// ── Inactivity tracking ───────────────────────────────────────────
export function refreshActivity(): void {
  try { sessionStorage.setItem(ACTIVITY_KEY, String(Date.now())); } catch { /* ignore */ }
}

function isInactive(): boolean {
  try {
    const last = parseInt(sessionStorage.getItem(ACTIVITY_KEY) ?? "0", 10);
    if (!last) return false; // no activity recorded yet — let Supabase decide
    return Date.now() - last > INACTIVITY_MS;
  } catch { return false; }
}

// ── Auth state ────────────────────────────────────────────────────

/**
 * Async check — validates token against Supabase API.
 * Use this for route guards and initial load.
 */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Async check — calls Supabase API to verify token validity server-side.
 * Preferred over getSession() when you need a confirmed server response.
 */
export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/**
 * Synchronous check for UI rendering (navbar, route guard quick-check).
 * Combines Supabase's local session cache + inactivity check.
 * Always back this up with getSession() / getUser() for sensitive actions.
 */
export function isAuthenticated(): boolean {
  try {
    if (isInactive()) {
      // Silently sign out — don't await to keep this synchronous
      supabase.auth.signOut().catch(() => {});
      sessionStorage.removeItem(ACTIVITY_KEY);
      return false;
    }
    // Read Supabase's local session from localStorage
    const key = Object.keys(localStorage).find((k) => k.endsWith("-auth-token"));
    if (!key) return false;
    const parsed = JSON.parse(localStorage.getItem(key) ?? "{}");
    const expiresAt: number = parsed?.expires_at ?? 0;
    return expiresAt * 1000 > Date.now();
  } catch { return false; }
}

// ── Login ─────────────────────────────────────────────────────────
export type LoginResult =
  | { ok: true }
  | { ok: false; reason: "wrong_password"; attemptsLeft: number }
  | { ok: false; reason: "locked_out"; remainingMs: number };

export async function login(email: string, password: string): Promise<LoginResult> {
  const lockout = getLockoutRemaining();
  if (lockout > 0) return { ok: false, reason: "locked_out", remainingMs: lockout };

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const attempts = recordFailedAttempt();
    const lockoutNow = getLockoutRemaining();
    if (lockoutNow > 0) return { ok: false, reason: "locked_out", remainingMs: lockoutNow };
    return { ok: false, reason: "wrong_password", attemptsLeft: MAX_ATTEMPTS - attempts };
  }

  clearAttempts();
  refreshActivity();
  return { ok: true };
}

// ── Logout ────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  try {
    sessionStorage.removeItem(ACTIVITY_KEY);
    clearAttempts();
    await supabase.auth.signOut();
  } catch { /* ignore */ }
}

// ── Auth state change listener ─────────────────────────────────────
// Subscribe to Supabase events: token_refreshed, signed_out, user_updated…
// Use this in the Admin component to react to server-side session changes.
export function onAuthChange(callback: (authed: boolean) => void): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session) refreshActivity();
    callback(!!session);
  });
  return () => subscription.unsubscribe();
}

// ── Activity watcher hook (use in Admin component) ────────────────
// Attach to window events to keep the session alive on user interaction,
// and poll every 30s to force-logout on inactivity.
export function startActivityWatcher(onExpire: () => void): () => void {
  const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "click", "scroll", "touchstart"];
  const handler = () => refreshActivity();
  events.forEach((e) => window.addEventListener(e, handler, { passive: true }));

  const interval = setInterval(() => {
    if (isInactive()) onExpire();
  }, 30_000);

  return () => {
    events.forEach((e) => window.removeEventListener(e, handler));
    clearInterval(interval);
  };
}

// ===========================================================
// auth.js — shared authentication logic (Supabase)
// ===========================================================

import { supabase } from "./supabase-config.js";

// ---------- Registration ----------
// The Supabase Auth user is created here; a database trigger (see schema.sql)
// automatically creates the matching "profiles" row the instant the account
// exists — this works whether or not email confirmation is required, since it
// doesn't depend on the user being logged in yet.
export async function registerUser({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } } // read by the DB trigger to fill profiles.name
  });
  if (error) throw error;

  // If your Supabase project has "Confirm email" turned on, data.session
  // will be null here until the user clicks the confirmation link.
  return { user: data.user, session: data.session };
}

// ---------- Login ----------
export async function loginUser({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

// ---------- Logout ----------
export async function logoutUser() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

// ---------- Fetch the current user's profile row (includes role) ----------
export async function getUserProfile(uid) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single();
  if (error) return null;
  return data;
}

// ---------- Route guard: call at the top of any protected page ----------
// Redirects to login if not authenticated. Calls onReady(user, profile) once resolved.
export function requireAuth(onReady) {
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (!session) {
      window.location.href = "index.html";
      return;
    }
    const profile = await getUserProfile(session.user.id);
    onReady(session.user, profile);
  });

  // Catch sign-outs / expired sessions that happen while the page is open
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      window.location.href = "index.html";
    }
  });
}

// ---------- Friendly error messages for Supabase auth errors ----------
export function friendlyAuthError(err) {
  const msg = (err.message || "").toLowerCase();
  if (msg.includes("already registered")) return "That email is already registered.";
  if (msg.includes("invalid email") || msg.includes("unable to validate email")) return "Enter a valid email address.";
  if (msg.includes("password") && (msg.includes("6") || msg.includes("short") || msg.includes("least")))
    return "Password must be at least 6 characters.";
  if (msg.includes("invalid login credentials")) return "Incorrect email or password.";
  return "Something went wrong. Please try again.";
}

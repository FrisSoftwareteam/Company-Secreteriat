"use server";

import { db } from "@/lib/db";
import {
  clearSessionCookie,
  createSession,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { redirect } from "next/navigation";

export type AuthState = {
  error?: string;
};

export async function signupAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: { email, passwordHash },
  });

  const session = await createSession(user.id);
  await setSessionCookie(session.token, session.expiresAt);

  redirect("/dashboard");
}

export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const loginAs = String(formData.get("loginAs") || "").toUpperCase();
  const identifier = String(formData.get("identifier") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!loginAs || !identifier || !password) {
    return { error: "Login role, username/email and password are required." };
  }

  if (loginAs !== "ADMIN" && loginAs !== "USER") {
    return { error: "Invalid login role selected." };
  }

  const user = await db.user.findUnique({ where: { email: identifier } });
  if (!user) {
    return { error: "Invalid username/email or password." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid username/email or password." };
  }

  if (user.role !== loginAs) {
    return { error: `This account is registered as ${user.role}. Please choose ${user.role} login.` };
  }

  const session = await createSession(user.id);
  await setSessionCookie(session.token, session.expiresAt);

  redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

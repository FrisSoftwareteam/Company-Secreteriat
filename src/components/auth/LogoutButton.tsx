"use client";

import { logoutAction } from "@/app/(auth)/actions";

export function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button className={`button ${className}`} type="submit">
        Logout
      </button>
    </form>
  );
}

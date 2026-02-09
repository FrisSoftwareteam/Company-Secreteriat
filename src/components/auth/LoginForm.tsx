"use client";

import { useFormState } from "react-dom";
import { loginAction, AuthState } from "@/app/(auth)/actions";

const initialState: AuthState = {};

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="form-grid">
      <div className="form-field">
        <label htmlFor="loginAs">Login as</label>
        <select id="loginAs" name="loginAs" defaultValue="USER" required>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="identifier">Username or Email</label>
        <input id="identifier" name="identifier" type="text" required />
      </div>
      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
      </div>
      {state.error ? <p className="notice">{state.error}</p> : null}
      <button className="button primary" type="submit">
        Login
      </button>
    </form>
  );
}

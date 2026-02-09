"use client";

import { useFormState } from "react-dom";
import { signupAction, AuthState } from "@/app/(auth)/actions";

const initialState: AuthState = {};

export function SignupForm() {
  const [state, formAction] = useFormState(signupAction, initialState);

  return (
    <form action={formAction} className="form-grid">
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
      </div>
      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" minLength={8} required />
      </div>
      {state.error ? <p className="notice">{state.error}</p> : null}
      <button className="button primary" type="submit">
        Create Account
      </button>
    </form>
  );
}

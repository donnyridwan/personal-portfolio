'use client';
import { useActionState } from 'react';
import { login } from '../session-actions';

export default function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="adm-card adm-login-card">
      <h1>Donny Ridwan · Admin</h1>
      <label className="adm-field">
        <span>Password</span>
        <input type="password" name="password" autoComplete="current-password" autoFocus required />
      </label>
      {error && <p className="adm-error" role="alert">{error}</p>}
      <button className="adm-btn adm-primary" disabled={pending}>{pending ? 'Memeriksa…' : 'Masuk'}</button>
    </form>
  );
}

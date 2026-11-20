'use client';
import { useState, type InputHTMLAttributes } from 'react';

/** Kolom password dengan tombol mata untuk menampilkan/menyembunyikan isinya. */
export default function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [show, setShow] = useState(false);
  return (
    <span className="adm-pw">
      <input {...props} type={show ? 'text' : 'password'} />
      <button
        type="button"
        className="adm-pw-toggle"
        onClick={() => setShow(s => !s)}
        aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
        aria-pressed={show}
        title={show ? 'Sembunyikan password' : 'Tampilkan password'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
          {show && <path d="M3 3l18 18" />}
        </svg>
      </button>
    </span>
  );
}

'use client';
import { startTransition, type FormEvent } from 'react';

/**
 * <form action={…}> di React 19 mengosongkan isian setelah submit, termasuk saat validasi gagal.
 * Handler onSubmit ini mengirim FormData ke action useActionState tanpa reset.
 */
export function submitWithoutReset(dispatch: (f: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => dispatch(data));
  };
}

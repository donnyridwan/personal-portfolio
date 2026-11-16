import { redirect } from 'next/navigation';

// /admin = situs yang sama dengan pengunjung, dalam mode edit.
export default function AdminHome() {
  redirect('/?edit');
}

import { buildFinderData } from '@/lib/finder-data';
import { getSettings } from '@/lib/repo';
import ProfileForm from './ProfileForm';

export const metadata = { title: 'Profil · Dockfolio Admin' };

export default async function ProfilePage() {
  // buildFinderData merapikan nilai kosong/rusak jadi bentuk default yang aman.
  const { about, contact, resume } = buildFinderData([], [], await getSettings());
  return (
    <>
      <h1>Profil</h1>
      <ProfileForm about={about} contact={contact} resume={resume} />
    </>
  );
}

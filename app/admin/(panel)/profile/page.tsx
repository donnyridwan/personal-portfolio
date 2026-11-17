import { aiSettingsFrom } from '@/lib/ai';
import { buildFinderData } from '@/lib/finder-data';
import { getSettings } from '@/lib/repo';
import ProfileForm from './ProfileForm';

export const metadata = { title: 'Profil · Donny Ridwan · Admin' };

export default async function ProfilePage() {
  // buildFinderData merapikan nilai kosong/rusak jadi bentuk default yang aman.
  const settings = await getSettings();
  const { about, contact, resume } = buildFinderData([], [], settings);
  const ai = aiSettingsFrom(settings.ai);
  return (
    <>
      <h1>Profil</h1>
      <ProfileForm about={about} contact={contact} resume={resume} ai={ai} />
    </>
  );
}

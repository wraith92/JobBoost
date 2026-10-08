import {
  LoaderCircle,
} from 'lucide-react';

export default function ProfileLoading() {
  return (
    <main className="profile-page">
      <div
        className="
          flex min-h-[420px]
          items-center
          justify-center
        "
      >
        <LoaderCircle
          size={28}
          className="
            animate-spin
            text-violet-500
          "
        />
      </div>
    </main>
  );
}
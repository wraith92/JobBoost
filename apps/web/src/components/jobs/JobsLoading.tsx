import {
  LoaderCircle,
} from 'lucide-react';

export default function JobsLoading() {
  return (
    <main className="jobs-page">
      <div
        className="
          flex min-h-[420px]
          items-center
          justify-center
        "
      >
        <div className="text-center">
          <LoaderCircle
            size={28}
            className="
              mx-auto
              animate-spin
              text-violet-500
            "
          />

          <p
            className="
              mt-4
              text-[12px]
              font-semibold
              text-zinc-700

              dark:text-zinc-300
            "
          >
            Chargement des offres
          </p>

          <p
            className="
              mt-1
              text-[10px]
              text-zinc-400
            "
          >
            JobBoost AI
          </p>
        </div>
      </div>
    </main>
  );
}
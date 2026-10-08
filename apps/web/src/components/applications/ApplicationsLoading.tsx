import {
  LoaderCircle,
} from 'lucide-react';

export default function ApplicationsLoading() {
  return (
    <main className="applications-page">
      <div
        className="
          flex min-h-[420px]
          items-center
          justify-center
        "
      >
        <div className="text-center">
          <LoaderCircle
            size={27}
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
            Chargement des candidatures
          </p>
        </div>
      </div>
    </main>
  );
}
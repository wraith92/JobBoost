import {
  LoaderCircle,
} from 'lucide-react';

export default function ResumeLoading() {
  return (
    <main className="resume-page">
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
            Chargement du CV
          </p>

          <p
            className="
              mt-1
              text-[10px]
              text-zinc-400
            "
          >
            Préparation du document personnalisé
          </p>
        </div>
      </div>
    </main>
  );
}
'use client';

import {
    useEffect,
    useState,
} from 'react';

import {
    useParams,
    useRouter,
} from 'next/navigation';

const API_URL = 'http://localhost:3001';

type CoverLetter = {
    id: string;
    jobId: string;
    resumeId: string | null;

    title: string;
    content: string;
    status: string;

    job?: {
        id: string;
        title: string;
        company: string | null;
    };
};

export default function CoverLetterPage() {
    const params = useParams();
    const router = useRouter();

    const letterId =
        params.id as string;

    const [
        letter,
        setLetter,
    ] = useState<CoverLetter | null>(
        null,
    );

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        copied,
        setCopied,
    ] = useState(false);
    const [
        preparingApplication,
        setPreparingApplication,
    ] = useState(false);

    async function prepareApplication() {
        if (!letter) {
            return;
        }

        if (!letter.resumeId) {
            alert(
                'Aucun CV associé à cette lettre.',
            );

            return;
        }

        try {
            setPreparingApplication(true);

            const response = await fetch(
                `${API_URL}/applications`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json',
                    },

                    body: JSON.stringify({
                        jobId:
                            letter.jobId,

                        resumeId:
                            letter.resumeId,

                        coverLetterId:
                            letter.id,

                        channel:
                            'MANUAL',
                    }),
                },
            );

            if (!response.ok) {
                const message =
                    await response.text();

                throw new Error(
                    message ||
                    'Impossible de préparer la candidature',
                );
            }

            await response.json();

            router.push(
                '/applications',
            );
        } catch (error) {
            console.error(
                error,
            );

            alert(
                error instanceof Error
                    ? error.message
                    : 'Erreur pendant la préparation de la candidature',
            );
        } finally {
            setPreparingApplication(
                false,
            );
        }
    }

    useEffect(() => {
        async function loadLetter() {
            try {
                const response =
                    await fetch(
                        `${API_URL}/cover-letter/${letterId}`,
                    );

                if (!response.ok) {
                    throw new Error(
                        'Lettre introuvable',
                    );
                }

                const data =
                    (await response.json()) as CoverLetter;

                setLetter(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        if (letterId) {
            void loadLetter();
        }
    }, [letterId]);

    async function copyLetter() {
        if (!letter) {
            return;
        }

        await navigator.clipboard.writeText(
            letter.content,
        );

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-100 p-8">
                Chargement de la lettre...
            </main>
        );
    }

    if (!letter) {
        return (
            <main className="min-h-screen bg-gray-100 p-8">
                Lettre introuvable.
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 py-10">
            <div className="mx-auto max-w-4xl px-4">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm text-gray-500">
                            Lettre personnalisée
                        </p>

                        <h1 className="font-semibold text-gray-900">
                            {letter.job?.title ??
                                letter.title}
                        </h1>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                router.back()
                            }
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
                        >
                            Retour
                        </button>

                        <button
                            type="button"
                            onClick={copyLetter}
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
                        >
                            {copied
                                ? 'Copié ✓'
                                : 'Copier'}
                        </button>
                        <button
                            type="button"
                            onClick={prepareApplication}
                            disabled={preparingApplication}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {preparingApplication
                                ? 'Préparation...'
                                : 'Préparer la candidature'}
                        </button>
                        <a
                            href={`${API_URL}/cover-letter/${letter.id}/pdf`}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            Télécharger PDF
                        </a>
                    </div>
                </div>

                <article className="min-h-[297mm] bg-white px-12 py-12 shadow-lg">
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Abderrahmane Ben Salah
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Développeur Full-Stack, Data & IA
                        </p>
                    </div>

                    <div className="whitespace-pre-line text-[15px] leading-7 text-gray-800">
                        {letter.content}
                    </div>
                </article>
            </div>
        </main>
    );
}
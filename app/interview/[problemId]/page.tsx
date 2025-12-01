import { InterviewSession } from '@/components/interview/InterviewSession';
import { PROBLEMS } from '@/lib/problems';
import { notFound } from 'next/navigation';

interface PageProps {
    params: {
        problemId: string;
    };
}

export function generateStaticParams() {
    return PROBLEMS.map((problem) => ({
        problemId: problem.id,
    }));
}

export default async function InterviewPage({ params }: PageProps) {
    const { problemId } = await params;
    const problem = PROBLEMS.find(p => p.id === problemId);

    if (!problem) {
        notFound();
    }

    return <InterviewSession problem={problem} />;
}

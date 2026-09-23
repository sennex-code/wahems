import { TablePagination } from '@/components/reusable/table-pagination';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Download } from 'lucide-react';
import { route } from 'ziggy-js';

type participant = {
    submitted_at: string;
    event_participant_id: number;
    first_name: string;
    last_name: string;
    middle_initial: string;
    suffix: string;
    email: string;
    eventParticipantAnswers: Record<number, eventParticipantAnswers[]>;
};

type eventParticipantAnswers = {
    label: string;
    question_id: number;
    text_answer: string | null;
};

type questionType = {
    category: string;
    question_name: string;
    type: string;
    question_id: number;
};

type LinkType = {
    active: boolean;
    label: string;
    page: number;
    url: string;
};
type surveyParticipantsType = {
    surveyParticipants: {
        data: participant[];
        links: LinkType[];
    };
    questions: questionType[];
    submissionId: number;
    surveyName: string;
};

const SurveyXlxs = ({
    surveyParticipants,
    questions,
    submissionId,
    surveyName,
}: surveyParticipantsType) => {
    console.log(submissionId);

    const exportXLXS = (submissionId: number) => {
        if (!submissionId) {
            return;
        }
        window.location.href = route('survey.export', {
            surveySubmissionId: submissionId,
        });
    };
    return (
        <div className="min-h-screen bg-muted/30 px-4 py-6 md:px-6">
            <Head title={surveyName}></Head>
            <Button>
                <Link href={route('survey.index')}>
                    <ArrowLeft></ArrowLeft>
                </Link>
            </Button>
            <div className="mx-auto max-w-400 space-y-4">
                <div className="flex flex-row justify-between space-y-1">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Survey Responses
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Per-question responses of submitted survey
                            participants.
                        </p>
                    </div>
                    <Button size="lg" onClick={() => exportXLXS(submissionId)}>
                        <Download></Download>
                        Download as XLSX
                    </Button>
                </div>

                <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableCaption className="py-4 text-sm text-muted-foreground">
                                Participant responses by question
                            </TableCaption>

                            <TableHeader className="bg-muted/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="sticky left-0 z-20 min-w-55 border-b bg-muted/50 text-center font-semibold">
                                        Participant
                                    </TableHead>
                                    <TableHead className="sticky left-55 z-20 min-w-55 border-b bg-muted/50 text-center font-semibold">
                                        Email
                                    </TableHead>
                                    <TableHead className="min-w-30 border-b text-center font-semibold">
                                        Submitted
                                    </TableHead>

                                    {questions.map(
                                        (
                                            question: questionType,
                                            index: number,
                                        ) => (
                                            <TableHead
                                                key={index}
                                                title={question.question_name}
                                                className="min-w-30 border-b text-center font-semibold whitespace-nowrap"
                                            >
                                                Q{index + 1}
                                            </TableHead>
                                        ),
                                    )}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {surveyParticipants.data.map(
                                    (
                                        participant: participant,
                                        index: number,
                                    ) => (
                                        <TableRow
                                            key={index}
                                            className="hover:bg-muted/30"
                                        >
                                            <TableCell className="sticky left-0 z-10 max-w-55 border-t bg-background align-top font-medium">
                                                <div className="line-clamp-2">
                                                    {participant.last_name},{' '}
                                                    {participant.first_name}{' '}
                                                    {participant.middle_initial ??
                                                        ''}
                                                    . {participant.suffix ?? ''}
                                                </div>
                                            </TableCell>

                                            <TableCell className="sticky left-55 z-10 max-w-55 border-t bg-background align-top text-sm text-muted-foreground">
                                                <div
                                                    className="truncate"
                                                    title={participant.email}
                                                >
                                                    {participant.email}
                                                </div>
                                            </TableCell>

                                            <TableCell className="border-t text-center align-top text-sm">
                                                {participant.submitted_at}
                                            </TableCell>

                                            {questions.map(
                                                (
                                                    question: questionType,
                                                    index: number,
                                                ) => (
                                                    <TableCell
                                                        key={`${participant.event_participant_id}-${index}`}
                                                        className="max-w-45 border-t text-center align-top"
                                                        title={participant.eventParticipantAnswers[
                                                            question.question_id
                                                        ]
                                                            ?.map(
                                                                (
                                                                    answer: eventParticipantAnswers,
                                                                ) =>
                                                                    answer.text_answer ||
                                                                    answer.label,
                                                            )
                                                            .join(', ')}
                                                    >
                                                        <div className="line-clamp-3 text-sm leading-5">
                                                            {participant.eventParticipantAnswers[
                                                                question
                                                                    .question_id
                                                            ]
                                                                ?.map(
                                                                    (
                                                                        answer: eventParticipantAnswers,
                                                                    ) =>
                                                                        answer.text_answer ||
                                                                        answer.label,
                                                                )
                                                                .join(', ') ||
                                                                '-'}
                                                        </div>
                                                    </TableCell>
                                                ),
                                            )}
                                        </TableRow>
                                    ),
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="rounded-xl border bg-background px-4 py-3 shadow-sm">
                    <TablePagination links={surveyParticipants.links} />
                </div>
            </div>
        </div>
    );
};

export default SurveyXlxs;

import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import {
    CalendarRange,
    ClipboardList,
    FileBarChart2,
    ChevronRight,
    Download,
    NotebookIcon,
    Home,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { TablePagination } from '@/components/reusable/table-pagination';
import { Label } from '@/components/ui/label';
import { Empty, EmptyDescription, EmptyHeader } from '@/components/ui/empty';
import Lottie from 'lottie-react';
import errorAnimation from '../../lottie/NoResult.json';
import InvolvedFacilitiesModal from '@/components/event/involved-facilities-modal';
import ExamManagementModal from '@/components/ExamManagementModal';

type Choice = {
    id: number;
    choice_text: string;
    is_correct: boolean;
};

type Question = {
    id: number;
    question_text: string;
    choices: Choice[];
};

type Answer = {
    id: number;
    question_id: number;
    selected_choice_id: number;
    question: Question;
    selected_choice: Choice;
};

type Participant = {
    id: number;
    first_name: string;
    middle_initial: string | null;
    last_name: string;
    suffix: string | null;
    designation: string;
    email: string;
};

type EventParticipant = {
    id: number;
    participant_id: number;
    attendance_code: string;
    participant: Participant;
};

type Attempt = {
    id: number;
    exam_id: number;
    participant_id: number;
    score: number;
    submitted_at: string | null;
    participant: EventParticipant;
    answers: Answer[];
};

type Exam = {
    id: number;
    exam_type: 'pre' | 'post';
    title: string;
    attempts: Attempt[];
    isActive: boolean;
};

type Event = {
    id: number;
    name: string;
    start_at: string;
    end_at: string;
    exams: Exam[];
};

type Props = {
    events: Event[];
};

const formatName = (p: Participant) => {
    const mi = p.middle_initial ? ` ${p.middle_initial?.charAt(0).toUpperCase()}.` : '';
    const suf = p.suffix ? ` ${p.suffix}` : '';
    return `${p.first_name}${mi} ${p.last_name}${suf}`;
};

const getTotalItemsFromAttempt = (attempt?: Attempt) =>
    attempt?.answers?.length ?? 0;
const pct = (num: number, den: number) =>
    den <= 0 ? 0 : Math.round((num / den) * 100);

function ExamStatusBadge({
    label,
    active,
}: {
    label: string;
    active: boolean;
}) {
    return (
        <Badge
            variant="secondary"
            className={[
                'gap-2 rounded-full px-2.5 py-1 font-medium',
                active
                    ? 'border border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400'
                    : 'border border-muted-foreground/20 bg-muted/40 text-muted-foreground',
            ].join(' ')}
        >
            <span
                className={[
                    'h-2 w-2 rounded-full',
                    active ? 'bg-emerald-500' : 'bg-muted-foreground/60',
                ].join(' ')}
                aria-hidden="true"
            />
            <span className="whitespace-nowrap">
                {label}: {active ? 'Active' : 'Inactive'}
            </span>
        </Badge>
    );
}

export default function ExamResult({ events }: any) {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [ExamManagementModalOpen, setExamManagementModalOpen] = useState(false);

    // which attempt (pre OR post) is being viewed in answers dialog
    const [selectedAttempt, setSelectedAttempt] = useState<{
        type: 'pre' | 'post';
        attempt: Attempt;
    } | null>(null);

    // open overall analytics dialog for pre/post
    const [selectedAnalyticsExamType, setSelectedAnalyticsExamType] = useState<
        'pre' | 'post' | null
    >(null);

    const isEventDialogOpen = !!selectedEvent;
    const isAnswersDialogOpen = !!selectedAttempt;
    const isAnalyticsDialogOpen =
        !!selectedEvent && !!selectedAnalyticsExamType;

    const preExam = selectedEvent?.exams?.find((e) => e.exam_type === 'pre');
    const postExam = selectedEvent?.exams?.find((e) => e.exam_type === 'post');

    const [modalOpen, setModalOpen] = useState(false);
    const [clusters, setClusters] = useState<any[]>([]);

 const handleOpenModal = (event: EventType) => {

        setClusters(event.clusters?? []); // set clusters for the selected event
        setModalOpen(true);          // open modal
    };

    const participants = useMemo(() => {
        if (!selectedEvent) return [];

        const map = new Map<
            number,
            { participant: EventParticipant; pre?: Attempt; post?: Attempt }
        >();

        for (const ex of selectedEvent.exams ?? []) {
            for (const at of ex.attempts ?? []) {
                const eventParticipantId =
                    at.participant?.id ?? at.participant_id;

                if (!map.has(eventParticipantId)) {
                    map.set(eventParticipantId, {
                        participant: at.participant,
                    });
                }

                const row = map.get(eventParticipantId)!;
                if (ex.exam_type === 'pre') row.pre = at;
                if (ex.exam_type === 'post') row.post = at;
            }
        }

        return Array.from(map.values());
    }, [selectedEvent]);

    const eventSummary = useMemo(() => {
        if (!selectedEvent) return null;

        const sum = (attempts: Attempt[]) => {
            const submitted = attempts.filter((a) => !!a.submitted_at);
            const totalScore = submitted.reduce(
                (acc, a) => acc + (a.score ?? 0),
                0,
            );
            const totalItems = submitted.reduce(
                (acc, a) => acc + getTotalItemsFromAttempt(a),
                0,
            );

            return {
                submittedCount: submitted.length,
                avgScore: submitted.length ? totalScore / submitted.length : 0,
                avgItems: submitted.length ? totalItems / submitted.length : 0,
            };
        };

        const pre = sum(preExam?.attempts ?? []);
        const post = sum(postExam?.attempts ?? []);

        return { pre, post };
    }, [selectedEvent, preExam, postExam]);

    const questionAnalytics = useMemo(() => {
        if (!selectedEvent || !selectedAnalyticsExamType) return [];

        const exam = selectedAnalyticsExamType === 'pre' ? preExam : postExam;
        if (!exam) return [];

        const attempts = (exam.attempts ?? []).filter((a) => !!a.submitted_at);

        const stats = new Map<
            number,
            {
                questionId: number;
                questionText: string;
                total: number;
                correct: number;
                wrong: number;
            }
        >();

        for (const attempt of attempts) {
            for (const ans of attempt.answers ?? []) {
                const isCorrect = !!ans.selected_choice?.is_correct;

                if (!stats.has(ans.question_id)) {
                    stats.set(ans.question_id, {
                        questionId: ans.question_id,
                        questionText:
                            ans.question?.question_text ??
                            `Question #${ans.question_id}`,
                        total: 0,
                        correct: 0,
                        wrong: 0,
                    });
                }

                const s = stats.get(ans.question_id)!;
                s.total += 1;
                if (isCorrect) s.correct += 1;
                else s.wrong += 1;
            }
        }

        return Array.from(stats.values()).sort(
            (a, b) => pct(a.correct, a.total) - pct(b.correct, b.total),
        );
    }, [selectedEvent, selectedAnalyticsExamType, preExam, postExam]);

    const openEvent = (ev: Event) => {
        setSelectedAttempt(null);
        setSelectedAnalyticsExamType(null);
        setSelectedEvent(ev);
    };

    const closeAll = () => {
        setSelectedAttempt(null);
        setSelectedAnalyticsExamType(null);
        setSelectedEvent(null);
    };

    const openAttemptAnswers = (type: 'pre' | 'post', attempt?: Attempt) => {
        if (!attempt?.submitted_at) return;
        setSelectedAttempt({ type, attempt });
    };

    const getExamStatusForEvent = (ev: Event) => {
        const pre = (ev.exams ?? []).find((e) => e.exam_type === 'pre');
        const post = (ev.exams ?? []).find((e) => e.exam_type === 'post');

        return {
            preActive: !!pre?.isActive,
            postActive: !!post?.isActive,
        };
    };

    return (
        <AppLayout>
            <Head title="Exam" />
            <div className="space-y-6 p-6">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2">
                        <NotebookIcon className="h-6 w-6 text-primary" />
                        <Label className="text-2xl font-black md:text-3xl">
                            Exam Results
                        </Label>
                    </div>
                    <CardDescription className="">
                        View per-participant results and exam-level analytics.
                    </CardDescription>

                    <Button onClick={()=>{
                        setExamManagementModalOpen(true)
                    }}>
                         <ChevronRight className="h-4 w-4" />
                        Manage Exam Questions
                       
                    </Button>
                </CardHeader>

                <ExamManagementModal open={ExamManagementModalOpen} onClose={()=>setExamManagementModalOpen(false)}/>

                {/* Events list with icons */}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {events.data.length > 0 ? (
                        (events.data ?? []).map((ev: any) => {
                            const { preActive, postActive } =
                                getExamStatusForEvent(ev);
                                console.log('ev:', ev);
                            return (
                                <Card
                                    key={ev.id}
                                    className="group transition-shadow hover:shadow-sm"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 rounded-md border bg-muted/40 p-2">
                                                    <ClipboardList className="h-5 w-5 text-muted-foreground" />
                                                </div>

                                                <div className="min-w-0">
                                                    <CardTitle className="truncate text-base">
                                                        {ev.name}
                                                    </CardTitle>
                                                    {ev.type === 'Cluster'?(
                                                        <>
                                                    <Badge
                                        onClick={() =>
                                           handleOpenModal(ev)
                                        }
                                        className="cursor-pointer"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <Home className="h-3.5 w-3.5" />
                                            <span className="text-[13px]">
                                                Involved facilities
                                            </span>
                                        </div>
                                    </Badge>            
                                                        </>
                                                      
            
                                                    ):(
                                                         <Badge>{ev.facility}</Badge>
                                                    )}
                                                         
                                                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                        <CalendarRange className="h-4 w-4" />
                                                        <span className="truncate">
                                                            {new Date(
                                                                ev.start_at,
                                                            ).toLocaleDateString(
                                                                'en-US',
                                                                {
                                                                    month: '2-digit',
                                                                    day: '2-digit',
                                                                    year: 'numeric',
                                                                },
                                                            )}{' '}
                                                            -{' '}
                                                            {new Date(
                                                                ev.end_at,
                                                            ).toLocaleDateString(
                                                                'en-US',
                                                                {
                                                                    month: '2-digit',
                                                                    day: '2-digit',
                                                                    year: 'numeric',
                                                                },
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className="gap-1"
                                                        >
                                                            <FileBarChart2 className="h-3.5 w-3.5" />
                                                            Records
                                                        </Badge>

                                                        <ExamStatusBadge
                                                            label="Pre"
                                                            active={preActive}
                                                        />
                                                        <ExamStatusBadge
                                                            label="Post"
                                                            active={postActive}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex items-center justify-between">
                                        <div className="text-xs text-muted-foreground">
                                            Click to view participants &
                                            analytics
                                        </div>

                                        <Button
                                            onClick={() => openEvent(ev)}
                                            className="gap-2"
                                        >
                                            View
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="col-span-full flex justify-center">
                            <Empty className="py-12 text-center">
                                <Lottie
                                    loop
                                    className="mx-auto h-auto w-40"
                                    animationData={errorAnimation}
                                />
                                <EmptyHeader>
                                    <EmptyDescription>
                                        No results have been found.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        </div>
                    )}
                </div>

                {/* Event dialog: participants list + summary + analytics */}
                <Dialog
                    open={isEventDialogOpen}
                    onOpenChange={(open) => !open && closeAll()}
                >
                    <DialogContent className="max-h-[85vh] min-w-[70%] overflow-hidden">
                        <div className="flex max-h-[85vh] flex-col">
                            <DialogHeader className="shrink-0">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <DialogTitle>
                                            {selectedEvent?.name}
                                        </DialogTitle>
                                        <DialogDescription>
                                            Click a score to view answers. Use
                                            Analytics to see which questions
                                            most people got wrong.
                                        </DialogDescription>
                                    </div>

                                    {/* DOWNLOAD EXCEL (Laravel-Excel) */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="gap-2"
                                        disabled={!selectedEvent}
                                        onClick={() => {
                                            if (!selectedEvent) return;
                                            window.location.href = route(
                                                'examResults.exportEvent',
                                                {
                                                    eventId: selectedEvent.id,
                                                },
                                            );
                                        }}
                                    >
                                        <Download className="h-4 w-4" />
                                        Download Excel
                                    </Button>
                                </div>
                            </DialogHeader>

                            <div className="mt-4 grid shrink-0 gap-3 md:grid-cols-2">
                                <Card>
                                    <CardContent className="pt-5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold">
                                                    {preExam?.title ??
                                                        'Pre Test'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Submitted:{' '}
                                                    {eventSummary?.pre
                                                        .submittedCount ?? 0}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold">
                                                    Avg:{' '}
                                                    {Math.round(
                                                        eventSummary?.pre
                                                            .avgScore ?? 0,
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Items(avg):{' '}
                                                    {Math.round(
                                                        eventSummary?.pre
                                                            .avgItems ?? 0,
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            className="mt-3 w-full"
                                            variant="outline"
                                            onClick={() =>
                                                setSelectedAnalyticsExamType(
                                                    'pre',
                                                )
                                            }
                                            disabled={!preExam}
                                        >
                                            View Pre Exam Analytics
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold">
                                                    {postExam?.title ??
                                                        'Post Test'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Submitted:{' '}
                                                    {eventSummary?.post
                                                        .submittedCount ?? 0}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold">
                                                    Avg:{' '}
                                                    {Math.round(
                                                        eventSummary?.post
                                                            .avgScore ?? 0,
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Items(avg):{' '}
                                                    {Math.round(
                                                        eventSummary?.post
                                                            .avgItems ?? 0,
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            className="mt-3 w-full"
                                            variant="outline"
                                            onClick={() =>
                                                setSelectedAnalyticsExamType(
                                                    'post',
                                                )
                                            }
                                            disabled={!postExam}
                                        >
                                            View Post Exam Analytics
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                                <div className="space-y-2">
                                    <div className="sticky top-0 grid grid-cols-12 border-b bg-background pb-2 text-sm font-semibold">
                                        <div className="col-span-6">
                                            Participant
                                        </div>
                                        <div className="col-span-3">
                                            Pre Score
                                        </div>
                                        <div className="col-span-3">
                                            Post Score
                                        </div>
                                    </div>

                                    {participants.map((row) => {
                                        const p = row.participant?.participant;

                                        const preItems = row.pre?.submitted_at
                                            ? getTotalItemsFromAttempt(row.pre)
                                            : 0;
                                        const postItems = row.post?.submitted_at
                                            ? getTotalItemsFromAttempt(row.post)
                                            : 0;

                                        return (
                                            <div
                                                key={row.participant.id}
                                                className="grid grid-cols-12 items-center rounded-md border-b px-2 py-2 hover:bg-muted/50"
                                            >
                                                <div className="col-span-6 pr-2">
                                                    <div className="font-medium">
                                                        {p
                                                            ? formatName(p)
                                                            : `Participant #${row.participant.participant_id}`}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Code:{' '}
                                                        {
                                                            row.participant
                                                                .attendance_code
                                                        }
                                                        {p?.designation
                                                            ? ` • ${p.designation}`
                                                            : ''}
                                                    </div>
                                                </div>

                                                <div className="col-span-3">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full justify-between"
                                                        disabled={
                                                            !row.pre
                                                                ?.submitted_at
                                                        }
                                                        onClick={() =>
                                                            openAttemptAnswers(
                                                                'pre',
                                                                row.pre,
                                                            )
                                                        }
                                                    >
                                                        <span>
                                                            {row.pre
                                                                ?.submitted_at
                                                                ? row.pre.score
                                                                : '—'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {row.pre
                                                                ?.submitted_at
                                                                ? `/${preItems}`
                                                                : ''}
                                                        </span>
                                                    </Button>
                                                </div>

                                                <div className="col-span-3">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full justify-between"
                                                        disabled={
                                                            !row.post
                                                                ?.submitted_at
                                                        }
                                                        onClick={() =>
                                                            openAttemptAnswers(
                                                                'post',
                                                                row.post,
                                                            )
                                                        }
                                                    >
                                                        <span>
                                                            {row.post
                                                                ?.submitted_at
                                                                ? row.post.score
                                                                : '—'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {row.post
                                                                ?.submitted_at
                                                                ? `/${postItems}`
                                                                : ''}
                                                        </span>
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Analytics dialog */}
                <Dialog
                    open={isAnalyticsDialogOpen}
                    onOpenChange={(open) =>
                        !open && setSelectedAnalyticsExamType(null)
                    }
                >
                    <DialogContent className="max-h-[85vh] min-w-[70%] overflow-hidden">
                        <div className="flex max-h-[85vh] flex-col">
                            <DialogHeader className="shrink-0">
                                <DialogTitle>
                                    {selectedEvent?.name} —{' '}
                                    {selectedAnalyticsExamType === 'pre'
                                        ? (preExam?.title ?? 'Pre Test')
                                        : (postExam?.title ?? 'Post Test')}{' '}
                                    Analytics
                                </DialogTitle>
                                <DialogDescription>
                                    Questions are sorted from lowest % correct
                                    to highest (focus on the top items).
                                </DialogDescription>
                            </DialogHeader>

                            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                                {questionAnalytics.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">
                                        No submitted attempts yet.
                                    </div>
                                ) : (
                                    questionAnalytics.map((q, idx) => {
                                        const percent = pct(q.correct, q.total);

                                        return (
                                            <Card key={q.questionId}>
                                                <CardContent className="space-y-3 pt-5">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="space-y-1">
                                                            <div className="font-medium">
                                                                {idx + 1}.{' '}
                                                                {q.questionText}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Responses:{' '}
                                                                {q.total}
                                                            </div>
                                                        </div>

                                                        <Badge
                                                            variant={
                                                                percent >= 70
                                                                    ? 'secondary'
                                                                    : 'destructive'
                                                            }
                                                        >
                                                            {percent}% correct
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div className="rounded-md border border-green-600 bg-green-600/10 px-3 py-2">
                                                            Correct: {q.correct}
                                                        </div>
                                                        <div className="rounded-md border border-red-600 bg-red-600/10 px-3 py-2">
                                                            Wrong: {q.wrong}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Answers dialog */}
                <Dialog
                    open={isAnswersDialogOpen}
                    onOpenChange={(open) => !open && setSelectedAttempt(null)}
                >
                    <DialogContent className="max-h-[85vh] max-w-4xl overflow-hidden">
                        <div className="flex max-h-[85vh] flex-col">
                            <DialogHeader className="shrink-0">
                                <DialogTitle>
                                    {selectedAttempt?.attempt.participant
                                        ?.participant
                                        ? formatName(
                                              selectedAttempt.attempt
                                                  .participant.participant,
                                          )
                                        : 'Participant'}{' '}
                                    —{' '}
                                    {selectedAttempt?.type === 'pre'
                                        ? (preExam?.title ?? 'Pre Test')
                                        : (postExam?.title ?? 'Post Test')}
                                </DialogTitle>
                                <DialogDescription>
                                    Green = correct choice, Red = selected but
                                    wrong.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                                <div className="space-y-4">
                                    {(
                                        selectedAttempt?.attempt.answers ?? []
                                    ).map((ans, idx) => {
                                        const selectedId =
                                            ans.selected_choice_id;

                                        return (
                                            <Card key={ans.id}>
                                                <CardContent className="space-y-3 pt-6">
                                                    <div className="font-medium">
                                                        {idx + 1}.{' '}
                                                        {
                                                            ans.question
                                                                ?.question_text
                                                        }
                                                    </div>

                                                    <div className="space-y-2">
                                                        {(
                                                            ans.question
                                                                ?.choices ?? []
                                                        ).map((c) => {
                                                            const isSelected =
                                                                c.id ===
                                                                selectedId;
                                                            const isCorrect =
                                                                !!c.is_correct;

                                                            const className =
                                                                isCorrect
                                                                    ? 'border border-green-600 bg-green-600/10'
                                                                    : isSelected
                                                                      ? 'border border-red-600 bg-red-600/10'
                                                                      : 'border';

                                                            return (
                                                                <div
                                                                    key={c.id}
                                                                    className={`rounded-md px-3 py-2 ${className}`}
                                                                >
                                                                    <div className="text-sm">
                                                                        {
                                                                            c.choice_text
                                                                        }
                                                                        {isSelected
                                                                            ? ' (selected)'
                                                                            : ''}
                                                                        {isCorrect
                                                                            ? ' (correct)'
                                                                            : ''}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
  <InvolvedFacilitiesModal
                clusters={clusters}
                isFacilitiesIncludedModalShown={modalOpen}
                toggleFacilitiesIncludedModal={setModalOpen}
            />
            <TablePagination links={events.links}></TablePagination>
        </AppLayout>
    );
}

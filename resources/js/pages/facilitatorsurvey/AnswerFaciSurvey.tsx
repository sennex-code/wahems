import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import React, { useState, useMemo } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';
import { Spinner } from '@/components/ui/spinner';
import wahIcon from '../../../../public/images/wahIcon.jpg';
import { CheckCircle2 } from 'lucide-react';
import Inactive from '../survey/Inactive';
import npcLogo from '../../../../public/images/NPC Logo.svg';


type Choice = {
    id: number;
    choice_text: string;
    choice_value: number;
};

type Questionnaire = {
    id: number;
    question_title: string;
    question_text: string;
    question_type: 'rating' | 'checkbox' | 'text';
    order: number;
    choices: Choice[];
};

type SurveyQuestion = {
    id: number;
    question_title: string;
    question_text: string;
    question_type: 'rating' | 'checkbox' | 'text';
    order: number;
};

type FacilitatorSurvey = {
    id: number;
    facilitator_id: number;
    facilitator_name: string;
    event_id: number;
    survey_name: string;
    isCompleted: boolean;
    is_active: boolean;
    questions: SurveyQuestion[];
};

type EventType = {
    id: number;
    name: string;
    type: string;
    start_at: string;
    end_at: string;
};

type ParticipantType = {
    id: number;
    attendance_code: string;
};

const AnswerFaciSurvey = ({
    event,
    facilitatorSurveys = [],
    questionnaires = [],
    choices = [],
    isActive,
    participant,
}: {
    event?: EventType;
    facilitatorSurveys?: FacilitatorSurvey[];
    questionnaires?: Questionnaire[];
    choices?: Choice[];
    isActive: boolean;
    participant?: ParticipantType;
}) => {
    const safeEvent: EventType = event || {
        id: 0,
        name: 'Unknown Event',
        type: 'Unknown',
        start_at: '',
        end_at: '',
    };

    const safeFacilitatorSurveys: FacilitatorSurvey[] = Array.isArray(
        facilitatorSurveys
    )
        ? facilitatorSurveys
        : [];
    const safeQuestionnaires: Questionnaire[] = Array.isArray(questionnaires)
        ? questionnaires
        : [];

    const [facilitatorSelected, setFacilitatorSelected] =
        useState<boolean>(false);
    const [selectedSurveyId, setSelectedSurveyId] = useState<number | null>(null);
    const [step, setStep] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const surveyForm = useForm({
        answers: {} as Record<number, string | string[]>,
    });

    const imagePath: Record<number, string> = {
        1: '/images/Likert/Strongly Disagree.png',
        2: '/images/Likert/Disagree.png',
        3: '/images/Likert/Neutral.png',
        4: '/images/Likert/Agree.png',
        5: '/images/Likert/Strongly Agree.png',
    };

    const selectedSurvey = useMemo(() => {
        return safeFacilitatorSurveys.find((s) => s && s.id === selectedSurveyId);
    }, [selectedSurveyId, safeFacilitatorSurveys]);

    const handleSelectFacilitator = (surveyId: number) => {
        const survey = safeFacilitatorSurveys.find((s) => s.id === surveyId);
        if (survey?.isCompleted) {
            toast.error('You have already completed this evaluation.');
            return;
        }
        setSelectedSurveyId(surveyId);
        setFacilitatorSelected(true);
        setStep(0);
    };

  

    const surveyQuestions = useMemo(() => {
        if (!selectedSurvey || !Array.isArray(selectedSurvey.questions)) {
            return [];
        }

        return selectedSurvey.questions
            .map((q) => {
                if (!q || typeof q.id === 'undefined') return null;
                const fullQuestion = safeQuestionnaires.find(
                    (qn) => qn && qn.id === q.id
                );
                return fullQuestion || null;
            })
            .filter(
                (q): q is Questionnaire =>
                    q !== null && q !== undefined && typeof q.id === 'number'
            )
            .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
    }, [selectedSurvey, safeQuestionnaires]);

    const questionGroups = useMemo(() => {
        if (surveyQuestions.length === 0) return [];

        const groups: Questionnaire[][] = [];
        let currentGroup: Questionnaire[] = [];

        surveyQuestions.forEach((question) => {
            if (question && typeof question.id === 'number') {
                currentGroup.push(question);
                if (currentGroup.length >= 5) {
                    groups.push([...currentGroup]);
                    currentGroup = [];
                }
            }
        });

        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }

        return groups.length > 0 ? groups : [surveyQuestions];
    }, [surveyQuestions]);

    const currentGroupQuestions = useMemo(() => {
        if (step < 0 || step >= questionGroups.length) return [];
        return questionGroups[step] ?? [];
    }, [step, questionGroups]);

    const progress = useMemo(() => {
        if (questionGroups.length === 0) return 0;
        return ((step + 1) / questionGroups.length) * 100;
    }, [step, questionGroups.length]);

    const isCurrentStepComplete = useMemo(() => {
        return currentGroupQuestions.every((q) => {
            if (!q || typeof q.id === 'undefined') return true;
            if (q.question_title === 'Other comments or suggestions') {
                return true;
            }
            const answer = surveyForm.data.answers[q.id];
            if (!answer) return false;
            if (Array.isArray(answer) && answer.length === 0) return false;
            return true;
        });
    }, [currentGroupQuestions, surveyForm.data.answers]);

    const isAllComplete = useMemo(() => {
        return surveyQuestions.every((question) => {
            if (!question || typeof question.id === 'undefined') return true;
            if (question.question_title === 'Other comments or suggestions') {
                return true;
            }
            const answer = surveyForm.data.answers[question.id];
            if (!answer) return false;
            if (Array.isArray(answer) && answer.length === 0) return false;
            return true;
        });
    }, [surveyQuestions, surveyForm.data.answers]);

    const validateStep = () => {
        const missing: number[] = [];

        currentGroupQuestions.forEach((q) => {
            if (q && typeof q.id === 'number') {
                if (q.question_title === 'Other comments or suggestions') {
                    return;
                }
                if (
                    !surveyForm.data.answers[q.id] ||
                    (Array.isArray(surveyForm.data.answers[q.id]) &&
                        (surveyForm.data.answers[q.id] as string[]).length === 0)
                ) {
                    missing.push(q.id);
                }
            }
        });

        if (missing.length > 0) {
            toast.error(`${missing.length} question(s) are unanswered.`);
            return false;
        }

        return true;
    };

    const nextStep = () => {
        if (!validateStep()) return;
        setStep((prev) => Math.min(prev + 1, questionGroups.length - 1));
    };

    const prevStep = () => {
        setStep((prev) => Math.max(prev - 1, 0));
    };

    const submitSurvey = () => {
        if (!validateStep()) return;

        const allMissing: number[] = [];
        surveyQuestions.forEach((question) => {
            if (question && typeof question.id === 'number') {
                if (question.question_title === 'Other comments or suggestions') {
                    return;
                }
                if (
                    !surveyForm.data.answers[question.id] ||
                    (Array.isArray(surveyForm.data.answers[question.id]) &&
                        (surveyForm.data.answers[question.id] as string[])
                            .length === 0)
                ) {
                    allMissing.push(question.id);
                }
            }
        });

        if (allMissing.length > 0) {
            toast.error(
                `${allMissing.length} question(s) are unanswered overall.`
            );
            return;
        }

        if (!selectedSurvey || typeof selectedSurvey.id !== 'number') {
            toast.error('Please select a facilitator');
            return;
        }

        setIsSubmitting(true);

        router.post(
            route('facilitator-survey.store'),
            {
                event: safeEvent.id,
                survey: selectedSurvey.id,
                answers: surveyForm.data.answers,
                participant: participant?.id,
            },
            {
                onSuccess: () => {
                    toast.success('Evaluation submitted successfully!');
                    setIsSubmitting(false);
                    surveyForm.reset();
                    setFacilitatorSelected(false);
                    setSelectedSurveyId(null);
                    setStep(0);
                    window.location.reload();
                },
                onError: (errors: any) => {
                    setIsSubmitting(false);
                    toast.error(
                        errors?.error || 'Failed to submit evaluation'
                    );
                },
            }
        );
    };

  

    if (safeFacilitatorSurveys.length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center px-3 py-4 sm:px-4">
                <Card className="w-full max-w-3xl">
                    <CardContent className="px-4 py-6 sm:px-6">
                        <p className="text-center text-lg">
                            No facilitator surveys available for this event.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!facilitatorSelected || !selectedSurvey) {
        return (
            <div className="flex min-h-screen flex-col items-center px-3 py-4 sm:px-4">
                <Card className="mt-4 w-full max-w-3xl">
                    <CardContent className="px-4 py-6 sm:px-6">
                        <Label className="text-xl font-bold sm:text-2xl">
                            Select Facilitator to Evaluate
                        </Label>
                        <CardDescription className="mt-2 text-sm leading-relaxed">
                            Please choose which facilitator you would like to
                            evaluate for the event:{' '}
                            <span className="font-semibold text-foreground">
                                {safeEvent?.name ?? 'Unknown Event'}
                            </span>
                        </CardDescription>

                        <div className="mt-6 space-y-3">
                            {safeFacilitatorSurveys.map((survey) => {
                                if (
                                    !survey ||
                                    typeof survey.id === 'undefined'
                                ) {
                                    return null;
                                }

                                const isCompleted = survey.isCompleted;

                                return (
                                    <motion.div
                                        key={survey.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.3,
                                        }}
                                    >
                                        <Button
                                            onClick={() =>
                                                handleSelectFacilitator(
                                                    survey.id
                                                )
                                            }
                                            disabled={isCompleted}
                                            className={`w-full justify-between h-20 border-2 p-4 text-left transition-all ${
                                                isCompleted
                                                    ? 'cursor-not-allowed opacity-60'
                                                    : 'hover:scale-[1.02]'
                                            }`}
                                            variant="outline"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <span className="text-base font-semibold sm:text-lg">
                                                    {survey.facilitator_name ??
                                                        'Unknown Facilitator'}
                                                </span>
                                                <span className="text-xs text-gray-600 sm:text-sm">
                                                    {survey.survey_name ??
                                                        'Facilitator Evaluation'}
                                                </span>
                                            </div>
                                            {isCompleted && (
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    <span className="text-xs font-semibold text-green-600">
                                                        Completed
                                                    </span>
                                                </div>
                                            )}
                                        </Button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (questionGroups.length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center px-3 py-4 sm:px-4">
                <Card className="w-full max-w-3xl">
                    <CardContent className="px-4 py-6 sm:px-6">
                        <p className="text-center text-lg">
                            No questions available for this evaluation.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center px-3 py-4 sm:px-4">
            <Card className="mt-2 w-full max-w-3xl">
                <CardContent className="px-4 py-4 sm:px-6">

                    <div className='flex gap-0 w-full items-center justify-center gap-10'>
                            <img
                        src={wahIcon}
                        alt="WAH Logo"
                        className=" mb-4 w-[18%] rounded-full"
                    />
                    <img src={npcLogo} 
                    alt="National Privacy Commission Logo"
                    className=" mb-4 w-[10%] rounded-full" />
                    </div>
                
                    <Label className="block text-center text-lg font-bold sm:text-xl">
                        Evaluation Form for Resource Persons
                    </Label>
                    <CardDescription className="mt-2 space-y-2 text-sm leading-relaxed">
                        <div>
                            <span className="font-semibold text-foreground">
                                Event:
                            </span>{' '}
                            {safeEvent?.name ?? 'Unknown Event'}
                        </div>
                        {selectedSurvey && (
                            <div>
                                <span className="font-semibold text-foreground">
                                    Facilitator:
                                </span>{' '}
                                {selectedSurvey.facilitator_name ?? 'Unknown'}
                            </div>
                        )}
                        <div className="mt-2">
                            We value your feedback. Please take a few minutes
                            to share your experience with us.
                        </div>
                    </CardDescription>

                    <div className="mt-4">
                        <div className="mb-2 flex justify-between text-xs sm:text-sm">
                            <span>
                                Section {step + 1} / {questionGroups.length}
                            </span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full rounded bg-gray-200">
                            <div
                                className="h-2 rounded bg-blue-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="my-4 w-full max-w-3xl">
                <CardContent className="px-4 py-4 sm:px-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {currentGroupQuestions.map((question, index) => {
                                if (!question || typeof question.id === 'undefined') {
                                    return null;
                                }

                                const questionChoices = question.choices ?? [];
                                const isAnswered = !!(
                                    surveyForm.data.answers[question.id] &&
                                    (Array.isArray(
                                        surveyForm.data.answers[question.id]
                                    )
                                        ? (
                                            surveyForm.data.answers[
                                                question.id
                                            ] as string[]
                                        ).length > 0
                                        : true)
                                );

                                const sortedChoices = [...questionChoices].sort(
                                    (a, b) => (a?.choice_value ?? 0) - (b?.choice_value ?? 0)
                                );

                                return (
                                    <div
                                        key={question.id}
                                        className="mb-8 last:mb-0"
                                    >
                                       <Label className="flex items-center gap-2 text-sm font-bold leading-relaxed sm:text-base">
                                    {index + 1}.{' '}
                                    {question.question_title ?? 'Question'}
                                    {question.question_title !==
                                        'Other comments or suggestions' && (
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    )}
                                    {isAnswered && (
                                        <span className="ml-auto text-xs text-green-600 font-normal">
                                            ✓ Answered
                                        </span>
                                    )}
                                </Label>
                                        {question.question_text && (
                                            <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                                                {question.question_text}
                                            </p>
                                        )}

                                        {question.question_type === 'rating' && (
                                            <RadioGroup
                                                value={String(
                                                    surveyForm.data.answers[
                                                        question.id
                                                    ] ?? ''
                                                )}
                                                onValueChange={(value) =>
                                                    surveyForm.setData(
                                                        'answers',
                                                        {
                                                            ...surveyForm.data
                                                                .answers,
                                                            [question.id]:
                                                                value,
                                                        }
                                                    )
                                                }
                                                className="my-5 flex flex-wrap justify-center gap-4 sm:flex-nowrap sm:justify-between sm:gap-3"
                                            >
                                                {sortedChoices.map(
                                                    (choice) => {
                                                        if (
                                                            !choice ||
                                                            typeof choice.id ===
                                                                'undefined'
                                                        ) {
                                                            return null;
                                                        }

                                                        const id = `question_${question.id}_${choice.id}`;
                                                        const selectedValue =
                                                            String(
                                                                surveyForm.data
                                                                    .answers[
                                                                    question.id
                                                                ] ?? ''
                                                            );
                                                        const choiceValue =
                                                            String(choice.id);
                                                        const isSelected =
                                                            selectedValue ===
                                                            choiceValue;

                                                        const imgSrc =
                                                            imagePath[
                                                                choice.choice_value ?? 3
                                                            ] ||
                                                            '/images/Likert/Neutral.png';

                                                        return (
                                                            <div
                                                                key={choice.id}
                                                                className="flex w-[calc(50%-0.5rem)] min-w-[120px] flex-col items-center gap-2 sm:w-auto sm:min-w-0"
                                                            >
                                                                <RadioGroupItem
                                                                    id={id}
                                                                    value={String(
                                                                        choice.id
                                                                    )}
                                                                    className="sr-only"
                                                                />

                                                                <Label
                                                                    htmlFor={id}
                                                                    className={[
                                                                        'flex w-full cursor-pointer flex-col items-center rounded-2xl p-3 transition sm:p-4',
                                                                        'hover:opacity-90',
                                                                        isSelected
                                                                            ? 'scale-[1.05] bg-primary/10 ring-2 ring-primary'
                                                                            : 'bg-transparent opacity-80 ring-1 ring-muted',
                                                                    ].join(
                                                                        ' '
                                                                    )}
                                                                >
                                                                    <img
                                                                        src={
                                                                            imgSrc
                                                                        }
                                                                        alt={
                                                                            choice.choice_text ??
                                                                            'Choice'
                                                                        }
                                                                        className="h-20 w-20 object-contain sm:h-28 sm:w-28"
                                                                    />
                                                                    <span
                                                                        className={[
                                                                            'mt-2 text-center text-xs select-none sm:text-sm font-medium',
                                                                            isSelected
                                                                                ? 'font-bold text-primary'
                                                                                : 'text-muted-foreground',
                                                                        ].join(
                                                                            ' '
                                                                        )}
                                                                    >
                                                                        {choice.choice_text ??
                                                                            ''}
                                                                    </span>
                                                                </Label>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </RadioGroup>
                                        )}

                                        {question.question_type === 'checkbox' && (
                                            <div className="my-4 flex flex-col gap-3">
                                                {questionChoices.map(
                                                    (choice) => {
                                                        if (
                                                            !choice ||
                                                            typeof choice.id ===
                                                                'undefined'
                                                        ) {
                                                            return null;
                                                        }

                                                        return (
                                                            <div
                                                                key={choice.id}
                                                                className="flex items-start gap-3"
                                                            >
                                                                <Checkbox
                                                                    checked={(
                                                                        (surveyForm
                                                                            .data
                                                                            .answers[
                                                                            question.id
                                                                        ] as string[]) ||
                                                                        []
                                                                    ).includes(
                                                                        String(
                                                                            choice.id
                                                                        )
                                                                    )}
                                                                    id={`question_${question.id}_${choice.id}`}
                                                                    onCheckedChange={(
                                                                        checked
                                                                    ) => {
                                                                        const existing =
                                                                            (surveyForm
                                                                                .data
                                                                                .answers[
                                                                                question.id
                                                                            ] as string[]) ||
                                                                            [];

                                                                        if (
                                                                            checked
                                                                        ) {
                                                                            surveyForm.setData(
                                                                                'answers',
                                                                                {
                                                                                    ...surveyForm
                                                                                        .data
                                                                                        .answers,
                                                                                    [question.id]:
                                                                                        [
                                                                                            ...existing,
                                                                                            String(
                                                                                                choice.id
                                                                                            ),
                                                                                        ],
                                                                                }
                                                                            );
                                                                        } else {
                                                                            surveyForm.setData(
                                                                                'answers',
                                                                                {
                                                                                    ...surveyForm
                                                                                        .data
                                                                                        .answers,
                                                                                    [question.id]:
                                                                                        existing.filter(
                                                                                            (
                                                                                                v
                                                                                            ) =>
                                                                                                v !==
                                                                                                String(
                                                                                                    choice.id
                                                                                                )
                                                                                        ),
                                                                                }
                                                                            );
                                                                        }
                                                                    }}
                                                                />

                                                                <Label
                                                                    className="break-words leading-relaxed"
                                                                    htmlFor={`question_${question.id}_${choice.id}`}
                                                                >
                                                                    {choice.choice_text ??
                                                                        ''}
                                                                </Label>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        )}

                                        {question.question_type === 'text' && (
                                            <Input
                                                className="my-3"
                                                placeholder="Enter your response..."
                                                value={String(
                                                    surveyForm.data.answers[
                                                        question.id
                                                    ] ?? ''
                                                )}
                                                onChange={(e) =>
                                                    surveyForm.setData(
                                                        'answers',
                                                        {
                                                            ...surveyForm.data
                                                                .answers,
                                                            [question.id]:
                                                                e.target.value,
                                                        }
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
            </Card>

            <div className="flex w-full max-w-3xl flex-col gap-3 pb-4 sm:flex-row sm:justify-center sm:gap-5">
               

                <Button
                    disabled={step === 0 || isSubmitting}
                    type="button"
                    onClick={prevStep}
                    className="w-full sm:w-auto"
                    variant="outline"
                >
                    Previous
                </Button>

                {step < questionGroups.length - 1 && (
                    <Button
                        type="button"
                        onClick={nextStep}
                        disabled={isSubmitting || !isCurrentStepComplete}
                        className="w-full sm:w-auto"
                    >
                        Next
                    </Button>
                )}

                {step === questionGroups.length - 1 && (
                    <Button
                        className="w-full sm:w-auto"
                        disabled={isSubmitting || !isAllComplete}
                        onClick={submitSurvey}
                    >
                        {isSubmitting && <Spinner />}
                        SUBMIT
                    </Button>
                )}
            </div>
        </div>
    );
};

export default AnswerFaciSurvey;
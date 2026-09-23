import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { sub } from 'date-fns';
import imgasd from '../../../../public/images/Likert/Strongly Disagree.png';
import { AnimatePresence, motion } from 'motion/react';
import { Star } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

type qType = {
    category: string;
    created_at: string;
    id: number;
    question_name: string;
    survey_question_options: any[];
    type: string;
    updated_at: string;
};

const AnswerSurvey = ({ questions, event, survey }: any) => {
    console.log(questions);
    const surveyForm = useForm({
        answers: {} as Record<number, string | string[]>,
    });

    const imagePath = {
        'Strongly Disagree': '/images/Likert/Strongly Disagree.png',
        Disagree: '/images/Likert/Disagree.png',
        Neutral: '/images/Likert/Neutral.png',
        Agree: '/images/Likert/Agree.png',
        'Strongly Agree': '/images/Likert/Strongly Agree.png',
    };

    const submitSurvey = () => {
        const missing: number[] = [];

        console.log(typeof surveyForm.data);

        Object.values(questions).forEach((question: any, index: number) => {
            question.forEach((q: qType) => {
                if (!surveyForm.data.answers[q.id]) {
                    missing.push(q.id);
                }
            });
        });

        if (missing.length > 0) {
            toast.error(`${missing.length} question(s) are unanswered.`);
            console.log(missing);
            return;
        }

        surveyForm.post(
            route('survey.create', {
                event: event,
                survey: survey,
            }),
            {
                onSuccess: () => {
                    toast.success('Form answered successfully!');
                },
                onError: (e: any) => {
                    toast.error(e.error);
                },
            },
        );
    };

    let counter = 1;

    const categories = Object.entries(questions);

    const [step, setStep] = useState<number>(0);

    const [category, categoryQuestions] = categories[step] as [string, qType[]];

    const validateStep = () => {
        const missing: number[] = [];

        console.log(typeof surveyForm.data);

        categoryQuestions.forEach((q: qType) => {
            if (!surveyForm.data.answers[q.id]) {
                missing.push(q.id);
            }
        });

        if (missing.length > 0) {
            toast.error('Please answer all questions in this section.');
            return false;
        }

        return true;
    };

    const nextStep = () => {
        if (!validateStep()) return;
        setStep((prev) => prev + 1);
    };

    const prevStep = () => {
        setStep((prev) => prev - 1);
    };

    const progress = ((step + 1) / categories.length) * 100;

    return (
        <div className="flex min-h-screen flex-col items-center px-3 py-4 sm:px-4">
            <Card className="mt-2 w-full max-w-3xl">
                <CardContent className="px-4 py-4 sm:px-6">
                    <Label className="text-lg sm:text-xl">
                        POST EVALUATION FORM
                    </Label>
                    <CardDescription className="mt-1 text-sm leading-relaxed">
                        We value your feedback. Please take a few minutes to
                        share your experience with us to help us improve future
                        events.
                    </CardDescription>

                    <div className="mt-3">
                        <div className="mb-2 flex justify-between text-xs sm:text-sm">
                            <span>
                                Section {step + 1} / {categories.length}
                            </span>
                            <span>{Math.round(progress)}%</span>
                        </div>

                        <div className="h-2 w-full rounded bg-gray-200">
                            <div
                                className="h-2 rounded bg-blue-500 transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="my-4 w-full max-w-3xl">
                <CardContent className="px-4 py-4 sm:px-6">
                    <Card className="mb-4 px-3 py-3 text-center text-lg font-extrabold sm:text-2xl">
                        {category}
                    </Card>

                    <AnimatePresence mode="wait">
                        {categoryQuestions.map((question: any) => (
                            <motion.div
                                key={question.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="mb-6"
                            >
                                <Label className="block text-sm leading-relaxed font-bold sm:text-base">
                                    {counter++}. {question.question_name}
                                </Label>

                                {question.type === 'rating' && (
                                    <RadioGroup
                                        value={String(
                                            surveyForm.data.answers[
                                                question.id
                                            ] ?? '',
                                        )}
                                        className="my-5 flex flex-wrap justify-center gap-3 sm:flex-nowrap sm:justify-between sm:gap-4"
                                        onValueChange={(value) =>
                                            surveyForm.setData('answers', {
                                                ...surveyForm.data.answers,
                                                [question.id]: value,
                                            })
                                        }
                                    >
                                        {question.survey_question_options.map(
                                            (option: any) => {
                                                const id = `question_${question.id}_${option.id}`;

                                                const selectedValue = String(
                                                    surveyForm.data.answers[
                                                        question.id
                                                    ] ?? '',
                                                );
                                                const optionValue = String(
                                                    option.id,
                                                );
                                                const isSelected =
                                                    selectedValue ===
                                                    optionValue;

                                                const imgSrc =
                                                    imagePath[
                                                        option.label as keyof typeof imagePath
                                                    ] ??
                                                    '/images/Likert/Neutral.png';

                                                return (
                                                    <div
                                                        key={option.id}
                                                        className="flex w-[calc(50%-0.375rem)] min-w-[120px] flex-col items-center gap-2 sm:w-auto sm:min-w-0"
                                                    >
                                                        <RadioGroupItem
                                                            id={id}
                                                            value={option.id}
                                                            className="sr-only"
                                                        />

                                                        <Label
                                                            htmlFor={id}
                                                            className={[
                                                                'flex w-full cursor-pointer flex-col items-center rounded-2xl p-2 transition sm:p-3',
                                                                'hover:opacity-90',
                                                                isSelected
                                                                    ? 'scale-[1.03] bg-primary/10 ring-2 ring-primary'
                                                                    : 'bg-transparent opacity-80 ring-1 ring-muted',
                                                            ].join(' ')}
                                                        >
                                                            {!isNaN(
                                                                Number(
                                                                    option.label,
                                                                ),
                                                            ) ? (
                                                                <Star
                                                                    fill="yellow"
                                                                    size={24}
                                                                    className="sm:h-[30px] sm:w-[30px]"
                                                                />
                                                            ) : (
                                                                <img
                                                                    src={imgSrc}
                                                                    alt={
                                                                        option.label
                                                                    }
                                                                    className="h-14 w-14 object-contain sm:h-20 sm:w-20"
                                                                />
                                                            )}
                                                            <span
                                                                className={[
                                                                    'mt-1 text-center text-[11px] select-none sm:text-xs',
                                                                    isSelected
                                                                        ? 'font-semibold text-primary'
                                                                        : 'text-muted-foreground',
                                                                ].join(' ')}
                                                            >
                                                                {option.label}
                                                            </span>
                                                        </Label>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </RadioGroup>
                                )}

                                {question.type === 'checkbox' && (
                                    <div className="my-4 flex flex-col gap-3">
                                        {question.survey_question_options.map(
                                            (option: any) => (
                                                <div
                                                    key={option.id}
                                                    className="flex items-start gap-3"
                                                >
                                                    <Checkbox
                                                        checked={(
                                                            (surveyForm.data
                                                                .answers[
                                                                question.id
                                                            ] as string[]) || []
                                                        ).includes(option.id)}
                                                        id={`question_${question.id}_${option.id}`}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) => {
                                                            const existing =
                                                                (surveyForm.data
                                                                    .answers[
                                                                    question.id
                                                                ] as string[]) ||
                                                                [];

                                                            if (checked) {
                                                                surveyForm.setData(
                                                                    'answers',
                                                                    {
                                                                        ...surveyForm
                                                                            .data
                                                                            .answers,
                                                                        [question.id]:
                                                                            [
                                                                                ...existing,
                                                                                option.id,
                                                                            ],
                                                                    },
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
                                                                                    v,
                                                                                ) =>
                                                                                    v !==
                                                                                    option.id,
                                                                            ),
                                                                    },
                                                                );
                                                            }
                                                        }}
                                                    />

                                                    <Label
                                                        className="leading-relaxed break-words"
                                                        htmlFor={`question_${question.id}_${option.id}`}
                                                    >
                                                        {option.label}
                                                    </Label>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}

                                {question.type === 'text' && (
                                    <Input
                                        className="my-3"
                                        onChange={(e) =>
                                            surveyForm.setData('answers', {
                                                ...surveyForm.data.answers,
                                                [question.id]: e.target.value,
                                            })
                                        }
                                    />
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </CardContent>
            </Card>

            <div className="flex w-full max-w-3xl flex-col gap-3 pb-4 sm:flex-row sm:justify-center sm:gap-5">
                <Button
                    disabled={step === 0 || surveyForm.processing}
                    type="button"
                    onClick={() => prevStep()}
                    className="w-full sm:w-auto"
                >
                    Previous
                </Button>

                <Button
                    type="button"
                    onClick={() => nextStep()}
                    disabled={surveyForm.processing}
                    className="w-full sm:w-auto"
                >
                    Next
                </Button>

                {step === categories.length - 1 && (
                    <Button
                        className="w-full sm:w-auto"
                        disabled={surveyForm.processing}
                        onClick={() => submitSurvey()}
                    >
                        {surveyForm.processing && <Spinner></Spinner>}
                        SUBMIT
                    </Button>
                )}
            </div>
        </div>
    );
};

export default AnswerSurvey;

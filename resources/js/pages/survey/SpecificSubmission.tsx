import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import React, { useMemo, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';

import { AnimatePresence, motion } from 'motion/react';
import { text } from 'stream/consumers';
import { ArrowLeft, Star } from 'lucide-react';
type qType = {
    category: string;
    created_at: string;
    id: number;
    question_name: string;
    survey_question_options: any[];
    type: string;
    updated_at: string;
};

type QuestionType = {
    [category: string]: {
        category: string;
        id: number;
        question_name: string;
        type: string;
        survey_question_options: {
            id: number;
            label: string;
            question_id: number;
            value: string | number;
        }[];
    }[];
};

type ParticipantType = {
    email: string;
    event_participant_id: number;
    first_name: string;
    last_name: string;
    middle_initial: string | number;
    participant_id: string | number;
    event_id: number;
    survey_id: number;
    suffix: string;
    survey_submission_id: string;
    eventParticipantAnswers: {
        id: number;
        question_id: number;
        question_option_id: number;
        survey_submission_id: number;
        text_answer: string | null;
    }[];
};

type SpecificSiubmissionType = {
    questions: QuestionType;
    participant: ParticipantType;
};
const SpecificSiubmission = ({
    questions,
    participant,
}: SpecificSiubmissionType) => {
    console.log(participant);
    const answersByQuestion = useMemo(() => {
        const radioRecord: Record<number, number> = {};
        const checkBox: any[] = [];
        const textAnswer: Record<number, string[]> = {};

        let prev;
        for (const a of participant.eventParticipantAnswers ?? []) {
            radioRecord[a.question_id] = a.question_option_id;
            // If same question id appeared multiple times, it's a checkbox
            if (prev === a.question_id) {
                checkBox.push(a.question_option_id);
                console.log(checkBox);
            }
            if (a.text_answer) {
                if (!textAnswer[a.question_id]) {
                    textAnswer[a.question_id] = [];
                }
                textAnswer[a.question_id].push(a.text_answer);
            }
            console.log(textAnswer);
            // used for checking for checkbox
            prev = a.question_id;
        }

        return { radioRecord, checkBox, textAnswer };
    }, [participant]);

    const imagePath = {
        'Strongly Disagree': '/images/Likert/Strongly Disagree.png',
        Disagree: '/images/Likert/Disagree.png',
        Neutral: '/images/Likert/Neutral.png',

        Agree: '/images/Likert/Agree.png',
        'Strongly Agree': '/images/Likert/Strongly Agree.png',
    };

    let counter = 1;

    const categories = Object.entries(questions);

    const [step, setStep] = useState<number>(0);

    const [category, categoryQuestions] = categories[step];

    const nextStep = () => {
        setStep((prev) => prev + 1);
    };

    const prevStep = () => {
        setStep((prev) => prev - 1);
    };

    return (
        <div className="flex min-h-screen flex-col items-center">
            <Button className="fixed top-5 left-5">
                <Link
                    href={route('survey.statistics', {
                        event: participant.event_id,
                        survey: participant.survey_id,
                    })}
                >
                    <ArrowLeft></ArrowLeft>
                </Link>
            </Button>
            <Card className="sm:w-[90% mt-5 w-[90%] md:w-[50%]">
                <CardContent>
                    <Label className="text-xl">POST EVALUATION FORM</Label>
                    <CardDescription className="mt-2 flex flex-col gap-2">
                        <Label>
                            Name: {participant.last_name},{' '}
                            {participant.first_name}{' '}
                            {participant.middle_initial}
                        </Label>
                        <Label>Email: {participant.email}</Label>
                    </CardDescription>
                </CardContent>
            </Card>

            <Card className="my-5 w-[90%] sm:w-[90%] md:w-[50%]">
                <CardContent>
                    <Card className="mb-2 text-center text-2xl font-extrabold">
                        {category}
                    </Card>

                    <AnimatePresence mode="wait">
                        {categoryQuestions.map(
                            (question: any, index: number) => (
                                <motion.div
                                    key={question.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Label className="font-bold">
                                        {counter++}. {question.question_name}
                                    </Label>

                                    {question.type === 'rating' && (
                                        <RadioGroup
                                            className="my-5 flex flex-wrap items-start justify-start gap-4 md:flex-nowrap md:justify-between"
                                            value={String(
                                                answersByQuestion.radioRecord[
                                                    question.id
                                                ],
                                            )}
                                        >
                                            {question.survey_question_options.map(
                                                (option: any) => {
                                                    const id = `question_${question.id}_${option.id}`;

                                                    const isSelected =
                                                        answersByQuestion
                                                            .radioRecord[
                                                            question.id
                                                        ] === option.id;
                                                    const imgSrc =
                                                        imagePath[
                                                            option.label as keyof typeof imagePath
                                                        ] ??
                                                        '/images/Likert/Neutral.png';

                                                    return (
                                                        <div
                                                            key={option.id}
                                                            className="flex w-full flex-col gap-2"
                                                        >
                                                            <RadioGroupItem
                                                                id={id}
                                                                value={
                                                                    option.id
                                                                }
                                                                className="sr-only"
                                                            />

                                                            <Label
                                                                htmlFor={id}
                                                                className={`flex cursor-pointer flex-row items-center md:flex-col ${isSelected ? 'scale-[1.03] bg-primary/10 ring-2 ring-primary' : 'bg-transparent opacity-80 ring-1 ring-muted'} rounded-2xl p-3 transition`}
                                                            >
                                                                {!isNaN(
                                                                    Number(
                                                                        option.label,
                                                                    ),
                                                                ) ? (
                                                                    <Star
                                                                        fill="yellow"
                                                                        size={
                                                                            30
                                                                        }
                                                                    ></Star>
                                                                ) : (
                                                                    <img
                                                                        src={
                                                                            imgSrc
                                                                        }
                                                                        alt={
                                                                            option.label
                                                                        }
                                                                        className="h-20 w-20 object-contain"
                                                                    />
                                                                )}

                                                                <span className="text-center text-xs select-none">
                                                                    {
                                                                        option.label
                                                                    }{' '}
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
                                                        className="flex items-center gap-3"
                                                    >
                                                        <Checkbox
                                                            checked={answersByQuestion.checkBox.includes(
                                                                option.id,
                                                            )}
                                                            disabled
                                                            id={`question_${question.id}_${option.id}`}
                                                        />

                                                        <Label
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
                                            disabled
                                            value={
                                                answersByQuestion.textAnswer[
                                                    question.id
                                                ]
                                            }
                                        />
                                    )}
                                </motion.div>
                            ),
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            <div className="flex flex-row gap-5">
                <Button
                    disabled={step === 0}
                    type="button"
                    onClick={() => prevStep()}
                >
                    Previous
                </Button>

                <Button
                    type="button"
                    disabled={step >= categories.length - 1}
                    onClick={() => nextStep()}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

export default SpecificSiubmission;

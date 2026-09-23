import { Card, CardContent } from '@/components/ui/card';
import useSurveyHandler from '@/hooks/useSurveyHandler';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import {
    Field,
    FieldContent,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';

import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { choices } from '@/constants/constant';
import { ArrowDown, ArrowUp, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AnimatePresence, motion } from 'framer-motion';
import { renderSurveyType } from '@/components/survey/renderSurveyType';
const CreateSurvey = () => {
    const { surveyForm, handleFirstLayer, handleQuestions, handleChoices } =
        useSurveyHandler();

    return (
        <AppLayout>
            <Head title="Create Survey"></Head>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
            >
                <Card className="mx-3 my-3">
                    <CardContent>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="input-field-username">
                                    Form Title
                                </FieldLabel>
                                <Input
                                    value={surveyForm.data.title || ''}
                                    onChange={(e) =>
                                        handleFirstLayer(
                                            'title',
                                            e.target.value,
                                        )
                                    }
                                    id="input-field-username"
                                    type="text"
                                    placeholder="Event Title..."
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="input-field-username">
                                    Form Description
                                </FieldLabel>
                                <Input
                                    onChange={(e) =>
                                        handleFirstLayer(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    id="input-field-username"
                                    value={surveyForm.data.description || ''}
                                    type="text"
                                    placeholder="Event Description..."
                                />
                            </Field>
                        </FieldGroup>
                    </CardContent>
                </Card>
            </motion.div>

            <AnimatePresence>
                {surveyForm.data.survey_question.map(
                    (question: SurveyQuestionType, index: number) => (
                        <motion.div
                            key={question.tempId}
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                        >
                            <Card className="mx-3 my-2">
                                <CardContent>
                                    <div className="flex flex-row gap-5">
                                        <Field className="flex-2">
                                            <FieldLabel>
                                                Question Text {index + 1}
                                            </FieldLabel>
                                            <Input
                                                value={
                                                    surveyForm.data
                                                        .survey_question[index]
                                                        .question_text || ''
                                                }
                                                onChange={(e) =>
                                                    handleQuestions(
                                                        'question_text',
                                                        e.target.value,
                                                        index,
                                                    )
                                                }
                                                placeholder="Untitled Question"
                                            ></Input>
                                        </Field>
                                        <Field className="flex-1">
                                            <FieldLabel>
                                                Question Type
                                            </FieldLabel>

                                            <Select
                                                onValueChange={(e) =>
                                                    handleQuestions(
                                                        'type',
                                                        e,
                                                        index,
                                                    )
                                                }
                                                value={
                                                    surveyForm.data
                                                        .survey_question[index]
                                                        .type ?? 'text'
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a fruit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {choices.map((e) => (
                                                            <SelectItem
                                                                value={e}
                                                            >
                                                                {e}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    </div>

                                    <Card className="my-3 px-3">
                                        {renderSurveyType({
                                            type: question.type,
                                            handleChoices: handleChoices,
                                            question_choices:
                                                question.question_choices ?? [],
                                            surveyForm: surveyForm,
                                            outerIndex: index,
                                        })}

                                        {question.type !== 'text' && (
                                            <Button
                                                onClick={() =>
                                                    handleChoices(
                                                        'Add new',
                                                        null,
                                                        index,
                                                        null,
                                                    )
                                                }
                                            >
                                                <Plus></Plus>
                                            </Button>
                                        )}
                                    </Card>
                                    <div className="my-5 flex flex-row justify-between gap-5">
                                        <div className="flex flex-row gap-5">
                                            <div className="flex items-center">
                                                <Label className="mr-5">
                                                    Is required
                                                </Label>
                                                <Switch
                                                    className="my-auto"
                                                    onCheckedChange={(e) =>
                                                        handleQuestions(
                                                            'is_required',
                                                            e,
                                                            index,
                                                        )
                                                    }
                                                    checked={
                                                        question.is_required ||
                                                        false
                                                    }
                                                ></Switch>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    handleQuestions(
                                                        'Delete',
                                                        null,
                                                        index,
                                                    )
                                                }
                                            >
                                                <Trash></Trash>
                                            </Button>
                                        </div>

                                        <div className="flex flex-row gap-2">
                                            <Button
                                                onClick={() =>
                                                    handleQuestions(
                                                        'orderUp',
                                                        null,
                                                        index,
                                                    )
                                                }
                                            >
                                                <ArrowUp></ArrowUp>
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    handleQuestions(
                                                        'orderDown',
                                                        null,
                                                        index,
                                                    )
                                                }
                                            >
                                                <ArrowDown></ArrowDown>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ),
                )}
            </AnimatePresence>
            <motion.div
                className="w-full"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
            >
                <Button
                    className="mx-50 my-2"
                    onClick={() => handleQuestions('Add new', null, 0)}
                >
                    <Plus></Plus> Add Question
                </Button>
            </motion.div>

            <Button onClick={() => console.log(surveyForm.data)}></Button>
        </AppLayout>
    );
};

export default CreateSurvey;

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { InertiaFormProps } from '@inertiajs/react';
import { Trash } from 'lucide-react';
import React from 'react';

type RadioBoxOptionType = {
    question_choices: QuestionChoicesType[] | null;
    handleChoices: (
        fieldname: keyof QuestionChoicesType | 'Add new' | 'Delete',
        value: string | number | null,
        outerIndex: number, // Which question
        innerIndex: number, //Which choice
    ) => void;
    surveyForm: InertiaFormProps<SurveyType>;
    outerIndex: number;
};
export const RadioBoxOption = ({
    question_choices,
    handleChoices,
    surveyForm,
    outerIndex,
}: RadioBoxOptionType) => {
    return (
        <>
            {question_choices?.map((choice, index) => (
                <div className="flex flex-row items-center gap-5" key={index}>
                    <Checkbox disabled></Checkbox>

                    <Input
                        type="text"
                        value={choice.value || ''}
                        onChange={(e) =>
                            handleChoices(
                                'value',
                                e.target.value,
                                outerIndex,
                                index,
                            )
                        }
                    ></Input>

                    <Button
                        onClick={() =>
                            handleChoices('Delete', null, outerIndex, index)
                        }
                    >
                        <Trash></Trash>
                    </Button>
                </div>
            ))}
        </>
    );
};

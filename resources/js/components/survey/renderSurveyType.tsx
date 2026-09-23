import React, { JSX } from 'react';
import TextOption from './options/text-option';
import { RadioBoxOption } from './options/radio-box-option';
import { MultipleChoiceQuestion } from './options/multiple-choice-option';
import { RatingOption } from './options/rating-option';
import { SelectOption } from './options/select-option';
import { InertiaFormProps } from '@inertiajs/react';

// type type? lol
type RenderSurveyTypeType = {
    type: string;
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
export const renderSurveyType = ({
    type,
    question_choices,
    handleChoices,
    surveyForm,
    outerIndex,
}: RenderSurveyTypeType) => {
    const render: {
        [key: string]: JSX.Element;
    } = {
        text: <TextOption></TextOption>,
        radio: (
            <RadioBoxOption
                question_choices={question_choices}
                handleChoices={handleChoices}
                surveyForm={surveyForm}
                outerIndex={outerIndex}
            ></RadioBoxOption>
        ),
        multiple: <MultipleChoiceQuestion></MultipleChoiceQuestion>,
        rating: <RatingOption></RatingOption>,
        select: <SelectOption></SelectOption>,
    };

    return render[type];
};

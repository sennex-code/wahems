import { update } from '@/routes/profile';
import survey from '@/routes/survey';
import { useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';

const initialValue: SurveyType = {
    title: '',
    description: '',
    survey_question: [
        {
            question_text: '',
            is_required: true,
            tempId: crypto.randomUUID(),
            type: 'text',
            question_choices: [
                {
                    label: '',
                    value: '',
                    render_order: 1,
                },
            ],
        },
    ],
};

const useSurveyHandler = () => {
    const surveyForm = useForm<SurveyType>(initialValue);

    // Only handles title and description
    const handleFirstLayer = (
        fieldname: 'title' | 'description',
        value: string,
    ) => {
        if (!fieldname || !value) return;
        surveyForm.setData(fieldname, value);
    };

    const handleQuestions = (
        fieldname:
            | keyof SurveyQuestionType
            | 'Add new'
            | 'Delete'
            | 'orderUp'
            | 'orderDown',
        value: string | boolean | null,
        index: number,
    ) => {
        if (fieldname === 'Add new') {
            surveyForm.setData('survey_question', [
                ...(surveyForm.data.survey_question ?? []),
                {
                    question_text: '',
                    is_required: true,
                    tempId: crypto.randomUUID(),
                    type: 'text',
                    question_choices: [],
                },
            ]);
            return;
        }

        if (fieldname === 'orderUp') {
            if (index === 0) {
                toast.error('Cannot move futher up!');
                return;
            }
            const tmp = [...(surveyForm.data.survey_question ?? [])];

            // Copies the selected question
            const tmpOrder = tmp[index];
            // Moves the previous index up 1 index
            tmp[index] = tmp[index - 1];
            // places the tmp on the previous
            tmp[index - 1] = tmpOrder;

            surveyForm.setData('survey_question', tmp);
            return;
        }

        if (fieldname === 'orderDown') {
            if (index + 1 === surveyForm.data.survey_question.length) {
                toast.error('Cannot move futher down!');
                return;
            }
            const tmp = [...(surveyForm.data.survey_question ?? [])];

            const tmpOrder = tmp[index];
            tmp[index] = tmp[index + 1];
            tmp[index + 1] = tmpOrder;

            surveyForm.setData('survey_question', tmp);
            return;
        }

        if (fieldname === 'Delete') {
            if (index === 0) {
                toast.error('Cannot delete first question!');
                return;
            }
            const tmp = surveyForm.data.survey_question.filter(
                (_, i) => i !== index,
            );

            surveyForm.setData('survey_question', tmp);
            return;
        }

        // Resets the choice fields if new type is selected
        if (fieldname === 'type') {
            console.log(index);
            const resetChoice = [...surveyForm.data.survey_question];
            console.log(resetChoice);
            resetChoice[index] = {
                ...resetChoice[index],
                type: value as SurveyQuestionType['type'],
                question_choices: [],
            };

            surveyForm.setData('survey_question', resetChoice);
            return;
        }
        const newSurveyQuestion = surveyForm.data.survey_question.map(
            (question: SurveyQuestionType, i) => {
                if (i !== index) return question;
                return { ...question, [fieldname]: value };
            },
        );

        surveyForm.setData('survey_question', newSurveyQuestion);
    };

    const handleChoices = (
        fieldname: keyof QuestionChoicesType | 'Add new' | 'Delete',
        value: string | number | null,
        outerIndex: number, // Which question
        innerIndex: number | null, //Which choice
    ) => {
        // Retrieves all the queston
        const updatedQuestion = [...surveyForm.data.survey_question];

        // Accesess the choices of the specific question using outerindex
        const updatedChoices = [
            ...(updatedQuestion[outerIndex].question_choices ?? []),
        ];

        // Handles adding another choice
        if (fieldname === 'Add new') {
            // pushes a blank slate to be the new choice
            updatedChoices.push({
                label: '',
                value: '',
                render_order: updatedChoices.length + 1,
            });

            // Updates the question
            updatedQuestion[outerIndex].question_choices = updatedChoices;
            // sets it
            surveyForm.setData('survey_question', [...(updatedQuestion ?? [])]);
            return;
        }

        if (fieldname === 'Delete') {
            if (innerIndex === 0) {
                toast.error('Cannot delete first Choice!!');
                return;
            }
            const deletedChoice = updatedChoices.filter(
                (_, i) => i !== innerIndex,
            );
            updatedQuestion[outerIndex].question_choices = deletedChoice;
            surveyForm.setData('survey_question', [...(updatedQuestion ?? [])]);
            return;
        }

        // Updates the choice of the question using inner index
        if (typeof innerIndex === 'number') {
            updatedChoices[innerIndex] = {
                ...updatedChoices[innerIndex],
                [fieldname]: value,
            };
        }

        // Updates the questions
        updatedQuestion[outerIndex].question_choices = updatedChoices;
        // Saves
        surveyForm.setData('survey_question', updatedQuestion);
    };

    return {
        surveyForm,
        handleFirstLayer,
        handleQuestions,
        handleChoices,
    };
};

export default useSurveyHandler;

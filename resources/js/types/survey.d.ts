type SurveyQuestionType = {
    question_text: string;
    is_required: boolean;
    tempId: string;
    type: 'text' | 'radio' | 'multiple' | 'select' | 'rating';
    question_choices?: QuestionChoicesType[];
};

type QuestionChoicesType = {
    label: string;
    value: string;
    render_order: number;
};

type SurveyType = {
    title: string;
    description: string;
    survey_question: SurveyQuestionType[];
};

type surveyIndex = {
    event_id: number;
    id: number;
    is_active: boolean;
    title: string;
    event: surveyEvent;
    is_facilitator_active: boolean;
    has_facilitator_survey: boolean;
};
type surveyEvent = {
    facility: string;
    id: number;
    type: EventTypeSelection;
    clusters: surveyClusters[];
};
type surveyClusterFacilities = {
    facility_name: string;
    id: number;
};
type surveyClusters = {
    logo_url: string;
    logo: string;
    cluster_name: string;
    event_id: number;
    id: number;
    facilities: surveyClusterFacilities[];
};

type paginatedSurveyIndex = Paginated<surveyIndex>;

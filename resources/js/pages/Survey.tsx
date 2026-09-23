import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';

import { Paperclip } from 'lucide-react';

import { route } from 'ziggy-js';

import { TablePagination } from '@/components/reusable/table-pagination';
import SurveyHeader from '@/components/survey/survey-header';
import SurveyContainer from '@/components/survey/survey-container';
import { Empty, EmptyDescription, EmptyHeader } from '@/components/ui/empty';
import Lottie from 'lottie-react';
import errorAnimation from '../../lottie/NoResult.json';

type SurveyProps = {
    surveys: paginatedSurveyIndex;
};

const Survey = ({ surveys }: SurveyProps) => {
    console.log(surveys);
    // Navigate to show QR page
    const handleCreateEventNavigate = (surveyId: number, eventId: number) => {
        router.get(
            route('survey.showQr', {
                eventId: eventId,
                surveyId: surveyId,
            }),
        );
    };

  

    return (
        <AppLayout>
            <Head title="Survey" />
            <div className="p-6 md:p-12">
                <SurveyHeader></SurveyHeader>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {surveys.data.length > 0 ? (
                        
                        (surveys?.data ?? []).map((survey: surveyIndex) => (
                            <SurveyContainer
                                title={survey.title}
                                is_active={survey.is_active}
                                is_facilitator_active={survey.is_facilitator_active}
                                event_id={survey.event_id}
                                survey_id={survey.id}
                                facility={survey.event}
                                hasFacilitatorSurvey={survey.has_facilitator_survey}
                                handleCreateEventNavigate={() => {
                                    handleCreateEventNavigate(
                                        survey.id,
                                        survey.event_id,
                                    );
                                }}
                            ></SurveyContainer>
                        ))
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
            </div>

            <TablePagination links={surveys.links}></TablePagination>
        </AppLayout>
    );
};

export default Survey;

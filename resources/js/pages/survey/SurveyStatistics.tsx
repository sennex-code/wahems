import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
    CardHeader
} from '@/components/ui/card';



import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Colors,
    BarElement,
    CategoryScale,
    LinearScale,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
    ArrowLeft,
    MessageSquare,
    PersonStanding,
    Star,
    Table,
    ThumbsUp,
    UserCheck,
} from 'lucide-react';
import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { route } from 'ziggy-js';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Lottie from 'lottie-react';
import errorAnimation from '../../../lottie/NoResult.json';
import { Empty, EmptyDescription, EmptyHeader } from '@/components/ui/empty';
import axios from 'axios';
import { set } from 'date-fns';

import { PDFDownloadLink } from '@react-pdf/renderer'; 
import {EvaluationDocument} from '../../pages/pdfTemps/EvaluationPDF';
import { vi } from 'date-fns/locale';

// Register ChartJS components once
ChartJS.register(
    Colors,
    ArcElement,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    ChartDataLabels,
);
interface Facilitator {
    id: number;
    name: string;
    survey_id: number;
}

/**
 * Individual answer within a survey attempt
 */
interface FacilitatorAnswer {
    questionnaire_id: number;
    choice_id: number | null; // Null if it's a text/comment answer
    answer_text: string;      // The numeric value as a string (for ratings) or the raw comment
}

/**
 * A single participant's submission for a facilitator
 */
interface FacilitatorResult {
    participant_id: number;   // The event_participant_id
    participant_name: string;
    submitted_at: string;
    answers: FacilitatorAnswer[];
}

/**
 * The structure of the questionnaire itself (from your $questionnaires variable)
 */
interface FacilitatorChoice {
    id: number;
    choice_text: string;
    value: number;
}

interface QuestionOption {
    id: number;
    questionnaire_id: number;
    choice_id: number;
    choice: FacilitatorChoice;
}

interface FacilitatorQuestionnaire {
    id: number;
    question_title: string; // Updated from 'question'
    question_text: string;  // Updated from 'question'
    question_type: 'rating' | 'text'; // Matches your "rating" and "text" types
    order: number;
    choices: FacilitatorChoice[];
}


const SurveyStatistics = ({
    event,
    survey,
    stats,
    totalRespondents,
    participantsInfo,
    groupTextAnswer,
    surveyName,
    facilitatorSurveyId
}: any) => {
    // State to toggle between the two result sets
    const [faciData, setFaciData] = useState<FacilitatorResult[]>([]);
    const [eventFacilitators, setEventFacilitators] = useState<Facilitator[]>([]);
    const [questionnaires, setQuestionnaires] = useState<FacilitatorQuestionnaire[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFacilitatorId, setSelectedFacilitatorId] = useState(null)
    const [viewMode, setViewMode] = useState('event');
    const [questionnaireStructure, setQuestionnaireStructure] = useState<FacilitatorQuestionnaire[]>([]);

    const [selectedFacilitatorName, setSelectedFacilitatorName] = useState<string>("");


    useEffect(() => {
       console.log(viewMode)
    }, [viewMode]);
/**
 * Type-safe data processing logic.
 * Transforms raw participant answers into grouped metrics for the UI.
 */
const getProcessedResults = (): (FacilitatorQuestionnaire & { 
    answers: FacilitatorAnswer[], 
    averageScore: number, 
    isRating: boolean, 
    responseCount: number 
})[] => {
    const dataArray: FacilitatorResult[] = Array.isArray(faciData) ? faciData : [];
    if (dataArray.length === 0) return [];

    const allAnswers = dataArray.flatMap((r) => r.answers);
    
    // Group answers by questionnaire ID
    const grouped = allAnswers.reduce((acc: Record<number, FacilitatorAnswer[]>, curr) => {
        if (!acc[curr.questionnaire_id]) acc[curr.questionnaire_id] = [];
        acc[curr.questionnaire_id].push(curr);
        return acc;
    }, {});

    return questionnaireStructure
        .sort((a, b) => a.order - b.order)
        .map((question) => {
            const answers = grouped[question.id] || [];
            const isRating = question.question_type === 'rating';
            
            const averageScore = isRating && answers.length > 0
                ? answers.reduce((sum, c) => sum + (Number(c.answer_text) || 0), 0) / answers.length 
                : 0;

            return {
                ...question,
                answers,
                averageScore,
                isRating,
                responseCount: answers.length
            };
        }).filter(q => q.answers.length > 0);
};

const processedData = getProcessedResults();
    // 2. The Fetching Function
  

const fetchFacilitatorResults = async (surveyId: number) => {
    if (!surveyId) return;
    
    setLoading(true);
    try {
        const response = await axios.get(`/facilitator-surveys/results/${event}/${surveyId}`);
        
        // Save the participant answers
        setFaciData(response.data.results || []); 
        console.log("Facilitator Survey Results:", response.data.results);
      
        setQuestionnaireStructure(response.data.questionnaires || []); 
        
    } catch (error) {
        console.error("Error fetching facilitator survey results:", error);
        setFaciData([]);
        setQuestionnaireStructure([]); 
    } finally {
        setLoading(false);
    }
};

   const fetchEventFacilitators = async (eventId: number) => {
    try {
        const response = await axios.get(`/eventFacilitator/${eventId}`);
        // Extract the facilitators array immediately
        setEventFacilitators(response.data.facilitators || []); 
        console.log("Event Facilitators:", response.data.facilitators);
    } catch (error) {
        console.error("Error fetching event facilitators:", error);
        setEventFacilitators([]); // Reset to empty array on error
    }
}


    useEffect(() => {
            console.log("eventID", event);
            fetchEventFacilitators(event);
        }, []);
    // 3. Trigger fetch when switching to facilitator view
   
   

    // Logic for calculating averages
    const average = (stat: any) => {
        const weightedAverage = stat.reduce(
            (sum: any, item: any) => sum + item.avg_count * item.answer_count,
            0,
        );

        return totalRespondents === 0 ? 0 : weightedAverage / totalRespondents;
    };

    // Logic for finding the most selected answer
    const getTopChoice = (items: any[]) => {
        if (!items?.length || totalRespondents === 0) return null;

        const top = items.reduce(
            (best, cur) =>
                (cur.answer_count ?? 0) > (best.answer_count ?? 0) ? cur : best,
            items[0],
        );

        const pct = ((top.answer_count / totalRespondents) * 100).toFixed(0);

        return { label: top.label, count: top.answer_count, pct };
    };

    // Chart Configuration
    const option = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: totalRespondents,
                ticks: {
                    stepSize: 1,
                },
            },
        },
        plugins: {
            datalabels: {
                align: 'top' as const,
                formatter: (
                    value: number,
                    ctx: { dataset: { data: any[] } },
                ) => {
                    const sum = ctx.dataset.data.reduce(
                        (a: number, b: number) => a + b,
                        0,
                    );
                    const percentage = sum > 0 ? ((value / sum) * 100).toFixed(1) + '%' : '0%';
                    return `${value} (${percentage})`;
                },
            },
            legend: {
                display: false,
            },
        },
    };

    return (
        <div className="flex min-h-screen flex-col items-center gap-6 pt-6 px-4">
            <Head title={surveyName}></Head>

            {/* Sticky Navigation and View Switcher */}
            <div className="w-full max-w-4xl flex justify-between items-center bg-background p-2 rounded-lg border sticky top-0 z-10 shadow-sm">
                <Button variant="outline" size="sm" asChild>
                    <Link href={route('survey.index', { survey: survey })}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Link>
                </Button>

                <Tabs value={viewMode} onValueChange={setViewMode} className="w-[400px]">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="event">Event Evaluation</TabsTrigger>
                        <TabsTrigger value="facilitator">Facilitator Evaluation</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="w-20 lg:block hidden"></div> {/* Visual Balance Spacer */}
            </div>

         
                <>
                 {viewMode === 'event' && (
    totalRespondents == 0 ? (
        <Empty className="mt-20">
            <Lottie animationData={errorAnimation} loop={true} className="w-64" />
            <EmptyHeader>No Responses Yet</EmptyHeader>
            <EmptyDescription>
                It looks like no one has submitted their evaluation for this event yet. Please check back later.
            </EmptyDescription>
        </Empty>
    ) : (
        <div className="w-full max-w-4xl space-y-6 flex flex-col items-center">
            {/* Summary Card */}
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="flex justify-between">
                        <Label className="text-lg font-semibold">
                            {totalRespondents} Responses
                        </Label>
                        <Button className="bg-chart-3">
                            <Link
                                className="flex flex-row gap-2"
                                href={route('submission.index', {
                                    survey: survey,
                                })}
                            >
                                View in Table <Table />
                            </Link>
                        </Button>
                    </div>
                    <div className="mt-4 max-h-40 space-y-2 overflow-y-auto border rounded-md p-2">
                        {participantsInfo.map((participant: any) => (
                            <Link
                                href={route('submission.show', {
                                    survey: survey,
                                    submission: participant.survey_submission_id,
                                })}
                                key={participant.email}
                                className="block rounded-md border px-3 py-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                                {participant.email}
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Categorized Question Charts */}
            {Object.entries(stats).map(([category, questionItems]: any) => (
                <div key={category} className="w-full">
                    <div className="flex w-full flex-row justify-between gap-2 rounded-xl border bg-chart-2 p-2 py-3 text-left font-bold text-white mb-4">
                        <div className="flex flex-row gap-2 items-center">
                            <MessageSquare className="ml-2" />
                            {category}
                        </div>
                        <Badge variant="secondary">
                            {Object.keys(questionItems).length} Questions
                        </Badge>
                    </div>

                    {Object.entries(questionItems).map(([key, items]: any) => {
                        const r = average(items).toFixed(2);
                        const topChoice = getTopChoice(items);

                        const chartData = {
                            labels: items.map((o: any) => o.label),
                            datasets: [
                                {
                                    data: items.map((a: any) => a.answer_count),
                                    label: 'Responses',
                                    backgroundColor: [
                                        'rgba(255,99,132,0.4)',
                                        'rgba(255,159,64,0.4)',
                                        'rgba(255,205,86,0.4)',
                                        'rgba(75,192,192,0.4)',
                                        'rgba(54,162,235,0.4)',
                                    ],
                                    borderColor: [
                                        'rgb(255,99,132)',
                                        'rgb(255,159,64)',
                                        'rgb(255,205,86)',
                                        'rgb(75,192,192)',
                                        'rgb(54,162,235)',
                                    ],
                                    borderWidth: 1,
                                },
                            ],
                        };

                        return (
                            <Card key={key} className="my-4">
                                <CardContent className="p-4">
                                    <div className="flex flex-row justify-between items-start mb-4">
                                        <Label className="text-lg font-semibold max-w-[80%]">
                                            {items[0].question_name}
                                        </Label>
                                        {Number(r) > 0 && (
                                            <Badge className="bg-yellow-500">
                                                <Star size={12} className="mr-1 fill-white" />
                                                {r} / 5
                                            </Badge>
                                        )}
                                    </div>

                                    <div
                                        className={cn(
                                            'grid gap-2 p-2 mb-4',
                                            category === 'Open Ended' ? 'grid-cols-2' : 'grid-cols-3',
                                        )}
                                    >
                                        {Number(r) > 0 && (
                                            <Card className="bg-muted/40 p-4 flex flex-col items-center justify-center">
                                                <Star fill="gold" className="text-yellow-500 mb-1" />
                                                <span className="text-[10px] uppercase text-muted-foreground">Avg Rating</span>
                                                <p className="text-xl font-bold">{r}</p>
                                            </Card>
                                        )}

                                        <Card className="bg-muted/40 p-4 flex flex-col items-center justify-center">
                                            <PersonStanding fill="skyblue" className="text-blue-500 mb-1" />
                                            <span className="text-[10px] uppercase text-muted-foreground">Responses</span>
                                            <p className="text-xl font-bold">{totalRespondents}</p>
                                        </Card>

                                        <Card className="bg-muted/40 p-4 flex flex-col items-center justify-center text-center">
                                            <ThumbsUp className="text-green-500 mb-1" />
                                            <span className="text-[10px] uppercase text-muted-foreground">Top Choice</span>
                                            <p className="text-sm font-bold truncate w-full">{topChoice?.label}</p>
                                            <span className="text-[10px] font-light">({topChoice?.pct}%)</span>
                                        </Card>
                                    </div>

                                    {/* Chart Container */}
                                    <div className="flex h-72 items-center justify-center p-2">
                                        <Bar data={chartData} options={option as any} />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ))}

            {/* Qualitative/Text Answers */}
            {Object.entries(groupTextAnswer).map(([category, answers]: any) => (
                <Card key={category} className="w-full">
                    <CardContent className="p-6 space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <MessageSquare /> {category}
                        </h2>
                        <div className="mt-4 max-h-60 space-y-2 overflow-y-auto border rounded-md p-3">
                            {answers.map((answer: any, i: number) => (
                                <div key={i} className="rounded-md border px-3 py-2 text-sm bg-muted/20">
                                    {answer.text_answer}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
)}

                    {/* VIEW MODE: FACILITATOR RESULTS (Ready for $results mapping) */}
  {viewMode === 'facilitator' && (
    <div className="w-full max-w-4xl space-y-6">
        {/* Facilitator Selector */}
       <Card className="p-4 shadow-sm border-t-4 border-chart-2">
    <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        {/* Dropdown Section */}
        <div className="flex flex-col gap-2 w-full">
            <Label className="font-bold text-sm">Facilitator Performance</Label>
            <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-chart-2 outline-none"
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const val = e.target.value;
                    setSelectedFacilitatorId(val as any);
                    
                    const selectedFaci = eventFacilitators.find(f => f.survey_id.toString() === val);
                    if (selectedFaci) {
                        setSelectedFacilitatorName(selectedFaci.name);
                        fetchFacilitatorResults(selectedFaci.survey_id);
                    }
                }}
                value={selectedFacilitatorId || ""}
            >
                <option value="" disabled>
                    {loading ? "Loading Data..." : "Choose a facilitator..."}
                </option>
                {eventFacilitators.map((faci) => (
                    <option key={faci.id} value={faci.survey_id}>
                        {faci.name}
                    </option>
                ))}
            </select>
        </div>

        {/* Download Button Section */}
        {selectedFacilitatorId && processedData.length > 0 && (
<PDFDownloadLink
    document={
        <EvaluationDocument 
            data={{
                facilitatorName: selectedFacilitatorName,
                eventTitle: surveyName,
                metrics: processedData.map(p => ({
                    question: p.question_title,
                    subtitle: p.question_text,
                    average: p.isRating ? p.averageScore.toFixed(2) : null,
                    comments: !p.isRating ? p.answers.map(a => a.answer_text) : [],
                    responseCount: p.responseCount
                }))
            }} 
            // ADD THIS LINE BELOW
            wahHeader={`${window.location.origin}/images/WAHHeader.jpg`} 
        />
    }
    fileName={`Evaluation_${selectedFacilitatorName}.pdf`}
>
    {({ loading }) => (
        <Button disabled={loading}>
            {loading ? 'Generating...' : 'Download PDF'}
        </Button>
    )}
</PDFDownloadLink>
)}
    </div>
</Card>

        {/* Results Display */}
        {!selectedFacilitatorId ? (
            <Card className="border-dashed py-20 flex flex-col items-center justify-center text-center">
                <UserCheck className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                <CardTitle className="text-muted-foreground font-semibold text-xl">No Selection</CardTitle>
                <CardDescription>Select a facilitator to view their specific metrics.</CardDescription>
            </Card>
        ) : (
            <div className="space-y-4">
                {loading ? (
                    <div className="p-10 text-center animate-pulse text-muted-foreground">Fetching results...</div>
                ) : processedData.length === 0 ? (
                    <Card className="p-10 text-center italic text-muted-foreground border-dashed">
                        No evaluation data has been submitted for this facilitator yet.
                    </Card>
                ) : (
                    processedData.map((question) => (
                        <Card key={question.id} className="border-l-4 border-l-chart-2 overflow-hidden shadow-sm">
                            <CardHeader className="p-4 bg-muted/10">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <CardTitle className="text-sm font-bold uppercase tracking-tight">
                                            {question.question_title}
                                        </CardTitle>
                                        <CardDescription className="text-xs mt-1">
                                            {question.question_text}
                                        </CardDescription>
                                    </div>
                                    {question.isRating && (
                                        <Badge className="bg-yellow-500 shrink-0 h-10 text-sm font-black">
                                            <Star className="w-3 h-3 mr-1 fill-white" />
                                            Avg: {question.averageScore.toFixed(2)}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                {question.isRating ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                            <span>Performance Progress</span>
                                            <span>{question.responseCount} Responses</span>
                                        </div>
                                        <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-yellow-500 h-full transition-all duration-500" 
                                                style={{ width: `${(question.averageScore / 5) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Feedback & Comments:</Label>
                                        <div className="grid gap-2">
                                            {question.answers.map((a, idx) => (
                                                <div key={idx} className="p-3 rounded-lg bg-accent/30 text-sm border italic shadow-sm text-foreground/80">
                                                    "{a.answer_text}"
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        )}
    </div>
)}  </>
            
        </div>
    );
};

export default SurveyStatistics;
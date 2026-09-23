import {
    Building,
    CalendarCheck2,
    CalendarX2,
    Pencil,
    Trash,
    NotebookText,
    CalendarDays,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import FacilitatorsModal from './facilitatorModal';
type Facilitator = {
    id: number;
    name: string;
    survey_id?: number | null;
};

type HeaderType = {
    event: any;
    hasExam: boolean;
    editEvent: () => void;
    deleteEvent: () => void;
    exams: () => void;
    involvedFacilities: () => void;
    facilitators: Facilitator[] | null;
};



const MiniBadge = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
        {children}
    </span>
);

const DetailItem = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) => (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
        <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            {icon}
            <span>{label}</span>
        </div>
        <div className="text-sm font-semibold text-foreground md:text-base">
            {value}
        </div>
    </div>
);

export const Header = ({
    event,
    editEvent,
    deleteEvent,
    involvedFacilities,
    exams,
    hasExam,
    facilitators,
}: HeaderType) => {
    const startDate = new Date(event.start_at).toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
    });

    const endDate = new Date(event.end_at).toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
    });

   type Facilitator = {
    id: number;
    name: string;
    survey_id?: number | null;
};


const [showFacilitatorModal,setShowFacilitatorsModal] = useState<boolean>(false);
const [eventFacilitators, setEventFacilitators] = useState<Facilitator[]>([]);

useEffect(() => {
    setEventFacilitators(facilitators as Facilitator[]);
}, [facilitators]);

    console.log("faci from header: ",eventFacilitators);
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 space-y-4">
                    <div className="flex items-start gap-4">
                        {event.type !== 'Cluster' && event.logo && (
                            <img
                                src={event.logo}
                                className="h-16 w-16 shrink-0 rounded-2xl border border-border object-cover md:h-20 md:w-20"
                                alt={event.name}
                            />
                        )}

                        <div className="min-w-0 space-y-2">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-primary" />
                                <h1 className="text-2xl font-black wrap-break-word text-foreground md:text-3xl">
                                    {event.name}
                                </h1>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Review event details, manage actions, and track
                                its schedule.
                            </p>

                            <div className="flex flex-wrap gap-2">
                                <MiniBadge>{event.type}</MiniBadge>
                                <MiniBadge>{event.status}</MiniBadge>
                            </div>

                            <div>
                               <Button onClick={() => setShowFacilitatorsModal(true)}>
                                        Show Facilitators
                                    </Button>
                        </div>
                       
                        </div>
                    </div>
                </div>

               <FacilitatorsModal
                        facilitators={facilitators ?? []}
                        open={showFacilitatorModal}
                        setOpen={setShowFacilitatorsModal}
                    />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap">
                    {event.status === 'Upcoming' && (
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={editEvent}
                            className="w-full xl:w-auto"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit Event
                        </Button>
                    )}

                    {hasExam && (
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={exams}
                            disabled={event.status !== 'Ongoing'}
                            className="w-full xl:w-auto"
                        >
                            <NotebookText className="h-4 w-4" />
                            Exams
                        </Button>
                    )}

                    {event.type === 'Cluster' && (
                        <Button
                            variant="outline"
                            size="lg"
                            type="button"
                            onClick={involvedFacilities}
                            className="w-full xl:w-auto"
                        >
                            <Building className="h-4 w-4" />
                            Involved Facilities
                        </Button>
                    )}

                    <Button
                        variant="destructive"
                        size="lg"
                        onClick={deleteEvent}
                        className="w-full xl:w-auto"
                    >
                        <Trash className="h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {event.type === 'Training' && event.facility && (
                    <DetailItem
                        icon={<Building className="h-4 w-4" />}
                        label="Facility"
                        value={
                            <span className="break-words">
                                {event.facility}
                            </span>
                        }
                    />
                )}

                <DetailItem
                    icon={<CalendarCheck2 className="h-4 w-4" />}
                    label="Start Date"
                    value={startDate}
                />

                <DetailItem
                    icon={<CalendarX2 className="h-4 w-4" />}
                    label="End Date"
                    value={endDate}
                />
            </div>
        </div>
    );
};

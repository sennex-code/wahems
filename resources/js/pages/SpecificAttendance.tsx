import { TablePagination } from '@/components/reusable/table-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader } from '@/components/ui/empty';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Lottie from 'lottie-react';
import {
    BarChart3,
    CalendarDays,
    CheckCircle2,
    Clock3,
    QrCodeIcon,
    Search,
    UserRound,
    XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import { route } from 'ziggy-js';
import errorAnimation from '../../lottie/NoResult.json';
import { Badge } from '@/components/ui/badge';

// Chart.js
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import AttendanceModal from '@/components/attendance/attendance-modal';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import { useDebounce } from '@/hooks/useDebounce';
import AttendanceHeader from '@/components/attendance/attendance-header-';
import AttendanceCards from '@/components/attendance/attendance-cards';
import AttendanceControls from '@/components/attendance/attendance-controls';
import EmptyPlaceHolder from '@/components/reusable/empty';
import SpecificAttendanceTable from '@/components/attendance/specific-attendance-table';
import AttendanceGraph from '@/components/attendance/attendance-graph';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

type paginatedType = {
    data: (EventParticipantType & {
        participant: ParticipantType;
    })[];
    links: {
        active: boolean;
        label: string;
        page: null | string;
        url: string | null;
    }[];
};

type SpecificAttendanceType = {
    eventParticipants: paginatedType;
    numberOfParticipant: number;
    event: EventType;

    dateRange: string[];
    selectedDate: string;
    clusters?: any[];
    filters: {
        search: string;
    };
    presentAbsent: {
        present: number;
        absent: number;
        date_on: string;
    }[];
    attendeeCount: {
        present: number;
        absent: number;
    };
};

const SpecificAttendance = ({
    eventParticipants,
    numberOfParticipant,
    event,

    dateRange,
    selectedDate,
    filters,
    presentAbsent,
    attendeeCount,
}: SpecificAttendanceType) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Attendance',
            href: 'Attendance',
        },
    ];
    const [date, setDate] = useState<string>(selectedDate || '');
    const [viewMode, setViewMode] = useState<ViewModeType>('Participant');
    const [attendanceModal, toggleAttendanceModal] = useState<boolean>(false);

    const [participantAttendance, setParticipantAttendance] =
        useState<AttendanceType>();

    // Use Effect for date filter
    useEffect(() => {
        if (!date) return;
        if (date === selectedDate) return;

        router.get(
            route('attendance.show', { event: event.id }),
            { date, page: 1 },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['attendeeCount', 'eventParticipants', 'selectedDate'],
            },
        );
    }, [date, selectedDate, event]);

    const [search, setSearch] = useState<string | undefined>(
        filters.search || undefined,
    );

    const debounced = useDebounce(search, 1000);

    // Use effect for search
    useEffect(() => {
        // If search is the same from the one already loaded, return
        const loadedSearch = filters.search ?? '';
        const currentSearch = debounced ?? '';

        if (loadedSearch === currentSearch) return;
        // If date is the same form already loaded, return

        router.get(
            route('attendance.show', { event: event.id }),
            {
                // Send debounced as search
                search: currentSearch,
                date,
                // reset back to page 1
                page: 1,
            },
            {
                // Keep current state of component
                preserveState: true,
                // Keep current scroll of component
                preserveScroll: true,
                // Replace history with new one
                replace: true,
                only: ['eventParticipants', 'filters'],
            },
        );
    }, [debounced, date, event.id, filters.search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance" />

            <div className="space-y-6 p-6">
                <AttendanceHeader
                    eventName={event.name}
                    selectedDate={selectedDate}
                    eventType={event.type}
                ></AttendanceHeader>

                <AttendanceCards
                    absent={attendeeCount.absent}
                    present={attendeeCount.present}
                    numberOfParticipant={numberOfParticipant}
                    eventId={event.id}
                ></AttendanceCards>

                <AttendanceControls
                    date={date}
                    setDate={setDate}
                    dateRange={dateRange}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                ></AttendanceControls>

                {/* Search function */}
                <InputGroup className="w-full md:w-[30%]">
                    <InputGroupInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search something!"
                        className="w-full"
                    />
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                </InputGroup>
                {viewMode === 'Graph' ? (
                    <AttendanceGraph
                        numberOfParticipant={numberOfParticipant}
                        presentAbsent={presentAbsent}
                    ></AttendanceGraph>
                ) : eventParticipants.data.length > 0 ? (
                    <>
                        <SpecificAttendanceTable
                            setParticipantAttendance={setParticipantAttendance!}
                            eventParticipants={eventParticipants.data}
                            toggleAttendanceModal={toggleAttendanceModal}
                            eventType={event.type}
                        ></SpecificAttendanceTable>

                        <div>
                            <TablePagination links={eventParticipants.links} />
                        </div>
                    </>
                ) : (
                    <EmptyPlaceHolder></EmptyPlaceHolder>
                )}
            </div>

            {participantAttendance && (
                <AttendanceModal
                    participantAttendance={participantAttendance}
                    attendanceModal={attendanceModal}
                    toggleAttendanceModal={() =>
                        toggleAttendanceModal((prev) => !prev)
                    }
                />
            )}
        </AppLayout>
    );
};

export default SpecificAttendance;

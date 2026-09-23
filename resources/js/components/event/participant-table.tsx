import {
    ClipboardCheck,
    MoreHorizontalIcon,
    Mail,
    Phone,
    UserRound,
    Building2,
    CalendarCheck2,
} from 'lucide-react';
import { SetStateAction, useEffect, useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Empty, EmptyDescription, EmptyHeader } from '../ui/empty';
import Lottie from 'lottie-react';
import errorAnimation from '../../../lottie/NoResult.json';
import { useFacilitiesStore } from '@/hooks/store/facilitiesStore';
import { copyFiveColumns } from '@/hooks/utils/useCopyFiveColumns.utils';
import { Badge } from '@/components/ui/badge';
import event from '@/routes/event';
import { DeleteParticipantConfirmation } from './delete-participant-confirmation';
import axios from 'axios';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';

type ParticipatTableProps = {
    eventParticipants: any;
    handleEditClick: (participant: ParticipantType) => void;
    eventType: EventTypeSelection;
    openAttendance: (attendance: AttendanceType) => void;
    deleteRequest: (participantId: number) => void;
    openAttendanceCode: (attendanceCode: string) => void;
    event_status: string;
};

export const ParticipantTable = ({
    eventParticipants,
    handleEditClick,
    eventType,
    openAttendance,
    openAttendanceCode,

    event_status,
}: ParticipatTableProps) => {
    console.log(eventParticipants);
    const [eventParticipantDeleteModal, toggleEventParticipantDeleteModal] =
        useState<boolean>(false);
    const [eventParticipantID, setEventParticipantId] = useState<number>(0);

   const presentAllAttendance = async (attendanceCode: string) => {
  try {
    await axios.post(`/presentAllAttendance/${attendanceCode}`);
    toast.success('Participants marked as present successfully!');
    window.location.reload();
    
  } catch (error) {
    console.error('Failed to mark as present:', error);
  }
};

    const setFacilitiesInUsed = useFacilitiesStore(
        (state) => state.setFacilitiesInUsed,
    );
    const facilitiesInUsed = useFacilitiesStore(
        (state) => state.facilitiesInUsed,
    );

    const setClustersInUsed = useFacilitiesStore(
        (state) => state.setClustersInUsed,
    );

    const clustersInUsed = useFacilitiesStore((state) => state.clustersInUsed);

    useEffect(() => {
        if (
            eventParticipants.length === 0 ||
            facilitiesInUsed.length > 0 ||
            clustersInUsed.length > 0
        )
            return;

        const participantFacilities = eventParticipants.map(
            (participant: any) => participant.facility_name,
        );

        const filterFacilities: Set<string> = new Set(participantFacilities);
        setFacilitiesInUsed(Array.from(filterFacilities));

        const participantCluster = eventParticipants.map(
            (participant: any) => participant.cluster_id,
        );
        const filterClusters: Set<number> = new Set(participantCluster);
        setClustersInUsed(Array.from(filterClusters));
    }, [
        eventParticipants,
        facilitiesInUsed,
        clustersInUsed,
        setClustersInUsed,
        setFacilitiesInUsed,
    ]);

    return (
        <>
            {eventParticipants.length > 0 ? (
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
                        <TableRow className="hover:bg-transparent">
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Birthday</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Mobile</TableHead>
                            {eventType === 'Cluster' && (
                                <TableHead>Facility</TableHead>
                            )}
                            <TableHead>Total Hours</TableHead>
                            <TableHead>Attendance</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {eventParticipants.map((item: any) => (
                            <TableRow
                                key={item.id}
                                className="transition-colors hover:bg-accent/40"
                            >
                                <TableCell className="font-medium">
                                    {item.participant.id}
                                </TableCell>

                                <TableCell>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <UserRound className="h-4 w-4 text-muted-foreground" />
                                            <div
                                                className="max-w-55 truncate font-medium"
                                                title={`${item.participant.last_name}, ${item.participant.first_name} ${item.participant.middle_initial}.`}
                                            >
                                                {item.participant.full_name}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="text-sm text-muted-foreground">
                                    <div
                                        className="flex max-w-60 items-center gap-2 truncate"
                                        title={item.participant.email}
                                    >
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="truncate">
                                            {item.participant.email}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(
                                        item.participant.birthday,
                                    ).toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric',
                                    })}
                                </TableCell>

                                <TableCell>
                                    <Badge variant="outline">
                                        {item.participant.age}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <Badge variant="secondary">
                                        {item.participant.gender}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <div
                                        className="max-w-40 truncate text-sm text-muted-foreground"
                                        title={item.participant.designation}
                                    >
                                        {item.participant.designation}
                                    </div>
                                </TableCell>

                                <TableCell className="text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {item.participant.mobile_number}
                                        </span>
                                    </div>
                                </TableCell>

                                {eventType === 'Cluster' && (
                                    <TableCell>
                                        <div
                                            className="flex max-w-52 items-center gap-2 truncate text-sm text-muted-foreground"
                                            title={item.facility_name}
                                        >
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <span className="truncate">
                                                {item.facility_name}
                                            </span>
                                        </div>
                                    </TableCell>
                                )}

                                <TableCell>
                                    <Badge variant="outline">
                                        {item.total_hours_attended}
                                    </Badge>
                                </TableCell>

                                <TableCell className="flex items-center gap-2">
                                  
                                          <Button onClick={()=>{presentAllAttendance(item.attendance_code)}} variant="outline" disabled={event_status !== 'Finished'}>
                                                <CalendarCheck2 />
                                            </Button>
                                     
                                     
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                disabled={
                                                    event_status === 'Upcoming'
                                                }
                                                className="disabled:cursor-not-allowed!"
                                            >
                                                <ClipboardCheck />
                                            </Button>
                                         
                                        </PopoverTrigger>

                                        <PopoverContent className="w-80">
                                            <div className="flex flex-wrap gap-2">
                                                {item.attendances.map(
                                                    (
                                                        attendance: any,
                                                        index: number,
                                                    ) => (
                                                        <Button
                                                            key={attendance.id}
                                                            size="sm"
                                                            onClick={() =>
                                                                openAttendance(
                                                                    attendance,
                                                                )
                                                            }
                                                            style={{
                                                                backgroundColor:
                                                                    attendance.hours_attended_color_sceheme,
                                                            }}
                                                        >
                                                            {index + 1}
                                                        </Button>
                                                    ),
                                                )}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>

                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                            >
                                                <MoreHorizontalIcon className="h-4 w-4" />
                                                <span className="sr-only">
                                                    Open menu
                                                </span>
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start"
                                                    onClick={() =>
                                                        copyFiveColumns(item)
                                                    }
                                                >
                                                    Copy
                                                </Button>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem asChild>
                                                <Button
                                                    onClick={() =>
                                                        openAttendanceCode(
                                                            item.attendance_code,
                                                        )
                                                    }
                                                    variant="ghost"
                                                    className="w-full justify-start"
                                                >
                                                    Attendance Code
                                                </Button>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem asChild>
                                                <Button
                                                    className="w-full justify-start"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        const tmp = {
                                                            ...item.participant,
                                                            cluster_id:
                                                                item.cluster_id,
                                                            facility_name:
                                                                item.facility_name,
                                                        };
                                                        handleEditClick(tmp);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem asChild>
                                                <Button
                                                    className="w-full justify-start"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        toggleEventParticipantDeleteModal(
                                                            (prev) => !prev,
                                                        );
                                                        setEventParticipantId(
                                                            item.id,
                                                        );
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <Empty className="py-12">
                    <Lottie
                        loop
                        className="h-auto w-40"
                        animationData={errorAnimation}
                    />
                    <EmptyHeader>
                        <EmptyDescription>
                            No results have been found.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}
            {eventParticipantDeleteModal && (
                <DeleteParticipantConfirmation
                    participantId={eventParticipantID}
                    isDeleteShown={eventParticipantDeleteModal}
                    toggleDeleteModal={toggleEventParticipantDeleteModal}
                ></DeleteParticipantConfirmation>
            )}
        </>
    );
};

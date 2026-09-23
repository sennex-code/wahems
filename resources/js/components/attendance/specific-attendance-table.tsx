import { Dispatch, memo, SetStateAction } from 'react';
import { Card, CardContent } from '../ui/card';
import { Clock3, UserRound, Building2, Eye } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

type SpecificAttendanceTableType = {
    eventType: string;
    eventParticipants: (EventParticipantType & {
        participant: ParticipantType;
    })[];
    toggleAttendanceModal: Dispatch<SetStateAction<boolean>>;
    setParticipantAttendance: Dispatch<
        SetStateAction<AttendanceType | undefined>
    >;
};

const SpecificAttendanceTable = ({
    eventType,
    toggleAttendanceModal,
    eventParticipants,
    setParticipantAttendance,
}: SpecificAttendanceTableType) => {
    const setParticipant = (attendance: AttendanceType) => {
        setParticipantAttendance(attendance);
        toggleAttendanceModal((prev) => !prev);
    };

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
                            <TableRow className="hover:bg-transparent">
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                {eventType === 'Cluster' && (
                                    <TableHead>Facility</TableHead>
                                )}
                                <TableHead>Hours</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">
                                    Details
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {eventParticipants.map((item: any) => {
                                const attendance = item.attendances?.[0];
                                const isPresent = attendance?.hasAttended === 1;

                                return (
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
                                                        className="max-w-60 truncate font-medium"
                                                        title={`${item.participant.last_name}, ${item.participant.first_name} ${item.participant.middle_initial}.`}
                                                    >
                                                        {
                                                            item.participant
                                                                .last_name
                                                        }
                                                        ,{' '}
                                                        {
                                                            item.participant
                                                                .first_name
                                                        }{' '}
                                                        {
                                                            item.participant
                                                                .middle_initial
                                                        }
                                                        .
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {eventType === 'Cluster' && (
                                            <TableCell>
                                                <div
                                                    className="flex max-w-56 items-center gap-2 truncate text-sm text-muted-foreground"
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
                                            <div className="inline-flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-1.5 text-sm font-medium">
                                                <Clock3 className="h-4 w-4 text-muted-foreground" />
                                                {attendance?.hours_attended ??
                                                    0}{' '}
                                                hrs
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant={
                                                    isPresent
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className={
                                                    isPresent
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                        : 'bg-red-100 text-red-700 hover:bg-red-100'
                                                }
                                            >
                                                {isPresent
                                                    ? 'Present'
                                                    : 'Absent'}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-2"
                                                onClick={() => {
                                                    if (attendance) {
                                                        setParticipant(
                                                            attendance,
                                                        );
                                                    }
                                                }}
                                                disabled={!attendance}
                                            >
                                                <span
                                                    className="h-3 w-3 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            attendance?.hours_attended_color_sceheme ||
                                                            '#d4d4d8',
                                                    }}
                                                />
                                                <Eye className="h-4 w-4" />
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default memo(SpecificAttendanceTable);

import { ClipboardCheck, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type ParticipantCardProps = {
    id: number;
    first_name: string;
    last_name: string;
    middle_initial: string;
    email: string;
    birthday: string;
    age: number;
    gender: string;
    designation: string;
    mobileNumber: string;
    eventType: EventTypeSelection;
    totalHoursAttended: number;
    attendances: AttendanceType[];
    facilityName: string;
    openAttendance: (attendance: AttendanceType) => void;
    deleteRequest: (participantId: number) => void;
    openAttendanceCode: (attendanceCode: string) => void;
    attendanceCode: string;
    eventParticipantid: number;
    onEdit: () => void;
};

const ParticipantCard = ({
    id,
    first_name,
    last_name,
    middle_initial,
    email,
    birthday,
    age,
    gender,
    designation,
    mobileNumber,
    totalHoursAttended,
    attendances,
    eventType,
    facilityName,
    openAttendance,
    openAttendanceCode,
    deleteRequest,
    attendanceCode,
    eventParticipantid,
    onEdit,
}: ParticipantCardProps) => {
    const [isCardExpanded, setCardExpanded] = useState(false);

    return (
        <Card className="my-2 overflow-hidden rounded-2xl border">
            <CardHeader className="flex flex-row items-start gap-3 border-b pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                    {id}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                        {last_name}, {first_name} {middle_initial}.
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {email}
                    </p>
                </div>

                <Button
                    type="button"
                    onClick={() => setCardExpanded((prev) => !prev)}
                    className="shrink-0 rounded-md p-2"
                >
                    <Eye />
                    {isCardExpanded ? 'Hide' : 'View'}
                </Button>
            </CardHeader>

            <AnimatePresence initial={false}>
                {isCardExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                    >
                        <CardContent className="my-5 grid grid-cols-2 gap-x-4 gap-y-3 overflow-hidden text-sm">
                            <div>
                                <p className="text-xs">Gender</p>
                                <p className="font-medium">{gender}</p>
                            </div>

                            <div>
                                <p className="text-xs">Age</p>
                                <p className="font-medium">{age}</p>
                            </div>

                            <div>
                                <p className="text-xs">Birthday</p>
                                <p className="font-medium">{birthday}</p>
                            </div>

                            <div>
                                <p className="text-xs">Designation</p>
                                <p className="font-medium">{designation}</p>
                            </div>

                            <div>
                                <p className="text-xs">Mobile</p>
                                <p className="font-medium">{mobileNumber}</p>
                            </div>

                            <div className="col-span-2">
                                <p className="text-xs">Total Hours Attended</p>
                                <p className="font-medium">
                                    {totalHoursAttended}
                                </p>
                            </div>
                            {eventType === 'Cluster' && (
                                <div className="col-span-2">
                                    <p className="text-xs">Cluster</p>
                                    <p className="font-medium">
                                        {facilityName}
                                    </p>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="grid grid-cols-2 gap-2 border-t pt-4">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline">
                                        <ClipboardCheck />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="flex flex-wrap gap-2">
                                    {attendances.map(
                                        (item: any, index: number) => (
                                            <Button
                                                onClick={() =>
                                                    openAttendance(item)
                                                }
                                                key={item.id}
                                                style={{
                                                    backgroundColor:
                                                        item.hours_attended_color_sceheme,
                                                }}
                                            >
                                                {index + 1}
                                            </Button>
                                        ),
                                    )}
                                </PopoverContent>
                            </Popover>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={onEdit}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                    openAttendanceCode(attendanceCode)
                                }
                            >
                                Attendance Code
                            </Button>
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => {
                                    deleteRequest(eventParticipantid);
                                }}
                            >
                                Delete
                            </Button>
                        </CardFooter>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

export default ParticipantCard;

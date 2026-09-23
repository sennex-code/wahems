import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { allowNumbersOnly } from '@/hooks/utils/textRestrictions';

type AttendanceModalProps = {
    participantAttendance: {
        id: number;
        hasAttended: number | boolean;
        hours_attended: number | null;
        date_on?: string;
    };
    attendanceModal: boolean;
    toggleAttendanceModal: () => void;
};

const AttendanceModal = ({
    participantAttendance,
    attendanceModal,
    toggleAttendanceModal,
}: AttendanceModalProps) => {
    const updateAttendance = useForm({
        hasAttended: false,
        hours_attended: 0,
    });

    useEffect(() => {
        if (!participantAttendance) return;

        const attended =
            participantAttendance.hasAttended === 1 ||
            participantAttendance.hasAttended === true;

        updateAttendance.setData({
            hasAttended: attended,
            hours_attended: attended
                ? (participantAttendance.hours_attended ?? 0)
                : 0,
        });
    }, [participantAttendance]);

    const handleSubmitAttendance = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload = {
            hasAttended: updateAttendance.data.hasAttended ? 1 : 0,
            hours_attended: updateAttendance.data.hasAttended
                ? Number(updateAttendance.data.hours_attended)
                : 0,
        };

        updateAttendance.transform(() => payload);

        updateAttendance.put(
            route('attendance.update', {
                attendance: participantAttendance.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Attendance updated!', {
                        position: 'top-right',
                    });
                    toggleAttendanceModal();
                    updateAttendance.reset();
                },
                onError: (errors) => {
                    toast.error('Error updating attendance.', {
                        position: 'top-right',
                    });
                    console.log(errors);
                },
            },
        );
    };

    const isHoursInvalid =
        updateAttendance.data.hasAttended &&
        Number(updateAttendance.data.hours_attended) <= 0;
    const originalHasAttended =
        participantAttendance.hasAttended === 1 ||
        participantAttendance.hasAttended === true;

    const originalHoursAttended = participantAttendance.hours_attended ?? 0;

    const hasNoChanges =
        originalHasAttended === updateAttendance.data.hasAttended &&
        originalHoursAttended === Number(updateAttendance.data.hours_attended);
    return (
        <Dialog open={attendanceModal} onOpenChange={toggleAttendanceModal}>
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={handleSubmitAttendance}>
                    <DialogHeader>
                        <DialogTitle>Edit Attendance</DialogTitle>
                        <DialogDescription>
                            {participantAttendance?.date_on ??
                                'No date available'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 flex flex-row items-center gap-5">
                        <Checkbox
                            checked={updateAttendance.data.hasAttended}
                            onCheckedChange={(checked) => {
                                const attended = !!checked;

                                updateAttendance.setData((prev) => ({
                                    ...prev,
                                    hasAttended: attended,
                                    hours_attended: attended
                                        ? prev.hours_attended || 1
                                        : 0,
                                }));
                            }}
                        />
                        <h1>Has this participant attended?</h1>
                    </div>

                    <Input
                        className="mt-4"
                        step="1"
                        placeholder="Number of hours attended"
                        value={updateAttendance.data.hours_attended}
                        disabled={!updateAttendance.data.hasAttended}
                        onChange={(e) => {
                            updateAttendance.setData(
                                'hours_attended',
                                Number(allowNumbersOnly(e.target.value)),
                            );
                        }}
                    />

                    {updateAttendance.errors.hours_attended && (
                        <p className="mt-2 text-sm text-red-500">
                            {updateAttendance.errors.hours_attended}
                        </p>
                    )}

                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            className="bg-chart-2 text-white transition hover:bg-chart-2/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 disabled:hover:bg-muted"
                            disabled={
                                updateAttendance.processing ||
                                isHoursInvalid ||
                                hasNoChanges
                            }
                        >
                            {updateAttendance.processing
                                ? 'Saving...'
                                : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AttendanceModal;

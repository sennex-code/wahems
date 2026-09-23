import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { Label } from '../ui/label';
import QRCode from 'react-qr-code';
import { Card } from '../ui/card';

type AttendanceCodeModalProps = {
    attendanceCode: string;

    attendanceCodeModal: boolean;
    toggleAttendanceCodeModal: () => void;
};
const AttendanceCodeModal = ({
    attendanceCode,
    attendanceCodeModal,
    toggleAttendanceCodeModal,
}: AttendanceCodeModalProps) => {
    return (
        <Dialog
            open={attendanceCodeModal}
            onOpenChange={toggleAttendanceCodeModal}
        >
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Attendance Code</DialogTitle>
                    <DialogDescription className="justify-centflex-col flex flex-col items-center">
                        <Card className="p-2">
                            <QRCode
                                value={attendanceCode}
                                size={500}
                                style={{
                                    height: 'auto',
                                    maxWidth: '100%',
                                    width: '100%',
                                }}
                            />

                            <Label className="mx-auto mt-5 text-center text-2xl">
                                {attendanceCode}
                            </Label>
                        </Card>
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AttendanceCodeModal;

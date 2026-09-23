import { CheckCircle2, QrCodeIcon, UserRound, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import QRCode from 'react-qr-code';
import { memo } from 'react';

type AttendanceCardType = {
    numberOfParticipant: number;
    present: number;
    absent: number;
    eventId: number | string | undefined;
};

const AttendanceCard = ({
    numberOfParticipant,
    present,
    absent,
    eventId,
}: AttendanceCardType) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="transition-shadow hover:shadow-sm">
                <CardContent className="flex items-center gap-4 p-5">
                    <div className="rounded-md border bg-muted/40 p-3">
                        <UserRound className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="text-2xl font-semibold">
                            {numberOfParticipant}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Registered Participants
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-sm">
                <CardContent className="flex items-center gap-4 p-5">
                    <div className="rounded-md border bg-green-500/10 p-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-semibold">
                            {present ?? 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Present Today
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-sm">
                <CardContent className="flex items-center gap-4 p-5">
                    <div className="rounded-md border bg-red-500/10 p-3">
                        <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-semibold">
                            {absent ?? 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Absent Today
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <QrCodeIcon className="h-4 w-4 text-muted-foreground" />
                        Attendance QR
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Link
                        href={route('user-register-event.show', {
                            eventId: eventId,
                        })}
                        className="block"
                    >
                        <div className="mx-auto w-full max-w-45 rounded-lg border bg-white p-3">
                            <QRCode
                                size={500}
                                style={{
                                    height: 'auto',
                                    maxWidth: '100%',
                                    width: '100%',
                                }}
                                value={`${eventId}`}
                                viewBox="0 0 256 256"
                            />
                        </div>
                    </Link>
                    <p className="mt-3 text-xs text-muted-foreground">
                        Open registration QR for this event.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default memo(AttendanceCard);

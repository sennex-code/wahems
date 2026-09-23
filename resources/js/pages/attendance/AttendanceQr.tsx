import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import event from '@/routes/event';
import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import QRCode from 'react-qr-code';
import { route } from 'ziggy-js';

type SubmitAttendanceType = {
    eventId: string;
};

const SubmitAttendance = ({ eventId }: SubmitAttendanceType) => {
    const regex = window.location.href.match(
        /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/gim,
    );
    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-linear-to-br from-black via-indigo-950 to-purple-950">
            <motion.div
                key={'show-register'}
                initial={{ opacity: 0.1, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
            >
                <Card className="">
                    <div className="flex flex-col items-center justify-center">
                        <Label className="px-5 text-center text-3xl">
                            Attendance
                        </Label>
                    </div>
                    <CardContent className="flex flex-col items-center">
                        <div className="transition-scale duration-100 hover:scale-[1.01] md:w-[50%]">
                            <Card className="transition-bg col-span-1">
                                <CardContent>
                                    <Link
                                        href={route(
                                            'attendanceSubmission.verify',
                                            {
                                                eventId: eventId,
                                            },
                                        )}
                                    >
                                        <QRCode
                                            size={500}
                                            style={{
                                                height: 'auto',
                                                maxWidth: '100%',
                                                width: '100%',
                                            }}
                                            value={`${regex}:8000/attendance/event/${eventId}/verify}`}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                        <CardDescription className="mt-2">
                            Scan this to redirect to attendance submission
                        </CardDescription>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default SubmitAttendance;

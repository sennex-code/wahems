import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import QRCode from 'react-qr-code';
import { route } from 'ziggy-js';

type EventQrType = {
    eventId: number;
    surveyId: number;
    surveyName: string;
};

const EventQr = ({ eventId, surveyId, surveyName }: EventQrType) => {
    const regex = window.location.href.match(
        /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/gim,
    );

    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-linear-to-br from-black via-indigo-950 to-purple-950">
            <Head title={surveyName}></Head>
            <motion.div
                key={'show-register'}
                initial={{ opacity: 0.1, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
            >
                <Card className="">
                    <div className="flex flex-col items-center justify-center">
                        <Label className="px-5 text-center text-3xl">
                            Survey Evaluation
                        </Label>
                    </div>
                    <CardContent className="flex flex-col items-center justify-center gap-8">
    <div className="flex w-full flex-col items-center justify-center gap-8 lg:flex-row">
        {/* ✅ FIRST QR CODE - Regular Survey */}
        <div className="flex w-full flex-col items-center lg:w-1/2">
            <Label className="mb-3 block text-center text-sm font-semibold">
                Event Evaluation QR
            </Label>
            <div className="transition-scale duration-100 hover:scale-[1.01]">
                <Card className="transition-bg">
                    <CardContent className="p-4">
                        <Link
                            href={route('verification.show', {
                                event: eventId,
                                survey: surveyId,
                            })}
                        >
                            <QRCode
                                size={400}
                                style={{
                                    height: 'auto',
                                    maxWidth: '100%',
                                    width: '100%',
                                }}
                                value={`${regex}/event/${eventId}/survey/${surveyId}}`}
                                viewBox={`0 0 256 256`}
                            />
                        </Link>
                    </CardContent>
                </Card>
            </div>
            <CardDescription className="mt-3 text-center">
                Scan this for survey evaluation
            </CardDescription>
        </div>

        {/* ✅ SECOND QR CODE - Facilitator Survey */}
        <div className="flex w-full flex-col items-center lg:w-1/2">
            <Label className="mb-3 block text-center text-sm font-semibold">
                Facilitator Evaluation QR
            </Label>
            <div className="transition-scale duration-100 hover:scale-[1.01]">
                <Card className="transition-bg">
                    <CardContent className="p-4">
                        <Link
                            href={route('facilitator-surveys.verifyForm', {
                                event: eventId,
                            })}
                        >
                            <QRCode
                                size={400}
                                style={{
                                    height: 'auto',
                                    maxWidth: '100%',
                                    width: '100%',
                                }}
                                value={`${regex}/events/${eventId}/facilitator-surveys/verify`}
                                viewBox={`0 0 256 256`}
                            />
                        </Link>
                    </CardContent>
                </Card>
            </div>
            <CardDescription className="mt-3 text-center">
                Scan this for facilitator evaluation
            </CardDescription>
        </div>
    </div>
</CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default EventQr;
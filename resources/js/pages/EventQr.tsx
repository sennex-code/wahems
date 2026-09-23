import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Lottie from 'lottie-react';
import { motion } from 'motion/react';
import { useRef } from 'react';
import QRCode from 'react-qr-code';
import success from '../../lottie/success.json';
import { ClipboardCopy, Download } from 'lucide-react';
import { toast } from 'sonner';

type EventQrProps = {
    participant: {
        first_name: string;
        last_name: string;
        middle_initial?: string;
    };
    attendance_code: string;
};

const EventQr = ({ participant, attendance_code }: EventQrProps) => {
    const qrRef = useRef<HTMLDivElement>(null);

    const downloadPng = async () => {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);

        const svgBlob = new Blob([svgString], {
            type: 'image/svg+xml;charset=utf-8',
        });
        const svgUrl = URL.createObjectURL(svgBlob);

        const img = new Image();

        img.onload = () => {
            const size = 700;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(svgUrl);
                return;
            }

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);

            const pngUrl = canvas.toDataURL('image/png');

            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `QR-${participant.last_name}-${participant.first_name}-${attendance_code}.png`;
            a.click();

            URL.revokeObjectURL(svgUrl);
        };

        img.onerror = () => {
            URL.revokeObjectURL(svgUrl);
            toast.error('Failed to download QR code.');
        };

        img.src = svgUrl;
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(attendance_code);
            toast.success('Attendance code copied!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to copy attendance code.');
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-black via-indigo-950 to-purple-950 p-4 sm:p-6">
            <motion.div
                key="show-register"
                initial={{ opacity: 0.1, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-md sm:max-w-lg"
            >
                <Card className="w-full rounded-2xl shadow-xl">
                    <CardContent className="p-5 sm:p-7">
                        <div className="flex flex-col items-center text-center">
                            <img
                                        src="/images/JHUWan-Modern.png"
                                        alt=""
                                        className="float-anim w-50"
                                        />
                            <Label className="mt-2 text-center text-xl leading-snug font-semibold sm:text-2xl md:text-3xl">
                                You&apos;ve been registered to the event!
                            </Label>

                            <p className="mt-2 max-w-sm text-sm text-muted-foreground sm:text-base">
                                Please save this QR code for your attendance
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col items-center">
                            <div
                                ref={qrRef}
                                className="rounded-xl bg-white p-4 shadow-sm sm:p-5"
                            >
                                <QRCode
                                    value={attendance_code}
                                    size={200}
                                    className="h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56"
                                />
                            </div>

                            <h1 className="mt-4 text-center text-base font-medium sm:text-lg">
                                {participant.last_name},{' '}
                                {participant.first_name}{' '}
                                {participant.middle_initial ?? ''}
                            </h1>

                            <p className="mt-1 text-center text-sm break-all text-muted-foreground">
                                {attendance_code}
                            </p>

                            <div className="mt-5 flex w-full flex-col gap-3 sm:flex-row">
                                <Button
                                    onClick={downloadPng}
                                    className="w-full sm:flex-1"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download QR
                                </Button>

                                <Button
                                    type="button"
                                    onClick={copyToClipboard}
                                    className="w-full sm:w-10 sm:px-0"
                                >
                                    <ClipboardCopy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default EventQr;

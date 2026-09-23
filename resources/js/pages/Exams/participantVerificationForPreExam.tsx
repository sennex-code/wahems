import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';


import { motion } from 'motion/react';
import Lottie from 'lottie-react';

import success from '../../../lottie/success.json';

import useQrReader from '@/hooks/queries/useQrReader';

type Props = {
    eventId: number;
    examType: 'pre' | 'post';
    examTitle: string;
};

export default function ParticipationVerification({
    eventId,
    examType,
    examTitle,
}: Props) {
    const [code, setCode] = useState('');
    const [ready, setReady] = useState(false);

    const proceed = () => {
        const attendance_code = code.trim();
        if (!attendance_code) return;

        router.post(
            route('exam.startAttempt', { eventId, examType }),
            { attendance_code },
            {
                onError: (e: any) =>
                    toast.error(e?.attendance_code ?? 'Invalid code'),
            },
        );
    };

    const cancel = () => {
        window.close();
        setTimeout(() => {
            try {
                window.history.back();
            } catch {}
        }, 100);
    };

    const { inputRef, textRef, qr, scanning, startScanner, stopScanner } =
        useQrReader({
            readerId: 'participation-verification-reader',
            setVerificationCode: (val) => {
                const v =
                    typeof val === 'string'
                        ? val.trim()
                        : String(val ?? '').trim();
                setCode(v);
                setReady(v.length > 0);
            },
        });

    useEffect(() => {
        if (ready) stopScanner();
    }, [ready, stopScanner]);

    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-linear-to-br from-black via-indigo-950 to-purple-950">
            <motion.div
                key="participation-verification"
                initial={{ opacity: 0.1, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
            >
                <Card className="w-[420px] px-5 py-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center">
                              <img
                                        src="/images/JHUWan-Modern.png"
                                        alt=""
                                        className="float-anim"
                                        />

                            <div className="mb-4 text-center">
                                <div className="text-lg font-semibold">
                                    {examTitle}
                                </div>
                                <div className="text-sm ">
                                    Scan/upload your QR or enter your attendance
                                    code, then proceed.
                                </div>
                            </div>

                            {/* CAMERA QR SCANNER */}
                           <div className="w-full">
    <div
        id="participation-verification-reader"
        className={[
            'w-full overflow-hidden rounded-md bg-black/30 transition-[height,margin] duration-200',
            scanning
                ? 'mb-4 aspect-square'
                : 'mb-0 h-0',
        ].join(' ')}
    />

    <div className="mb-4 flex gap-2">
        {!scanning ? (
            <Button
                type="button"
                onClick={startScanner}
                className="w-1/2"
            >
                Scan QR
            </Button>
        ) : (
            <Button
                type="button"
                variant="secondary"
                onClick={stopScanner}
                className="w-1/2"
            >
                Stop
            </Button>
        )}

        <Button
            type="button"
            variant="secondary"
            className="w-1/2"
            onClick={() => inputRef.current?.click()}
        >
            Upload QR
        </Button>

        <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={qr.mutate}
        />
    </div>
</div>

                            {/* MANUAL CODE INPUT */}
                            <Field className="w-full max-w-sm">
                                <FieldLabel>Attendance Code</FieldLabel>
                                <InputGroup ref={textRef as any}>
                                    <InputGroupInput
                                        value={code}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setCode(v);
                                            setReady(v.trim().length > 0);
                                        }}
                                        placeholder="Enter your attendance code"
                                    />
                                </InputGroup>

                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={cancel}
                                        className="w-full"
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={proceed}
                                        disabled={!ready}
                                        className="w-full"
                                    >
                                        Proceed
                                    </Button>
                                </div>
                            </Field>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
